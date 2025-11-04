# Froncort - Collaborative Editor & Kanban System

A modern, full-featured collaborative workspace combining **Confluence-style documentation** with **Jira-style Kanban boards** for multi-project management.

![Documents Page](https://github.com/user-attachments/assets/d592c01e-317f-46b9-8969-d26e5fc83ae8)

![Kanban Board](https://github.com/user-attachments/assets/28cf5d24-e5a9-4f4f-800f-b5e71229d04a)

![Activity Feed](https://github.com/user-attachments/assets/66ef4564-85ae-43b5-a502-296e4d7329a3)

## 🎯 Overview

Froncort is a comprehensive project management and documentation platform built as a take-home assignment for Froncort.AI. It demonstrates:

- **Rich Text Editor**: Powered by TipTap with support for headings, lists, tables, code blocks, task lists, and more
- **Kanban Boards**: Drag-and-drop task management with customizable columns
- **Version History**: Automatic version tracking with restore capabilities
- **Activity Feed**: Real-time activity tracking across documents and boards
- **Multi-Project Support**: Manage multiple projects with isolated workspaces
- **Role-Based Access**: Owner, Admin, Editor, and Viewer roles (UI-enforced)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/M0hit1029/Froncort.git
cd Froncort

# Install dependencies
npm install

# Set up Supabase (see SETUP_GUIDE.md for detailed instructions)
# 1. Create a Supabase project
# 2. Run the SQL migration in supabase/migrations/001_create_tables.sql
# 3. Copy .env.example to .env.local and add your Supabase credentials

# Run development server with WebSocket server
npm run dev:all

# Or run servers separately:
# Terminal 1: Next.js
npm run dev

# Terminal 2: WebSocket server
npm run ws:dev

# Open http://localhost:3000
```

You'll be redirected to the login page. Create an account to get started!

### For Full Setup Instructions

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete setup instructions including:
- Supabase project creation
- Database migrations
- Environment configuration
- Testing collaboration features

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[README.md](./docs/README.md)** - Complete feature documentation
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and data flow
- **[SETUP.md](./docs/SETUP.md)** - Detailed setup instructions
- **[LIMITATIONS.md](./docs/LIMITATIONS.md)** - Known limitations and future roadmap

## 🛠️ Technology Stack

- **Framework**: Next.js 16+ (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand (with persist middleware)
- **Editor**: TipTap (rich text editor)
- **Collaboration**: Socket.IO + Yjs
- **Database**: Supabase (PostgreSQL)
- **Real-Time**: WebSocket + Supabase Realtime
- **Drag-and-Drop**: dnd-kit
- **Icons**: Lucide React
- **Storage**: Supabase + LocalStorage fallback

## ✨ Key Features

### Authentication & User Management
- **Email/Password Authentication**: Secure signup and login via Supabase Auth
- **User Profiles**: Each user has a unique profile with name, email, and color
- **Session Management**: Persistent sessions with automatic refresh
- **Logout Functionality**: Secure logout from any page

### Collaborative Rich Text Documents
- **Real-Time Collaboration**: Multiple users can edit simultaneously via WebSocket
- **Live Cursors**: See other users' cursor positions in real-time
- **User Presence**: Know who's online and editing
- **Color-Coded Users**: Each user has a unique color identifier
- Full formatting toolbar (bold, italic, headings, lists, etc.)
- Tables, code blocks, and task lists
- Markdown shortcuts
- Auto-save with Supabase integration
- Version history with restore
- @mentions support (UI)

### Kanban Boards
- Drag-and-drop cards between columns
- Inline card editing
- Card fields: title, description, assignee, due date, labels
- Link cards to documentation pages
- Visual feedback during drag operations

### Activity Tracking
- Real-time activity feed
- Track page and card changes
- Filter by user, project, or resource type
- Human-readable timestamps

### Multi-Project Workspace
- Create unlimited projects with descriptions
- Easy project switching via sidebar dropdown
- Dedicated project manager UI
- Isolated documents and boards per project
- Team member roles per project
- Delete projects when no longer needed

## 📦 Project Structure

```
/app                    # Next.js App Router pages
/components             # React components
  /editor              # TipTap editor + collaboration components
  /kanban              # Kanban board components
  /layout              # Layout components
  /project             # Project management components
  /ui                  # Reusable UI components
/server                # WebSocket server for real-time collaboration
/hooks                 # Custom React hooks (including collaboration)
/store                 # Zustand state stores
/lib                   # Utilities, types, and Supabase client
/docs                  # Documentation (including setup guides)
```

## 🏗️ Building for Production

```bash
# Build the app
npm run build

# Start production server
npm start
```

## 🧪 Linting

```bash
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Deploy automatically

### Other Platforms
- Works on Netlify, Cloudflare Pages, AWS Amplify
- Static export not supported (uses Next.js API features)

## ✨ NEW: Real-Time Collaboration Features

Froncort now supports real-time collaborative editing! 🎉

- **Multi-User Editing**: Multiple users can edit documents simultaneously
- **Live Cursors**: See where other users are typing with color-coded cursors
- **User Presence**: Track who's online and editing in real-time
- **WebSocket Server**: Real-time communication between users
- **Supabase Integration**: Cloud database for data persistence
- **Multiple Projects**: Create and manage multiple projects easily

See [COLLABORATION_FEATURES.md](./docs/COLLABORATION_FEATURES.md) for complete documentation.

## ⚠️ Known Limitations

- **Requires Setup**: WebSocket server and Supabase configuration needed (see setup guides)
- **No Search**: Global search not yet implemented
- **Single Board**: One board per project currently

See [LIMITATIONS.md](./docs/LIMITATIONS.md) for complete list and workarounds.

## 🎨 Features Showcase

### Documents
- Create and edit rich text pages
- Auto-save with version history
- Restore previous versions
- Track changes in activity feed

### Kanban
- Three default columns: To Do, In Progress, Done
- Smooth drag-and-drop interactions
- Inline editing without modals
- Custom labels with colors

### Activity Feed
- See all project changes
- Filter by type or user
- Timestamps with relative time

## 🤝 Contributing

This is a take-home assignment project. For contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or as a starting point.

## 👤 Author

Built by Mohit for Froncort.AI take-home assignment.

## 🙏 Acknowledgments

- [TipTap](https://tiptap.dev/) - Headless editor framework
- [dnd-kit](https://dndkit.com/) - Modern drag and drop
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS

---

**Note**: This is a demonstration project for a take-home assignment. It showcases frontend architecture, UX design, and modern React patterns. For production use, a backend with real authentication and database would be required.
