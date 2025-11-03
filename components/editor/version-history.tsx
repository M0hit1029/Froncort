'use client';

import React from 'react';
import { DocumentPage } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, RotateCcw } from 'lucide-react';
import { useDocumentStore } from '@/store/document-store';
import { MOCK_USERS } from '@/lib/mock-data';

interface VersionHistoryProps {
  page: DocumentPage;
  onClose: () => void;
}

export function VersionHistory({ page, onClose }: VersionHistoryProps) {
  const { restoreVersion } = useDocumentStore();

  const getUserName = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const handleRestore = (versionId: string) => {
    if (
      confirm('Are you sure you want to restore this version? This will create a new version.')
    ) {
      restoreVersion(page.id, versionId);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Version History
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          {page.versions.length === 0 ? (
            <div className="text-center py-8 text-black">
              <p>No version history available</p>
              <p className="text-sm mt-2">
                Versions will be saved automatically as you edit
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Current Version */}
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-black">
                      Current Version
                    </div>
                    <div className="text-sm text-black mt-1">
                      Last edited by {getUserName(page.lastEditedBy)}
                    </div>
                    <div className="text-xs text-black mt-1">
                      {formatDate(page.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Previous Versions */}
              {page.versions
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((version) => (
                  <div
                    key={version.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">
                          {version.message || 'Version'}
                        </div>
                        <div className="text-sm text-black mt-1">
                          by {getUserName(version.createdBy)}
                        </div>
                        <div className="text-xs text-black mt-1">
                          {formatDate(version.createdAt)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version.id)}
                      >
                        <RotateCcw size={14} className="mr-1" />
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
