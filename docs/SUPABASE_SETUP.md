# Supabase Setup Guide

This document describes how to set up Supabase for the Froncort collaborative editing platform.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project

## Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under API.

## Database Schema

Run the following SQL in the Supabase SQL editor to create the necessary tables:

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read all users
CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### Projects Table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read projects they are members of"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their projects"
  ON projects FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their projects"
  ON projects FOR DELETE
  USING (owner_id = auth.uid());
```

### Project Members Table

```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read project members for their projects"
  ON project_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage project members"
  ON project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
    )
  );
```

### Documents Table

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  parent_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  last_edited_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read documents in their projects"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = documents.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create documents"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = documents.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can update documents"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = documents.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = documents.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
    )
  );

-- Create index for faster queries
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_parent_id ON documents(parent_id);
```

### Document Versions Table

```sql
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read versions of documents they can access"
  ON document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN project_members pm ON pm.project_id = d.project_id
      WHERE d.id = document_versions.document_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create versions"
  ON document_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN project_members pm ON pm.project_id = d.project_id
      WHERE d.id = document_versions.document_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin', 'editor')
    )
  );

-- Create index
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
```

### Presence Table (Real-time)

```sql
CREATE TABLE presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  cursor_position JSONB,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, document_id)
);

-- Enable Row Level Security
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read presence in their documents"
  ON presence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN project_members pm ON pm.project_id = d.project_id
      WHERE d.id = presence.document_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own presence"
  ON presence FOR ALL
  USING (user_id = auth.uid());

-- Create index
CREATE INDEX idx_presence_document_id ON presence(document_id);

-- Auto-delete stale presence (older than 1 minute)
CREATE OR REPLACE FUNCTION delete_stale_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM presence
  WHERE last_seen < NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to clean up stale presence every minute
-- (requires pg_cron extension)
-- SELECT cron.schedule('delete-stale-presence', '* * * * *', 'SELECT delete_stale_presence()');
```

## Enable Realtime

In the Supabase dashboard:

1. Go to Database → Replication
2. Enable replication for the following tables:
   - documents
   - presence
   - project_members

## Authentication Setup

Froncort uses Supabase Auth. To enable:

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates if needed
4. Optionally enable other providers (Google, GitHub, etc.)

## Storage (Optional)

For file uploads:

1. Go to Storage
2. Create a bucket named `documents`
3. Set up storage policies as needed

## Testing

After setup, test the connection:

```javascript
import { supabase } from '@/lib/supabase';

// Test connection
const { data, error } = await supabase.from('projects').select('*');
console.log('Projects:', data, 'Error:', error);
```

## Migrations

To apply schema changes, use Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Create a migration
supabase db diff --schema public > supabase/migrations/your_migration_name.sql

# Push changes
supabase db push
```

## Next Steps

1. Update `.env.local` with your Supabase credentials
2. Run the SQL scripts above in the Supabase SQL editor
3. Enable realtime for the specified tables
4. Test the integration with your application
5. Set up authentication flows
6. Configure storage if needed for file uploads

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and anon key are correct
- Check that RLS policies are properly configured
- Ensure your IP is not blocked

### Realtime Not Working
- Verify replication is enabled for the tables
- Check that your client is subscribed to the correct channels
- Ensure the user has proper permissions

### Performance Issues
- Add indexes on frequently queried columns
- Use proper filtering in queries
- Consider using database functions for complex operations
