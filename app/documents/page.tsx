'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { CollaborativeEditor } from '@/components/editor/collaborative-editor';
import { ActiveUsers } from '@/components/editor/active-users';
import { VersionHistory } from '@/components/editor/version-history';
import { useDocumentStore } from '@/store/document-store';
import { useProjectStore } from '@/store/project-store';
import { useAuthStore } from '@/store/auth-store';
import { useActivityStore } from '@/store/activity-store';
import { useCollaboration } from '@/hooks/useCollaboration';
import { generateMockPage } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Clock, History, Wifi, WifiOff } from 'lucide-react';
import { DocumentPage } from '@/lib/types';

export default function DocumentsPage() {
  const { addPage, updatePage, getPagesByProject, addVersion } = useDocumentStore();
  const { currentProjectId } = useProjectStore();
  const { user } = useAuthStore();
  const { addActivity } = useActivityStore();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>('');
  const initializedRef = useRef(false);

  const projectPages = useMemo(
    () => (currentProjectId ? getPagesByProject(currentProjectId) : []),
    [currentProjectId, getPagesByProject]
  );

  useEffect(() => {
    // Create initial page if none exists and we haven't initialized yet
    if (currentProjectId && projectPages.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      const mockPage = generateMockPage(currentProjectId);
      addPage(mockPage);
      // Use setTimeout to avoid setState in effect
      setTimeout(() => setSelectedPageId(mockPage.id), 0);
    } else if (projectPages.length > 0 && !selectedPageId) {
      setTimeout(() => setSelectedPageId(projectPages[0].id), 0);
    }
  }, [currentProjectId, projectPages, addPage, selectedPageId]);

  const selectedPage = projectPages.find((p) => p.id === selectedPageId);

  // Collaboration hook
  const {
    isConnected,
    activeUsers,
    error: collaborationError,
    sendEdit,
    sendCursorPosition,
    sendSelection,
  } = useCollaboration({
    documentId: selectedPageId || '',
    user: user || { id: '', name: '', email: '', color: '' },
    enabled: !!selectedPageId && !!user,
  });

  const handleContentChange = (content: string) => {
    if (selectedPageId && user) {
      updatePage(selectedPageId, content, user.id);
      setLastSaved(new Date());

      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Create version after 30 seconds of inactivity
      saveTimerRef.current = setTimeout(() => {
        if (content !== lastContentRef.current) {
          addVersion(selectedPageId, {
            id: `version-${crypto.randomUUID()}`,
            content,
            createdAt: new Date(),
            createdBy: user.id,
            message: 'Auto-saved version',
          });
          lastContentRef.current = content;
        }
      }, 30000);

      // Send edit to WebSocket
      sendEdit({ content });

      // Add activity
      if (currentProjectId) {
        addActivity({
          id: `activity-${crypto.randomUUID()}`,
          type: 'page_edited',
          userId: user.id,
          projectId: currentProjectId,
          resourceId: selectedPageId,
          resourceType: 'page',
          description: `edited ${selectedPage?.title || 'a page'}`,
          createdAt: new Date(),
        });
      }
    }
  };

  const handleCreatePage = () => {
    if (!currentProjectId || !user) return;

    const newPage: DocumentPage = {
      id: `page-${crypto.randomUUID()}`,
      projectId: currentProjectId,
      title: 'Untitled Page',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Untitled Page' }],
          },
        ],
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id,
      lastEditedBy: user.id,
      versions: [],
    };

    addPage(newPage);
    setSelectedPageId(newPage.id);

    // Add activity
    addActivity({
      id: `activity-${crypto.randomUUID()}`,
      type: 'page_created',
      userId: user.id,
      projectId: currentProjectId,
      resourceId: newPage.id,
      resourceType: 'page',
      description: 'created a new page',
      createdAt: new Date(),
    });
  };

  return (
    <MainLayout>
      <div className="flex h-full">
        {/* Pages Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <Button onClick={handleCreatePage} className="w-full" size="sm">
              <Plus size={16} className="mr-2" />
              New Page
            </Button>
          </div>

          <div className="p-2">
            {projectPages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPageId(page.id)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                  selectedPageId === page.id
                    ? 'bg-blue-50 text-black font-medium'
                    : 'hover:bg-gray-50 text-black'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span className="truncate">{page.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedPage ? (
            <>
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">
                    {selectedPage.title}
                  </h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVersionHistory(true)}
                  >
                    <History size={16} className="mr-2" />
                    Version History
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-black">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                      {lastSaved
                        ? `Saved ${lastSaved.toLocaleTimeString()}`
                        : 'Auto-saving...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <Wifi size={14} className="text-black" />
                    ) : (
                      <WifiOff size={14} className="text-black" />
                    )}
                    <ActiveUsers users={activeUsers} isConnected={isConnected} />
                  </div>
                  {collaborationError && (
                    <span className="text-xs text-black">{collaborationError}</span>
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  <CollaborativeEditor
                    content={selectedPage.content}
                    onChange={handleContentChange}
                    onCursorMove={sendCursorPosition}
                    onSelectionChange={sendSelection}
                    collaborators={activeUsers}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-black">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a page or create a new one</p>
              </div>
            </div>
          )}
        </div>

        {/* Version History Modal */}
        {showVersionHistory && selectedPage && (
          <VersionHistory
            page={selectedPage}
            onClose={() => setShowVersionHistory(false)}
          />
        )}
      </div>
    </MainLayout>
  );
}
