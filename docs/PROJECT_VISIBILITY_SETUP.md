# Project Visibility and Database Connection Setup

This document describes the changes made to fix the database connections and implement project visibility features.

## Changes Overview

### 1. Database Schema Updates

A new migration file `supabase/migrations/002_add_project_visibility.sql` has been created to:

- Add a `visibility` column to the `projects` table (values: `'public'` or `'private'`)
- Update Row-Level Security (RLS) policies to support visibility
- Add database indexes for better query performance

**To apply this migration:**

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/002_add_project_visibility.sql`
4. Run the migration

### 2. RLS Policies

The following RLS policies have been implemented:

#### Read Policy
```sql
CREATE POLICY "Allow read own or public projects"
ON public.projects
FOR SELECT
USING (auth.uid() = owner_id OR visibility = 'public');
```
- Users can read their own projects (where they are the owner)
- Users can read all public projects

#### Insert Policy
```sql
CREATE POLICY "Allow insert own projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = owner_id);
```
- Users can only create projects where they are the owner

#### Update Policy
```sql
CREATE POLICY "Allow update own projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = owner_id);
```
- Users can only update their own projects

#### Delete Policy
```sql
CREATE POLICY "Allow delete own projects"
ON public.projects
FOR DELETE
USING (auth.uid() = owner_id);
```
- Users can only delete their own projects

### 3. Enhanced Supabase Client

The Supabase client (`lib/supabase.ts`) now includes:

- **Environment variable validation**: Checks if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured
- **Connection testing**: Automatically tests the connection on initialization (client-side only)
- **Clear error logging**: Provides helpful error messages when configuration is missing or connection fails
- **Graceful degradation**: The app can build without environment variables set

### 4. Project Service Layer

A new service layer (`lib/services/projects.ts`) provides:

- `fetchProjects()`: Fetch all accessible projects (own + public)
- `createProject()`: Create a new project with visibility setting
- `updateProject()`: Update project details or visibility
- `deleteProject()`: Delete a project
- `subscribeToProjects()`: Real-time subscriptions for project changes

### 5. Real-Time Updates

Projects now sync in real-time using Supabase Realtime:

- When a new public project is created, all users see it immediately
- When a project's visibility changes from private to public, it appears for all users
- When a project is deleted, it's removed from all clients
- Implemented via `useProjectSync` hook in `MainLayout`

### 6. Updated Project Store

The `project-store.ts` now:

- Integrates with Supabase for persistent storage
- Supports async operations with loading and error states
- Maintains real-time sync with the database
- Provides feedback on operation success/failure

### 7. Enhanced Project Manager UI

The Project Manager component now includes:

- **Visibility selector**: Choose between Public and Private when creating projects
- **Success/error messages**: Clear feedback on all operations
- **Visual indicators**: Shows project visibility status with icons
- **Owner indicators**: Shows which projects are shared vs owned
- **Delete protection**: Only owners can delete their projects

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Run Database Migrations

1. Log in to your Supabase dashboard
2. Go to SQL Editor
3. Run the migration from `supabase/migrations/002_add_project_visibility.sql`

### 3. Verify Setup

Start the application:

```bash
npm run dev:all
```

Check the browser console for:
- ✅ "Supabase connection successful"
- ✅ "Subscribed to project changes"

If you see errors, verify your environment variables are correct.

## Usage

### Creating a Project

1. Click the settings icon in the sidebar or "Create a project" link
2. Click "Create New Project"
3. Enter project name and description
4. Select visibility:
   - **Private**: Only you can see this project
   - **Public**: Anyone can view this project
5. Click "Create"

You'll see a success message when the project is created and saved to the database.

### Viewing Projects

- **Your Projects**: All projects you own (both public and private)
- **Shared Projects**: Public projects created by others
- Projects are marked with visibility badges (Public/Private)
- Shared projects show a "Shared" badge

### Deleting Projects

- Only project owners can delete their projects
- The delete button is hidden for shared projects
- A confirmation dialog appears before deletion

## Real-Time Collaboration

When multiple users are online:

1. **User A creates a public project** → User B sees it immediately
2. **User A changes visibility to private** → Project disappears from User B's list
3. **User A deletes a project** → Removed from all users' views in real-time

## Troubleshooting

### Projects not saving to database

Check console for error messages. Common issues:

1. **Missing environment variables**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **Migration not run**: Apply the migration in Supabase SQL Editor
3. **RLS policies**: Ensure policies are created (check Supabase dashboard → Authentication → Policies)

### Real-time updates not working

1. Ensure you're using a valid Supabase project
2. Check that Realtime is enabled in Supabase dashboard
3. Verify the console shows "✅ Subscribed to project changes"
4. Check browser console for WebSocket errors

### Build errors

If you see build errors related to Supabase:

1. Make sure environment variables are set in your build environment
2. The app should gracefully handle missing env vars during build
3. Check that all TypeScript types are correctly defined

## Testing

To test the implementation:

1. **Create a private project**: Verify it's not visible to other users
2. **Create a public project**: Verify other users can see it
3. **Update visibility**: Change private → public, verify others see it
4. **Delete project**: Verify it's removed from all users
5. **Check RLS**: Try accessing another user's private project (should fail)

## Migration from Old Schema

If you have existing projects in the database without visibility:

1. The migration sets default visibility to `'private'`
2. All existing projects become private
3. Users should manually update visibility if they want projects to be public

## Future Enhancements

Potential improvements:

- [ ] Project member management (invite users to private projects)
- [ ] Different access levels (read-only, edit, admin)
- [ ] Project categories/tags
- [ ] Search and filter by visibility
- [ ] Bulk visibility updates
- [ ] Activity log for visibility changes
