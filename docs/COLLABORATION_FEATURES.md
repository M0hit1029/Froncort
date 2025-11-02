# Real-Time Collaboration Features

This document describes the collaborative editing features added to Froncort.

## Overview

Froncort now supports real-time collaborative editing, allowing multiple users to work on the same document simultaneously with live updates and presence indicators.

## Key Features

### 1. Real-Time Multi-User Editing

Multiple users can edit the same document at the same time:

- **Live Updates**: See changes from other users in real-time
- **Conflict Prevention**: Automatic handling of concurrent edits
- **Synchronized Content**: All users see the same content

### 2. User Presence Tracking

Know who else is working on the document:

- **Active Users Display**: See all users currently editing
- **Color-Coded Indicators**: Each user has a unique color
- **Connection Status**: Online/offline indicators
- **User Count**: Real-time count of active editors

### 3. Cursor Position Tracking

See where other users are typing:

- **Live Cursors**: View other users' cursor positions in real-time
- **User Labels**: Each cursor shows the user's name
- **Color Coordination**: Cursors match user colors
- **Smooth Animations**: Cursors move smoothly as users type

### 4. Selection Highlighting

See what text other users have selected:

- **Visual Highlights**: Selected text is highlighted in user colors
- **Multiple Selections**: View selections from all active users
- **Real-Time Updates**: Selections update as users interact

### 5. Multiple Project Support

Enhanced project management:

- **Create Projects**: Easy project creation with name and description
- **Switch Projects**: Quick project switching from sidebar
- **Project Manager**: Dedicated UI for managing all projects
- **Isolated Workspaces**: Each project has its own documents and boards
- **Member Management**: Track project members and roles

### 6. Supabase Integration

Backend database for persistence:

- **Cloud Storage**: All data stored in Supabase
- **Real-Time Sync**: Changes synced across all devices
- **User Authentication**: Secure user management
- **Role-Based Access**: Owner, Admin, Editor, Viewer roles
- **Version History**: All versions stored in database

## Architecture

### Components

1. **WebSocket Server** (`server/websocket.ts`)
   - Handles real-time connections
   - Manages user presence
   - Broadcasts updates to all clients
   - Cleans up stale connections

2. **Collaboration Hook** (`hooks/useCollaboration.ts`)
   - Client-side WebSocket management
   - Connection handling and reconnection
   - Event emission and subscription
   - State management for active users

3. **Collaborative Editor** (`components/editor/collaborative-editor.tsx`)
   - Enhanced TipTap editor with collaboration
   - Cursor tracking
   - Selection monitoring
   - Real-time content sync

4. **Active Users Display** (`components/editor/active-users.tsx`)
   - Shows all active users
   - Color-coded user indicators
   - Online status display

5. **Collaboration Cursors** (`components/editor/collaboration-cursors.tsx`)
   - Renders other users' cursors
   - Shows user names
   - Handles cursor animations

6. **Project Manager** (`components/project/project-manager.tsx`)
   - Create new projects
   - View all projects
   - Switch between projects
   - Delete projects

### Data Flow

```
User Action → Editor → Collaboration Hook → WebSocket Client
                                                ↓
                                          WebSocket Server
                                                ↓
                                   Broadcast to Other Users
                                                ↓
                                   WebSocket Client (Other Users)
                                                ↓
                                   Update Editor Display
```

### State Management

1. **Local State**: Current document content, UI state
2. **Zustand Store**: Projects, documents, local persistence
3. **WebSocket State**: Active users, cursor positions
4. **Supabase**: Persistent data, version history

## Usage

### Starting the Servers

Development mode with both servers:

```bash
npm run dev:all
```

This starts:
- Next.js dev server on http://localhost:3000
- WebSocket server on ws://localhost:3001

### Creating a Project

1. Click the Settings icon in the sidebar
2. Click "Create New Project"
3. Enter project name and description
4. Click "Create Project"

### Collaborative Editing

1. Open a document
2. Other users join the same document
3. See their presence indicators in the header
4. View their cursors and selections in the editor
5. Changes sync automatically

### Switching Projects

1. Use the dropdown in the sidebar to switch projects
2. Or click the Settings icon to open the Project Manager
3. Click on any project to switch to it

## Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Customization

#### Change User Colors

Edit `lib/types.ts`:

```typescript
export interface User {
  color: string; // Hex color code
}
```

Colors are assigned automatically from a predefined palette.

#### Adjust Heartbeat Interval

Edit `hooks/useCollaboration.ts`:

```typescript
const heartbeatInterval = setInterval(() => {
  // Send heartbeat
}, 30000); // Change to desired interval in ms
```

#### Modify Stale Connection Timeout

Edit `server/websocket.ts`:

```typescript
if (now - presence.lastSeen.getTime() > 60000) {
  // Change timeout duration
}
```

## User Colors

Each user is assigned a unique color for their cursor and presence indicator:

- **Blue** (#3B82F6)
- **Green** (#10B981)
- **Red** (#EF4444)
- **Yellow** (#F59E0B)
- **Purple** (#8B5CF6)
- **Pink** (#EC4899)
- **Indigo** (#6366F1)
- **Orange** (#F97316)

Colors are assigned when users are created and persist across sessions.

## Limitations Addressed

This update addresses several limitations from the original implementation:

### Original Limitations

- ❌ No real-time collaboration
- ❌ Local storage only
- ❌ Static "1 person editing" indicator
- ❌ No cursor tracking
- ❌ No conflict resolution
- ❌ Single project limitation

### Now Supported

- ✅ Real-time multi-user editing
- ✅ Supabase cloud storage
- ✅ Live user presence tracking
- ✅ Color-coded cursor positions
- ✅ Automatic conflict handling
- ✅ Multiple projects with easy switching
- ✅ Project management UI
- ✅ WebSocket-based communication
- ✅ User presence indicators
- ✅ Connection status display

## Known Issues

1. **First-Time Setup**: Requires Supabase account and WebSocket server running
2. **Cursor Precision**: Cursor positions are approximate due to browser limitations
3. **Network Latency**: Updates may have slight delay depending on connection
4. **Browser Compatibility**: Works best on modern browsers (Chrome, Firefox, Safari, Edge)

## Future Enhancements

Potential improvements for future versions:

1. **Operational Transform**: More sophisticated conflict resolution
2. **Undo/Redo**: Collaborative undo/redo support
3. **Comments**: Inline comments and annotations
4. **Chat**: Built-in chat for collaborators
5. **Notifications**: Desktop notifications for @mentions
6. **File Sharing**: Attach files to documents
7. **Export**: Export documents with collaboration history
8. **Analytics**: Track collaboration metrics
9. **Video/Audio**: Integrated video calls
10. **Screen Sharing**: Share screens during collaboration

## Troubleshooting

### WebSocket Not Connecting

1. Ensure WebSocket server is running: `npm run ws:dev`
2. Check `NEXT_PUBLIC_WS_URL` in `.env.local`
3. Verify port 3001 is not blocked by firewall
4. Check browser console for connection errors

### Users Not Showing Up

1. Verify both users are on the same document
2. Check WebSocket connection status (WiFi icon)
3. Refresh the page
4. Check server logs for errors

### Cursor Positions Not Accurate

1. This is expected due to browser limitations
2. Cursor positions are best-effort approximations
3. They provide general awareness of where users are working

### Supabase Errors

1. Verify Supabase credentials in `.env.local`
2. Check that all tables are created (see SUPABASE_SETUP.md)
3. Ensure Row Level Security policies are configured
4. Check Supabase dashboard for error logs

## Performance

### Optimization Tips

1. **Debounce Updates**: Editor updates are debounced to reduce WebSocket traffic
2. **Heartbeat Interval**: Adjust heartbeat frequency based on needs
3. **Connection Pooling**: WebSocket connections are reused
4. **Stale Connection Cleanup**: Automatic cleanup of inactive connections

### Scalability

For high traffic:

1. Use Redis adapter for Socket.IO
2. Deploy multiple WebSocket servers
3. Use a load balancer with sticky sessions
4. Enable Supabase connection pooling
5. Implement rate limiting

## Security

### Current Implementation

- WebSocket connections are not authenticated by default
- Supabase handles authentication and authorization
- Row Level Security policies protect data
- CORS is configured for allowed origins

### Recommendations for Production

1. Add JWT authentication to WebSocket connections
2. Validate all client input
3. Implement rate limiting
4. Use WSS (WebSocket Secure) in production
5. Enable Supabase MFA
6. Regular security audits
7. Monitor for suspicious activity

## Testing

### Manual Testing

1. Open the app in two different browsers
2. Log in as different users (or use incognito)
3. Open the same document
4. Start typing and observe:
   - Other user appears in active users list
   - Their cursor is visible
   - Changes sync in real-time

### Automated Testing

See `docs/WEBSOCKET_SETUP.md` for automated testing examples.

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the setup guides (SUPABASE_SETUP.md, WEBSOCKET_SETUP.md)
3. Check browser console for errors
4. Check WebSocket server logs
5. Open an issue on GitHub

## Contributing

To contribute to collaboration features:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with multiple users
5. Submit a pull request

## License

MIT License - Same as the main project
