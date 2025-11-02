// Collaboration-specific types

export interface CursorPosition {
  x: number;
  y: number;
  from: number;
  to: number;
}

export interface TextSelection {
  from: number;
  to: number;
}

export interface DocumentChanges {
  content: string;
  version?: number;
}

export interface EditorPosition {
  x: number;
  y: number;
  from: number;
  to: number;
}
