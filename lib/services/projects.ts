import { supabase, SupabaseProject, isSupabaseConfigured } from '@/lib/supabase';
import { Project } from '@/lib/types';

/**
 * Convert Supabase project to app Project type
 */
export function toProject(supabaseProject: SupabaseProject): Project {
  return {
    id: supabaseProject.id,
    name: supabaseProject.name,
    description: supabaseProject.description,
    createdAt: new Date(supabaseProject.created_at),
    updatedAt: new Date(supabaseProject.updated_at),
    ownerId: supabaseProject.owner_id,
    visibility: supabaseProject.visibility,
    members: [], // Members will be loaded separately if needed
  };
}

/**
 * Fetch all projects the current user can access (own projects + public projects)
 */
export async function fetchProjects(): Promise<{ data: Project[] | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured, skipping project fetch');
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return { data: null, error: new Error(error.message) };
    }

    const projects = data?.map(toProject) || [];
    return { data: projects, error: null };
  } catch (err) {
    console.error('Unexpected error fetching projects:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Create a new project
 */
export async function createProject(
  name: string,
  description: string,
  visibility: 'public' | 'private',
  ownerId: string
): Promise<{ data: Project | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase not configured. Please set up your environment variables.') };
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        description: description.trim(),
        visibility,
        owner_id: ownerId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: toProject(data), error: null };
  } catch (err) {
    console.error('Unexpected error creating project:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  updates: Partial<{ name: string; description: string; visibility: 'public' | 'private' }>
): Promise<{ data: Project | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase not configured. Please set up your environment variables.') };
  }

  try {
    const updateData: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: toProject(data), error: null };
  } catch (err) {
    console.error('Unexpected error updating project:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase not configured. Please set up your environment variables.') };
  }

  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error deleting project:', err);
    return { error: err as Error };
  }
}

/**
 * Subscribe to project changes via Supabase realtime
 */
export function subscribeToProjects(
  onInsert?: (project: Project) => void,
  onUpdate?: (project: Project) => void,
  onDelete?: (id: string) => void
) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured, skipping realtime subscription');
    return () => {}; // Return empty cleanup function
  }

  const channel = supabase
    .channel('projects-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'projects',
      },
      (payload) => {
        console.log('Project inserted:', payload.new);
        if (onInsert) {
          onInsert(toProject(payload.new as SupabaseProject));
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects',
      },
      (payload) => {
        console.log('Project updated:', payload.new);
        if (onUpdate) {
          onUpdate(toProject(payload.new as SupabaseProject));
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'projects',
      },
      (payload) => {
        console.log('Project deleted:', payload.old);
        if (onDelete && payload.old) {
          onDelete((payload.old as SupabaseProject).id);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to project changes');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Error subscribing to project changes');
      }
    });

  return () => {
    console.log('Unsubscribing from project changes');
    supabase.removeChannel(channel);
  };
}
