-- Add visibility column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private' 
CHECK (visibility IN ('public', 'private'));

-- Drop existing project policies
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;

-- Create new policies for project visibility
-- Allow users to read their own projects or public projects
CREATE POLICY "Allow read own or public projects"
ON public.projects
FOR SELECT
USING (auth.uid() = owner_id OR visibility = 'public');

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

-- Create index on visibility for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON public.projects(visibility);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
