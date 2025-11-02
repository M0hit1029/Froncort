// User and Auth Types
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // For cursor and presence indicators
}

export interface AuthUser extends User {
  role: UserRole;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  members: ProjectMember[];
}

export interface ProjectMember {
  userId: string;
  role: UserRole;
  addedAt: Date;
}

// Document/Page Types
export interface DocumentPage {
  id: string;
  projectId: string;
  title: string;
  content: string; // TipTap JSON content
  parentId?: string; // For nested pages
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastEditedBy: string;
  versions: PageVersion[];
}

export interface PageVersion {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  message?: string;
}

// Kanban Types
export interface KanbanBoard {
  id: string;
  projectId: string;
  name: string;
  columns: KanbanColumn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  cards: KanbanCard[];
}

export interface KanbanCard {
  id: string;
  title: string;
  description: string; // Markdown content
  assigneeId?: string;
  dueDate?: Date;
  labels: Label[];
  linkedPageId?: string; // Link to documentation page
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  order: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

// Activity Feed Types
export type ActivityType = 
  | 'page_created'
  | 'page_edited'
  | 'page_deleted'
  | 'card_created'
  | 'card_moved'
  | 'card_edited'
  | 'card_deleted'
  | 'user_mentioned'
  | 'user_assigned';

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  projectId: string;
  resourceId: string; // ID of the page or card
  resourceType: 'page' | 'card';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Presence and Real-time Types
export interface PresenceUser {
  userId: string;
  user: User;
  resourceId: string; // ID of page or board they're viewing
  resourceType: 'page' | 'board';
  cursorPosition?: { x: number; y: number };
  lastSeen: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'assignment' | 'general';
  title: string;
  message: string;
  read: boolean;
  resourceId?: string;
  resourceType?: 'page' | 'card';
  createdAt: Date;
}
