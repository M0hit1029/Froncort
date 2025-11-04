import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ProjectMember, UserRole } from '@/lib/types';

/**
 * Fetch all members of a project
 */
export async function fetchProjectMembers(
  projectId: string
): Promise<{ data: ProjectMember[] | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured, skipping project members fetch');
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching project members:', error);
      return { data: null, error: new Error(error.message) };
    }

    const members: ProjectMember[] =
      data?.map((row) => ({
        userId: row.user_id,
        role: row.role as UserRole,
        addedAt: new Date(row.added_at),
      })) || [];

    return { data: members, error: null };
  } catch (err) {
    console.error('Unexpected error fetching project members:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Add a member to a project
 */
export async function addProjectMember(
  projectId: string,
  userId: string,
  role: UserRole = 'viewer'
): Promise<{ data: ProjectMember | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Supabase not configured. Please set up your environment variables.'),
    };
  }

  try {
    const { data, error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding project member:', error);
      return { data: null, error: new Error(error.message) };
    }

    const member: ProjectMember = {
      userId: data.user_id,
      role: data.role as UserRole,
      addedAt: new Date(data.added_at),
    };

    return { data: member, error: null };
  } catch (err) {
    console.error('Unexpected error adding project member:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Update a project member's role
 */
export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: UserRole
): Promise<{ data: ProjectMember | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Supabase not configured. Please set up your environment variables.'),
    };
  }

  try {
    const { data, error } = await supabase
      .from('project_members')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project member role:', error);
      return { data: null, error: new Error(error.message) };
    }

    const member: ProjectMember = {
      userId: data.user_id,
      role: data.role as UserRole,
      addedAt: new Date(data.added_at),
    };

    return { data: member, error: null };
  } catch (err) {
    console.error('Unexpected error updating project member role:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(
  projectId: string,
  userId: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      error: new Error('Supabase not configured. Please set up your environment variables.'),
    };
  }

  try {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing project member:', error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error removing project member:', err);
    return { error: err as Error };
  }
}

/**
 * Subscribe to project member changes via Supabase realtime
 */
export function subscribeToProjectMembers(
  projectId: string,
  onInsert?: (member: ProjectMember) => void,
  onUpdate?: (member: ProjectMember) => void,
  onDelete?: (userId: string) => void
) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured, skipping realtime subscription');
    return () => {}; // Return empty cleanup function
  }

  const channel = supabase
    .channel(`project-members-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'project_members',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        console.log('Project member added:', payload.new);
        if (onInsert && payload.new) {
          const newData = payload.new as { user_id: string; role: string; added_at: string };
          const member: ProjectMember = {
            userId: newData.user_id,
            role: newData.role as UserRole,
            addedAt: new Date(newData.added_at),
          };
          onInsert(member);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'project_members',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        console.log('Project member updated:', payload.new);
        if (onUpdate && payload.new) {
          const newData = payload.new as { user_id: string; role: string; added_at: string };
          const member: ProjectMember = {
            userId: newData.user_id,
            role: newData.role as UserRole,
            addedAt: new Date(newData.added_at),
          };
          onUpdate(member);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'project_members',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        console.log('Project member removed:', payload.old);
        if (onDelete && payload.old) {
          const oldData = payload.old as { user_id: string };
          onDelete(oldData.user_id);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to project member changes');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Error subscribing to project member changes');
      }
    });

  return () => {
    console.log('Unsubscribing from project member changes');
    supabase.removeChannel(channel);
  };
}

/**
 * Search for users by email
 */
export async function searchUsersByEmail(
  email: string
): Promise<{ data: Array<{ id: string; email: string; name: string }> | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      data: [],
      error: null,
    };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      .ilike('email', `%${email}%`)
      .limit(10);

    if (error) {
      console.error('Error searching users:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error searching users:', err);
    return { data: null, error: err as Error };
  }
}
