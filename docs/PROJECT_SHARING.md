# Project Sharing Feature

This document describes the project sharing functionality that enables collaborative access to projects, documents, Kanban boards, and activity feeds.

## Overview

The project sharing feature allows project owners to invite other users to collaborate on their projects. When a user is added to a project, they automatically gain access to:

- **All Documents** within the project
- **All Kanban Boards** within the project  
- **Activity Feed** for the project

## User Roles

Each project member can have one of the following roles:

### Owner
- Created the project
- Full control over the project
- Can manage all members
- Can delete the project
- Automatically added as a member when project is created

### Admin
- Can manage project members (add/remove/update roles)
- Can create, edit, and delete documents and boards
- Full access to all project resources

### Editor
- Can create and edit documents
- Can create and manage Kanban cards
- Cannot manage project members
- Cannot delete the project

### Viewer
- Read-only access to all project resources
- Can view documents, boards, and activity feed
- Cannot make any changes

## How to Share a Project

### For Project Owners:

1. **Open Project Manager**
   - Click on the project dropdown in the sidebar
   - Select "Manage Projects"

2. **Select Project to Share**
   - Find the project you want to share
   - Click the "Share" button (share icon)

3. **Invite Users**
   - In the sharing dialog, search for users by email
   - Select the appropriate role (Viewer, Editor, or Admin)
   - Click the "+" button to add them

4. **Manage Existing Members**
   - View all current project members
   - Change member roles using the dropdown
   - Remove members using the trash icon

### For Shared Users:

1. **Access Shared Projects**
   - Open the project dropdown in the sidebar
   - You'll see projects shared with you marked as "Shared"
   - Select a project to switch to it

2. **View Project Content**
   - All documents, boards, and activities for the project are automatically accessible
   - Navigate using the sidebar or the project overview page

## Database Schema

### Project Members Table

```sql
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);
```

## Row Level Security (RLS)

The sharing feature is enforced through PostgreSQL Row Level Security policies:

### Project Access
- Users can view projects they own, are members of, or that are public
- Only owners can update or delete projects

### Document Access
- Members can view documents in projects they have access to
- Editors and above can create/edit documents
- Viewers have read-only access

### Kanban Board Access
- Members can view boards in projects they have access to
- Editors and above can create/edit boards and cards
- Viewers have read-only access

### Activity Feed Access
- Members can view activities in projects they have access to
- Members can create activities when they perform actions
- Activities are automatically logged for project events

## API Functions

### Fetch Project Members
```typescript
fetchProjectMembers(projectId: string)
```
Returns all members of a project with their roles and join dates.

### Add Project Member
```typescript
addProjectMember(projectId: string, userId: string, role: UserRole)
```
Adds a new member to the project with the specified role.

### Update Member Role
```typescript
updateProjectMemberRole(projectId: string, userId: string, role: UserRole)
```
Changes the role of an existing project member.

### Remove Project Member
```typescript
removeProjectMember(projectId: string, userId: string)
```
Removes a member from the project.

### Search Users
```typescript
searchUsersByEmail(email: string)
```
Searches for users by email address to invite them to projects.

## Real-time Updates

The sharing feature includes real-time synchronization:

- New members are immediately notified when added
- Role changes are reflected in real-time
- Member removals are synchronized across all active sessions

## Public vs. Private Projects

### Private Projects
- Only visible to project owner and members
- Requires explicit invitation to access
- Default setting for new projects

### Public Projects
- Visible to all users
- Anyone can view project content
- Owner can still manage members with specific roles
- Useful for open-source or public documentation

## Project Overview Page

A new project detail page is available at `/projects/[id]` that shows:

- Project name and description
- Member count and creation date
- Quick stats for documents, boards, and activities
- Navigation cards to access each section
- Overview of what's included in the project

## Integration with Existing Features

### Documents
- Documents are scoped to projects
- Access is controlled by project membership
- Collaborative editing works within project context

### Kanban Boards
- Boards are bound to their parent project
- Cards inherit project access permissions
- Task assignments respect project membership

### Activity Feed
- Activities are logged per project
- Members see only activities for projects they can access
- Real-time updates within project scope

## Security Considerations

1. **RLS Policies**: All access control is enforced at the database level
2. **Owner Protection**: Owners cannot be removed from their own projects
3. **Role Hierarchy**: Admin actions require appropriate permissions
4. **Cascading Deletes**: Removing a project automatically removes all memberships
5. **Unique Constraints**: Users can only be added once per project

## Future Enhancements

Potential improvements to the sharing feature:

- Email invitations for users not yet on the platform
- Team/group management for bulk invitations
- Custom role permissions
- Project templates with default sharing settings
- Audit log for member changes
- Notification system for sharing actions
