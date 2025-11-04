'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { useProjectSync } from '@/hooks/useProjectSync';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Initialize project sync with Supabase and real-time subscriptions
  useProjectSync();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
