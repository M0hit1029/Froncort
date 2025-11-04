-- Add project sharing with proper RLS policies
-- This migration enables project members to access shared projects

-- Drop existing project policies
DROP POLICY IF EXISTS "Allow read own or public projects" ON public.projects;
DROP POLICY IF EXISTS "Allow insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Allow update own projects" ON public.projects;
DROP POLICY IF EXISTS "Allow delete own projects" ON public.projects;

-- Create new policies that consider project membership
-- Allow users to read projects they own, are members of, or are public
CREATE POLICY "Allow read own, shared, or public projects"
ON public.projects
FOR SELECT
USING (
  auth.uid() = owner_id 
  OR visibility = 'public'
  OR EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
  )
);

-- Allow users to insert only their own projects
CREATE POLICY "Allow insert own projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Allow project owners to update their projects
CREATE POLICY "Allow update own projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = owner_id);

-- Allow project owners to delete their projects
CREATE POLICY "Allow delete own projects"
ON public.projects
FOR DELETE
USING (auth.uid() = owner_id);

-- Update project_members policies to allow owners/admins to manage members
DROP POLICY IF EXISTS "Members can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Project owners and admins can add members" ON public.project_members;

-- Allow users to view members of projects they have access to
CREATE POLICY "Allow view project members"
ON public.project_members
FOR SELECT
USING (
  -- Can view if they're a member of the project
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
  )
  OR
  -- Can view if they own the project
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
  )
  OR
  -- Can view if project is public
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
      AND projects.visibility = 'public'
  )
);

-- Allow owners and admins to add members
CREATE POLICY "Allow owners and admins to add members"
ON public.project_members
FOR INSERT
WITH CHECK (
  -- Project owner can add members
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
  )
  OR
  -- Project admins can add members
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
  )
);

-- Allow owners and admins to update member roles
CREATE POLICY "Allow owners and admins to update members"
ON public.project_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
  )
);

-- Allow owners and admins to remove members
CREATE POLICY "Allow owners and admins to remove members"
ON public.project_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
  )
);

-- Update documents policies to allow project members to access documents
DROP POLICY IF EXISTS "Project members can view documents" ON public.documents;
DROP POLICY IF EXISTS "Project members can create documents" ON public.documents;
DROP POLICY IF EXISTS "Project members can update documents" ON public.documents;

CREATE POLICY "Allow project members to view documents"
ON public.documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = documents.project_id
      AND project_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = documents.project_id
      AND (projects.owner_id = auth.uid() OR projects.visibility = 'public')
  )
);

CREATE POLICY "Allow project editors to create documents"
ON public.documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = documents.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = documents.project_id
      AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Allow project editors to update documents"
ON public.documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = documents.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = documents.project_id
      AND projects.owner_id = auth.uid()
  )
);

-- Update kanban boards policies to allow project members to access boards
DROP POLICY IF EXISTS "Project members can view kanban boards" ON public.kanban_boards;

CREATE POLICY "Allow project members to view kanban boards"
ON public.kanban_boards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = kanban_boards.project_id
      AND project_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = kanban_boards.project_id
      AND (projects.owner_id = auth.uid() OR projects.visibility = 'public')
  )
);

-- Add policies for creating/updating kanban boards
CREATE POLICY "Allow project editors to create kanban boards"
ON public.kanban_boards
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = kanban_boards.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = kanban_boards.project_id
      AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Allow project editors to update kanban boards"
ON public.kanban_boards
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = kanban_boards.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = kanban_boards.project_id
      AND projects.owner_id = auth.uid()
  )
);

-- Update kanban columns policies
DROP POLICY IF EXISTS "Project members can view kanban columns" ON public.kanban_columns;

CREATE POLICY "Allow project members to view kanban columns"
ON public.kanban_columns
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kanban_boards kb
    JOIN public.project_members pm ON pm.project_id = kb.project_id
    WHERE kb.id = kanban_columns.board_id
      AND pm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.kanban_boards kb
    JOIN public.projects p ON p.id = kb.project_id
    WHERE kb.id = kanban_columns.board_id
      AND (p.owner_id = auth.uid() OR p.visibility = 'public')
  )
);

-- Add policies for creating/updating kanban columns
CREATE POLICY "Allow project editors to create kanban columns"
ON public.kanban_columns
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kanban_boards kb
    JOIN public.project_members pm ON pm.project_id = kb.project_id
    WHERE kb.id = kanban_columns.board_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.kanban_boards kb
    JOIN public.projects p ON p.id = kb.project_id
    WHERE kb.id = kanban_columns.board_id
      AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Allow project editors to update kanban columns"
ON public.kanban_columns
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.kanban_boards kb
    JOIN public.project_members pm ON pm.project_id = kb.project_id
    WHERE kb.id = kanban_columns.board_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.kanban_boards kb
    JOIN public.projects p ON p.id = kb.project_id
    WHERE kb.id = kanban_columns.board_id
      AND p.owner_id = auth.uid()
  )
);

-- Update kanban cards policies
DROP POLICY IF EXISTS "Project members can view kanban cards" ON public.kanban_cards;

CREATE POLICY "Allow project members to view kanban cards"
ON public.kanban_cards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kanban_columns kc
    JOIN public.kanban_boards kb ON kb.id = kc.board_id
    JOIN public.project_members pm ON pm.project_id = kb.project_id
    WHERE kc.id = kanban_cards.column_id
      AND pm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.kanban_columns kc
    JOIN public.kanban_boards kb ON kb.id = kc.board_id
    JOIN public.projects p ON p.id = kb.project_id
    WHERE kc.id = kanban_cards.column_id
      AND (p.owner_id = auth.uid() OR p.visibility = 'public')
  )
);

-- Add policies for creating/updating kanban cards
CREATE POLICY "Allow project editors to create kanban cards"
ON public.kanban_cards
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kanban_columns kc
    JOIN public.kanban_boards kb ON kb.id = kc.board_id
    JOIN public.project_members pm ON pm.project_id = kb.project_id
    WHERE kc.id = kanban_cards.column_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.kanban_columns kc
    JOIN public.kanban_boards kb ON kb.id = kc.board_id
    JOIN public.projects p ON p.id = kb.project_id
    WHERE kc.id = kanban_cards.column_id
      AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Allow project editors to update kanban cards"
ON public.kanban_cards
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.kanban_columns kc
    JOIN public.kanban_boards kb ON kb.id = kc.board_id
    JOIN public.project_members pm ON pm.project_id = kb.project_id
    WHERE kc.id = kanban_cards.column_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.kanban_columns kc
    JOIN public.kanban_boards kb ON kb.id = kc.board_id
    JOIN public.projects p ON p.id = kb.project_id
    WHERE kc.id = kanban_cards.column_id
      AND p.owner_id = auth.uid()
  )
);

-- Update activities policies to allow project members to view activities
DROP POLICY IF EXISTS "Project members can view activities" ON public.activities;

CREATE POLICY "Allow project members to view activities"
ON public.activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = activities.project_id
      AND project_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = activities.project_id
      AND (projects.owner_id = auth.uid() OR projects.visibility = 'public')
  )
);

-- Add policy for creating activities
CREATE POLICY "Allow project members to create activities"
ON public.activities
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = activities.project_id
      AND project_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = activities.project_id
      AND projects.owner_id = auth.uid()
  )
);

-- Create function to automatically add owner as project member
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert owner as a member with 'owner' role
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (project_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add owner as member when project is created
DROP TRIGGER IF EXISTS add_owner_as_member_trigger ON public.projects;
CREATE TRIGGER add_owner_as_member_trigger
AFTER INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION add_owner_as_member();
