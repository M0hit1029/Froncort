import { useEffect, useRef } from 'react';
import { useProjectStore } from '@/store/project-store';
import { useAuthStore } from '@/store/auth-store';

/**
 * Hook to sync projects from Supabase and subscribe to real-time updates
 */
export function useProjectSync() {
  const { loadProjects, initializeRealtimeSubscription } = useProjectStore();
  const { isAuthenticated } = useAuthStore();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only run if authenticated
    if (!isAuthenticated) {
      return;
    }

    // Load projects once on mount
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadProjects();
    }

    // Set up real-time subscription
    if (!unsubscribeRef.current) {
      unsubscribeRef.current = initializeRealtimeSubscription();
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isAuthenticated, loadProjects, initializeRealtimeSubscription]);
}
