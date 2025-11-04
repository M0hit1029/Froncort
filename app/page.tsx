'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const { user, login } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        // User is authenticated, fetch user data
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && userData) {
          // Set user in store if not already set
          if (!user || user.id !== userData.id) {
            login({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              avatar: userData.avatar,
              color: userData.color,
              role: 'admin',
            });
          }
          router.push('/documents');
        } else {
          router.push('/login');
        }
      } else if (user) {
        // User data in store but no session, redirect to documents
        router.push('/documents');
      } else {
        // No authentication, redirect to login
        router.push('/login');
      }
    };

    checkAuth();
  }, [user, login, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-black mb-4">Loading Froncort...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
