# Quick Start Guide

Get started with Froncort in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- (Optional) Supabase account for cloud features

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/M0hit1029/Froncort.git
cd Froncort
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the application**

```bash
# Option 1: Run with collaboration features (recommended)
npm run dev:all

# Option 2: Run without WebSocket server (basic features only)
npm run dev
```

4. **Open the application**

Navigate to http://localhost:3000 in your browser.

## First Steps

### 1. Explore the Demo Project

The app automatically creates a demo project with sample data on first load:
- Documents with rich text editing
- Kanban board with task management
- Activity feed showing recent changes

### 2. Create Your First Document

1. Click on "Documents" in the sidebar
2. Click "New Page" button
3. Start typing in the editor
4. Your changes are auto-saved

### 3. Try the Kanban Board

1. Click on "Kanban" in the sidebar
2. Drag cards between columns
3. Click on a card to edit it inline
4. Add new cards with the "Add Card" button

### 4. Create Multiple Projects

1. Click the Settings icon (⚙️) next to the project name in the sidebar
2. Click "Create New Project"
3. Enter project name and description
4. Switch between projects using the dropdown

## Testing Collaboration Features

To test real-time collaboration:

1. **Ensure both servers are running**:
   ```bash
   npm run dev:all
   ```

2. **Open multiple browser windows**:
   - Window 1: http://localhost:3000 (Chrome)
   - Window 2: http://localhost:3000 (Firefox or Incognito)

3. **Open the same document** in both windows

4. **Start editing** and observe:
   - User presence indicators show active users
   - Cursor positions are visible
   - Changes sync in real-time
   - Connection status shown in header

## Optional: Supabase Setup

For persistent cloud storage and authentication:

1. **Create a Supabase account** at https://supabase.com

2. **Create a new project**

3. **Get your credentials** from Project Settings → API

4. **Create `.env.local`** in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Set up database tables** by running the SQL from `docs/SUPABASE_SETUP.md`

6. **Restart the application** to use Supabase

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Kill the process using port 3001
lsof -ti:3001 | xargs kill -9
```

Or change the port in `package.json`:

```json
"dev": "next dev -p 3002"
```

### WebSocket Not Connecting

1. Check that WebSocket server is running
2. Verify no firewall blocking port 3001
3. Check browser console for errors
4. Try refreshing the page

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

## Key Features to Try

### Editor Features
- **Bold, Italic, Underline**: Use toolbar or shortcuts (Ctrl+B, Ctrl+I)
- **Headings**: Use toolbar or type `# ` for h1, `## ` for h2, etc.
- **Lists**: Type `- ` for bullet list, `1. ` for numbered list
- **Task List**: Type `[ ] ` for a task item
- **Tables**: Use toolbar to insert tables
- **Code Blocks**: Use toolbar or type ` ``` ` for code blocks

### Kanban Features
- **Drag & Drop**: Click and drag cards between columns
- **Quick Edit**: Click any field to edit inline
- **Labels**: Add colored labels to categorize cards
- **Due Dates**: Set due dates with the date picker
- **Assignees**: Assign tasks to team members

### Project Management
- **Create Projects**: Settings icon → Create New Project
- **Switch Projects**: Use dropdown in sidebar
- **Delete Projects**: Settings icon → Delete button (⚠️ deletes all data)

## Next Steps

1. Read [COLLABORATION_FEATURES.md](./COLLABORATION_FEATURES.md) for detailed collaboration info
2. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for production setup
3. Review [WEBSOCKET_SETUP.md](./WEBSOCKET_SETUP.md) for deployment options
4. Explore [LIMITATIONS.md](./LIMITATIONS.md) to understand current limitations

## Getting Help

- Check the [documentation](./README.md)
- Review [troubleshooting](#troubleshooting) section above
- Open an issue on GitHub
- Check browser console for errors

## Development Tips

### Hot Reload
Both Next.js and WebSocket server support hot reload:
- Edit any file and see changes instantly
- No need to restart servers for most changes

### Debugging
Enable verbose logging:

```bash
# Set environment variable
DEBUG=socket.io* npm run ws:dev
```

### Testing
```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Production Deployment

See [WEBSOCKET_SETUP.md](./WEBSOCKET_SETUP.md) for deployment instructions to:
- Vercel (Next.js app)
- Railway/Render (WebSocket server)
- AWS/Heroku (Full stack)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TipTap Editor](https://tiptap.dev/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Happy coding! 🚀**

For more detailed information, see the full [README.md](../README.md).
