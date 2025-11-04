# Froncort Setup Guide

This guide will help you set up the Froncort application with Supabase authentication and database.

## Prerequisites

- Node.js 20+ installed
- A Supabase account (free tier works fine)

## Step 1: Supabase Setup

1. Go to [https://supabase.com](https://supabase.com) and sign in/sign up
2. Create a new project
3. Wait for the project to be provisioned (usually 1-2 minutes)

## Step 2: Run Database Migrations

### Migration 1: Create Tables

1. In your Supabase project dashboard, go to the SQL Editor
2. Open the file `supabase/migrations/001_create_tables.sql` from this repository
3. Copy the entire SQL script and paste it into the SQL Editor
4. Click "Run" to execute the migration
5. Verify that all tables have been created by checking the "Table Editor" section

### Migration 2: Add Project Visibility (NEW)

1. In the SQL Editor, open a new query
2. Copy the contents of `supabase/migrations/002_add_project_visibility.sql`
3. Paste and run the migration
4. This adds:
   - `visibility` column to projects table
   - Updated RLS policies for public/private projects
   - Real-time subscription support

For detailed information about project visibility, see [docs/PROJECT_VISIBILITY_SETUP.md](docs/PROJECT_VISIBILITY_SETUP.md)

## Step 3: Configure Environment Variables

1. In your Supabase dashboard, go to Project Settings > API
2. Copy your Project URL and anon public key
3. Create a `.env.local` file in the root of the project (or rename `.env.example` to `.env.local`)
4. Update the values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Start the Application

You have two options:

### Option A: Start both servers together
```bash
npm run dev:all
```

### Option B: Start servers separately

Terminal 1 - Next.js app:
```bash
npm run dev
```

Terminal 2 - WebSocket server:
```bash
npm run ws:dev
```

## Step 6: Create Your Account

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You'll be redirected to the login page
3. Click "Don't have an account? Sign up"
4. Enter your name, email, and password
5. Click "Sign Up"
6. You'll be automatically logged in and redirected to the documents page

## Step 7: Test Collaboration

To test real-time collaboration features:

1. Open the app in two different browsers (or browser profiles)
2. Sign up with different email addresses in each browser
3. Create a project in one browser
4. Open a document and start editing
5. The WebSocket connection indicator should show as green (connected)
6. Edit the document in one browser and watch the changes appear in real-time in the other browser

## Troubleshooting

### WebSocket not connecting

- Make sure the WebSocket server is running (`npm run ws:dev`)
- Check that port 3001 is not blocked by firewall
- Verify `NEXT_PUBLIC_WS_URL` is set correctly in `.env.local`

### Authentication issues

- Verify your Supabase credentials in `.env.local`
- Check that the database migrations were run successfully
- Ensure email confirmation is disabled in Supabase (Settings > Authentication > Email Auth > Confirm email = OFF for development)

### Can't see changes from other users

- Ensure both users are viewing the same document
- Check that WebSocket server is running
- Look at browser console for any error messages

## Features

Once set up, you can:

- ✅ Sign up and login with email/password
- ✅ Create and manage multiple projects
- ✅ Create and edit documents with rich text editor
- ✅ Real-time collaboration with multiple users
- ✅ See other users' cursors while editing
- ✅ Manage Kanban boards with drag-and-drop
- ✅ Track activity across your projects
- ✅ Version history for documents

## Security Notes

- Never commit your `.env.local` file to version control
- Use strong passwords for production deployments
- Enable email confirmation in Supabase for production
- Consider enabling Row Level Security policies for additional security
- Use environment-specific Supabase projects for development vs production

## Next Steps

- Explore the documentation in the `/docs` folder
- Check out the Kanban board feature at `/kanban`
- View activity feed at `/activity`
- Invite team members by sharing your Supabase project details

For more information, see:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TipTap Documentation](https://tiptap.dev/docs)
