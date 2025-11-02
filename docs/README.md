# Froncort - Collaborative Editor & Kanban System

A modern, full-featured collaborative workspace combining Confluence-style documentation with Jira-style Kanban boards.

## 🎯 Overview

Froncort is a comprehensive project management and documentation platform that provides:

- **Rich Text Editor**: Powered by TipTap with support for headings, lists, tables, code blocks, task lists, and more
- **Kanban Boards**: Drag-and-drop task management with customizable columns
- **Version History**: Automatic version tracking with restore capabilities
- **Activity Feed**: Real-time activity tracking across documents and boards
- **Multi-Project Support**: Manage multiple projects with isolated workspaces
- **Role-Based Access**: Owner, Admin, Editor, and Viewer roles (UI-enforced)

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand + React Query + Context API
- **Editor**: TipTap
- **Drag-and-Drop**: dnd-kit
- **Animations**: Framer Motion
- **Storage**: LocalStorage (via Zustand persist)

### Project Structure

```
/app                    # Next.js App Router pages
  /documents           # Document editor page
  /kanban              # Kanban board page
  /activity            # Activity feed page
  layout.tsx           # Root layout
  page.tsx             # Home/redirect page
  
/components            # React components
  /editor              # TipTap editor components
    tiptap-editor.tsx  # Main editor component
    editor-toolbar.tsx # Formatting toolbar
    version-history.tsx # Version history modal
  /kanban              # Kanban board components
    kanban-board.tsx   # Main board container
    kanban-column.tsx  # Board column
    kanban-card.tsx    # Draggable card
  /layout              # Layout components
    main-layout.tsx    # Main app layout
    sidebar.tsx        # Navigation sidebar
  /ui                  # Reusable UI components
    button.tsx
    card.tsx
    input.tsx
    textarea.tsx
    
/store                 # Zustand state stores
  auth-store.ts        # Authentication state
  project-store.ts     # Project management
  document-store.ts    # Document/page state
  kanban-store.ts      # Kanban board state
  activity-store.ts    # Activity feed state
  
/lib                   # Utilities and helpers
  utils.ts             # Utility functions
  types.ts             # TypeScript type definitions
  mock-data.ts         # Mock data generators
  
/docs                  # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/M0hit1029/Froncort.git
cd Froncort
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 🎨 Features

### Rich Text Editor

The TipTap editor supports:

- **Text Formatting**: Bold, italic, strikethrough, inline code
- **Headings**: H1, H2, H3
- **Lists**: Bullet lists, numbered lists, task lists with checkboxes
- **Tables**: Resizable tables with header rows
- **Blockquotes**: For highlighting important text
- **Links & Images**: Embed links and images
- **Markdown Shortcuts**: Built-in markdown support (e.g., `# ` for headings)
- **Auto-save**: Automatic saving to localStorage
- **Version History**: Track and restore previous versions

### Kanban Boards

- **Drag & Drop**: Smooth card movement between columns using dnd-kit
- **Inline Editing**: Click any card to edit directly
- **Card Fields**:
  - Title and description
  - Assignee
  - Due date
  - Custom labels with colors
  - Link to documentation pages
- **Default Columns**: To Do, In Progress, Done (customizable)

### Activity Feed

- **Real-time Updates**: Track all changes across the project
- **Activity Types**:
  - Page created/edited/deleted
  - Card created/moved/edited/deleted
  - User mentions and assignments
- **Filtering**: Filter by user, project, or resource type
- **Timestamps**: Human-readable time indicators

### Multi-Project Support

- **Project Switching**: Quick project selector in sidebar
- **Isolated Workspaces**: Each project has separate documents and boards
- **Team Members**: Role-based access per project

## 🔐 Access Control

Role hierarchy (UI-enforced simulation):

1. **Owner**: Full access to all features
2. **Admin**: Manage content and team members
3. **Editor**: Create and edit documents and cards
4. **Viewer**: Read-only access

## 💾 Data Persistence

All data is stored in browser localStorage using Zustand's persist middleware:

- **Documents**: Full content with version history
- **Kanban Boards**: Complete board state including card positions
- **Projects**: Project metadata and member roles
- **Activity**: Recent activity log (last 1000 items)
- **User Session**: Authentication state

## 🎭 Real-time Collaboration (Mocked)

The app simulates real-time features:

- **Presence Indicators**: Shows "1 person editing" (simulated)
- **Cursor Position**: Placeholder for multi-user cursors
- **Activity Feed**: Near-instant updates via Zustand

For production, these would integrate with:
- WebSockets or Server-Sent Events
- Operational Transform or CRDT for conflict resolution
- Real-time database (Firebase, Supabase, etc.)

## 📝 Version History

Documents automatically create versions:

- **Auto-save**: Creates version after 30 seconds of inactivity
- **Version Metadata**: Timestamp, author, optional message
- **Restore**: One-click restore to any previous version
- **Diff Viewer**: (Planned) Visual diff between versions

## 🎯 Known Limitations

1. **Local Storage Only**: Data is browser-specific, not synced across devices
2. **No Real Collaboration**: Multi-user editing is simulated, not real
3. **No Server Backend**: All logic runs client-side
4. **Limited Search**: No global search functionality yet
5. **No File Uploads**: Images must be embedded via URL
6. **Single Board Per Project**: Currently one board per project
7. **No Notifications**: Toast notifications not yet implemented
8. **No Export**: Can't export documents to PDF/Markdown

## 🔮 Future Enhancements

### High Priority
- [ ] Real-time collaboration via WebSocket
- [ ] Global search across documents and cards
- [ ] Document and card templates
- [ ] File upload support
- [ ] Export to PDF/Markdown
- [ ] Comment threads on documents
- [ ] Toast notifications for mentions
- [ ] Dark mode toggle

### Medium Priority
- [ ] Multiple boards per project
- [ ] Calendar view for due dates
- [ ] @mentions with autocomplete
- [ ] Slash commands (e.g., `/table`, `/image`)
- [ ] Page hierarchy with nested pages
- [ ] Custom card fields
- [ ] Board filters and sorting
- [ ] API integrations (GitHub, Calendar)

### Low Priority
- [ ] Mobile app
- [ ] Email notifications
- [ ] Webhooks
- [ ] Public sharing links
- [ ] Guest access
- [ ] Audit logs
- [ ] Data export/import

## 🧪 Testing

Currently no automated tests. To test manually:

1. **Documents**: Create, edit, and version pages
2. **Kanban**: Create cards and drag between columns
3. **Activity**: Check activity feed updates
4. **Projects**: Switch between projects
5. **Persistence**: Refresh page and verify data persists

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms

- **Netlify**: Works out of the box
- **Cloudflare Pages**: Compatible
- **AWS Amplify**: Requires configuration
- **Self-hosted**: Build and serve static files

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

- [TipTap](https://tiptap.dev/) - Excellent headless editor
- [dnd-kit](https://dndkit.com/) - Modern drag and drop library
- [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- [ShadCN UI](https://ui.shadcn.com/) - Beautiful component library
- [Next.js](https://nextjs.org/) - The React Framework
