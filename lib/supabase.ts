import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types for Supabase tables
export interface SupabaseProject {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface SupabaseDocument {
  id: string;
  project_id: string;
  title: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_edited_by: string;
}

export interface SupabaseDocumentVersion {
  id: string;
  document_id: string;
  content: string;
  created_at: string;
  created_by: string;
  message?: string;
}

export interface SupabaseUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  created_at: string;
}

export interface SupabaseProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  added_at: string;
}

export interface SupabasePresence {
  user_id: string;
  document_id?: string;
  board_id?: string;
  cursor_position?: { x: number; y: number };
  last_seen: string;
}
