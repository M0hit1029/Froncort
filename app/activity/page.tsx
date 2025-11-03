'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useActivityStore } from '@/store/activity-store';
import { useProjectStore } from '@/store/project-store';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, FileText, Square, User } from 'lucide-react';
import { MOCK_USERS } from '@/lib/mock-data';

export default function ActivityPage() {
  const { getActivitiesByProject } = useActivityStore();
  const { currentProjectId } = useProjectStore();

  const activities = currentProjectId
    ? getActivitiesByProject(currentProjectId)
    : [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'page_created':
      case 'page_edited':
      case 'page_deleted':
        return <FileText size={16} className="text-black" />;
      case 'card_created':
      case 'card_moved':
      case 'card_edited':
      case 'card_deleted':
        return <Square size={16} className="text-black" />;
      case 'user_mentioned':
      case 'user_assigned':
        return <User size={16} className="text-black" />;
      default:
        return <Activity size={16} className="text-black" />;
    }
  };

  const getUserName = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <MainLayout>
      <div className="h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold mb-2">Activity Feed</h1>
          <p className="text-black">
            Track all changes and updates in your project
          </p>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">
                            {getUserName(activity.userId)}
                          </span>{' '}
                          <span className="text-black">
                            {activity.description}
                          </span>
                        </p>
                        <p className="text-xs text-black mt-1">
                          {formatTimeAgo(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-black">
                  <Activity size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No activity yet</p>
                  <p className="text-sm mt-2">
                    Start editing documents or moving cards to see activity
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
