import { supabase, SupabaseProject, isSupabaseConfigured } from '@/lib/supabase';
import { Project, ProjectMember, UserRole } from '@/lib/types';

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
 * Fetch all projects the current user can access (own projects + shared projects + public projects)
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
 * Fetch a single project with its members
 */
export async function fetchProjectWithMembers(
  projectId: string
): Promise<{ data: Project | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured, skipping project fetch');
    return { data: null, error: null };
  }

  try {
    // Fetch project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return { data: null, error: new Error(projectError.message) };
    }

    // Fetch project members
    const { data: membersData, error: membersError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId);

    if (membersError) {
      console.error('Error fetching project members:', membersError);
      // Continue without members if there's an error
    }

    const members: ProjectMember[] =
      membersData?.map((row) => ({
        userId: row.user_id,
        role: row.role as UserRole,
        addedAt: new Date(row.added_at),
      })) || [];

    const project: Project = {
      ...toProject(projectData),
      members,
    };

    return { data: project, error: null };
  } catch (err) {
    console.error('Unexpected error fetching project with members:', err);
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
    // Let the database handle updated_at via DEFAULT value
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
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
