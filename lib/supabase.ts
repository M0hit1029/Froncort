import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Validate environment variables
const hasValidConfig = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!hasValidConfig) {
  console.error('❌ Supabase configuration error:', {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.');
}

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

// Test connection on initialization (only in browser and with valid config)
if (typeof window !== 'undefined' && hasValidConfig) {
  supabase.from('users').select('count', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) {
        console.error('❌ Supabase connection test failed:', error.message);
      } else {
        console.log('✅ Supabase connection successful');
      }
    });
}

// Export config validity flag
export const isSupabaseConfigured = hasValidConfig;

// Database types for Supabase tables
export interface SupabaseProject {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  visibility: 'public' | 'private';
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
