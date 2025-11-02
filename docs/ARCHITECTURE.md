# Froncort Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js App (App Router)                  │ │
│  │                                                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │Documents │  │  Kanban  │  │ Activity │            │ │
│  │  │   Page   │  │   Page   │  │   Page   │            │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘            │ │
│  │       │             │              │                   │ │
│  │       └─────────────┴──────────────┘                   │ │
│  │                     │                                   │ │
│  │              ┌──────▼──────┐                           │ │
│  │              │  Components │                           │ │
│  │              │   Layer     │                           │ │
│  │              └──────┬──────┘                           │ │
│  │                     │                                   │ │
│  │       ┌─────────────┴─────────────┐                   │ │
│  │       │                           │                   │ │
│  │  ┌────▼────┐              ┌──────▼──────┐            │ │
│  │  │ Zustand │              │   Context   │            │ │
│  │  │ Stores  │              │     API     │            │ │
│  │  └────┬────┘              └─────────────┘            │ │
│  │       │                                               │ │
│  │  ┌────▼──────────────────┐                           │ │
│  │  │  LocalStorage (Persist)│                           │ │
│  │  └────────────────────────┘                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Presentation Layer (Pages & Components)

```
Pages (app/)
├── page.tsx (Root - Redirect/Setup)
├── documents/page.tsx (Document Editor)
├── kanban/page.tsx (Kanban Board)
└── activity/page.tsx (Activity Feed)

Components (components/)
├── layout/
│   ├── main-layout.tsx (App Shell)
│   └── sidebar.tsx (Navigation)
├── editor/
│   ├── tiptap-editor.tsx (Rich Text Editor)
│   ├── editor-toolbar.tsx (Formatting Controls)
│   └── version-history.tsx (Version Management)
├── kanban/
│   ├── kanban-board.tsx (Board Container)
│   ├── kanban-column.tsx (Column)
│   └── kanban-card.tsx (Draggable Card)
└── ui/
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── textarea.tsx
```

### 2. State Management Layer

```
Zustand Stores (store/)
├── auth-store.ts
│   ├── user: AuthUser | null
│   ├── login()
│   └── logout()
│
├── project-store.ts
│   ├── projects: Project[]
│   ├── currentProjectId: string | null
│   ├── addProject()
│   ├── updateProject()
│   └── setCurrentProject()
│
├── document-store.ts
│   ├── pages: DocumentPage[]
│   ├── addPage()
│   ├── updatePage()
│   ├── addVersion()
│   └── restoreVersion()
│
├── kanban-store.ts
│   ├── boards: KanbanBoard[]
│   ├── addBoard()
│   ├── addCard()
│   ├── moveCard()
│   └── updateCard()
│
└── activity-store.ts
    ├── activities: Activity[]
    ├── addActivity()
    └── getActivitiesByProject()
```

### 3. Data Flow

```
User Action
    │
    ▼
Component Event Handler
    │
    ├──► Zustand Store Mutation
    │        │
    │        ├──► LocalStorage (Persist)
    │        │
    │        └──► Re-render via React
    │
    └──► Activity Store (Log Action)
```

## Data Models

### Core Entities

```typescript
User {
  id: string
  name: string
  email: string
  color: string // for UI indicators
}

AuthUser extends User {
  role: 'owner' | 'admin' | 'editor' | 'viewer'
}

Project {
  id: string
  name: string
  description: string
  members: ProjectMember[]
  createdAt: Date
  updatedAt: Date
}

DocumentPage {
  id: string
  projectId: string
  title: string
  content: string // TipTap JSON
  versions: PageVersion[]
  createdBy: string
  lastEditedBy: string
  createdAt: Date
  updatedAt: Date
}

KanbanBoard {
  id: string
  projectId: string
  name: string
  columns: KanbanColumn[]
  createdAt: Date
  updatedAt: Date
}

KanbanCard {
  id: string
  title: string
  description: string
  assigneeId?: string
  dueDate?: Date
  labels: Label[]
  linkedPageId?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

Activity {
  id: string
  type: ActivityType
  userId: string
  projectId: string
  resourceId: string
  resourceType: 'page' | 'card'
  description: string
  createdAt: Date
}
```

## State Persistence

```
┌──────────────┐
│   Zustand    │
│    Store     │
└──────┬───────┘
       │
       │ (persist middleware)
       │
       ▼
┌──────────────┐
│ LocalStorage │
│              │
│ Keys:        │
│ - auth-storage        │
│ - project-storage     │
│ - document-storage    │
│ - kanban-storage      │
│ - activity-storage    │
└──────────────┘
```

### Persistence Strategy

- **Automatic**: All store changes auto-save to localStorage
- **Granular**: Each store has its own localStorage key
- **Serialization**: JSON serialization with Date conversion
- **Hydration**: Automatic state restoration on page load

## Editor Architecture (TipTap)

```
┌─────────────────────────────────────┐
│         TipTap Editor               │
│                                     │
│  ┌───────────────────────────────┐ │
│  │      Editor Toolbar           │ │
│  │  [B] [I] [H1] [List] [Table] │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │      EditorContent            │ │
│  │                               │ │
│  │   ProseMirror View            │ │
│  │   (WYSIWYG editing)           │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  Extensions:                        │
│  - StarterKit (basic formatting)   │
│  - Link (hyperlinks)                │
│  - Image (embed images)             │
│  - Table (structured data)          │
│  - TaskList (checkboxes)            │
└─────────────────────────────────────┘
        │
        ▼
   JSON Document
   (stored in DocumentStore)
```

### Editor Features

1. **Real-time Updates**: `onUpdate` callback triggers store mutation
2. **Auto-save**: Debounced save after typing stops
3. **Version Creation**: Automatic version after 30s of inactivity
4. **Markdown Support**: Built-in shortcuts (e.g., `# ` → H1)

## Kanban Architecture (dnd-kit)

```
┌────────────────────────────────────────────┐
│           DndContext                       │
│                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ Column 1 │  │ Column 2 │  │ Column 3 ││
│  │ (To Do)  │  │(Progress)│  │  (Done)  ││
│  │          │  │          │  │          ││
│  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ ││
│  │ │ Card │ │  │ │ Card │ │  │ │ Card │ ││
│  │ └──────┘ │  │ └──────┘ │  │ └──────┘ ││
│  │          │  │          │  │          ││
│  │ ┌──────┐ │  │          │  │          ││
│  │ │ Card │ │  │          │  │          ││
│  │ └──────┘ │  │          │  │          ││
│  └──────────┘  └──────────┘  └──────────┘│
│                                            │
└────────────────────────────────────────────┘
        │
        ▼
   Drag Events
        │
        ├─ onDragStart: Set active card
        └─ onDragEnd: Move card to new column
                │
                ▼
          Update KanbanStore
```

### Drag & Drop Flow

1. **User drags card**: `useDraggable` hook provides drag handlers
2. **Drop on column**: `useDroppable` hook identifies drop zone
3. **Event handler**: `onDragEnd` calculates new position
4. **Store update**: `moveCard()` updates board state
5. **Re-render**: React updates UI to show new position

## Activity Tracking

```
User Action (edit/create/move)
        │
        ▼
Component Event Handler
        │
        ├──► Primary Store Action
        │    (update document/card)
        │
        └──► Activity Store Action
             (log the activity)
                  │
                  ▼
            Activity Feed
            (shows in real-time)
```

### Activity Types

- **Page Events**: created, edited, deleted
- **Card Events**: created, moved, edited, deleted
- **User Events**: mentioned, assigned

## Performance Considerations

### Optimizations

1. **Memoization**: React.memo for expensive components
2. **Lazy Loading**: Dynamic imports for heavy components
3. **Virtualization**: (Future) For long lists
4. **Debouncing**: Editor updates and auto-save
5. **Selective Re-renders**: Zustand's selector optimization

### Current Limitations

- **LocalStorage Size**: ~5-10MB limit per domain
- **No Pagination**: All data loaded at once
- **No Indexing**: Linear search for filtering
- **Single-threaded**: No Web Workers for heavy tasks

## Security Model

### Current (Client-side only)

- **Role Checking**: UI-level enforcement only
- **Mock Authentication**: Simulated user session
- **No Encryption**: Data stored in plain text
- **No Validation**: Client-side only

### Production Requirements

- **Server-side Auth**: JWT or session-based
- **API Gateway**: Protect backend endpoints
- **Row-level Security**: Database-level access control
- **Input Validation**: Server-side sanitization
- **Encryption**: At-rest and in-transit
- **Audit Logging**: Track all mutations

## Scalability Path

### Moving to Production

```
Current: Client-only
    │
    ▼
Add Backend
    ├─ REST API (Next.js API routes)
    ├─ Database (PostgreSQL/MongoDB)
    └─ File Storage (S3/Cloudinary)
    │
    ▼
Add Real-time
    ├─ WebSocket Server
    ├─ Redis for Pub/Sub
    └─ CRDT for Conflict Resolution
    │
    ▼
Scale Horizontally
    ├─ Load Balancer
    ├─ Multiple App Instances
    ├─ Database Replication
    └─ CDN for Static Assets
```

## Future Architecture Enhancements

1. **Microservices**: Separate services for docs, kanban, search
2. **Event Sourcing**: Immutable event log for audit trail
3. **CQRS**: Separate read/write models for optimization
4. **GraphQL**: Flexible data fetching
5. **Server Components**: Leverage Next.js 13+ RSC
6. **Edge Functions**: Deploy closer to users
7. **Offline-first**: Progressive Web App with Service Workers
