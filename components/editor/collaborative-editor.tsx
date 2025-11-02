'use client';

import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { EditorToolbar } from './editor-toolbar';
import { CollaborationCursors } from './collaboration-cursors';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types';

interface CursorPosition {
  x: number;
  y: number;
  from: number;
  to: number;
}

interface TextSelection {
  from: number;
  to: number;
}

interface CollaborativeEditorProps {
  content: string;
  onChange?: (content: string) => void;
  onCursorMove?: (position: CursorPosition) => void;
  onSelectionChange?: (selection: TextSelection) => void;
  editable?: boolean;
  className?: string;
  collaborators?: Array<{
    socketId: string;
    user: User;
    cursorPosition?: CursorPosition;
    selection?: TextSelection;
  }>;
}

export function CollaborativeEditor({
  content,
  onChange,
  onCursorMove,
  onSelectionChange,
  editable = true,
  className,
  collaborators = [],
}: CollaborativeEditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: content || '',
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const newContent = JSON.stringify(json);
      
      // Debounce updates to avoid too many WebSocket messages
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        onChange?.(newContent);
      }, 300);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      onSelectionChange?.({ from, to });
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
          className
        ),
      },
      handleDOMEvents: {
        mousemove: (view, event) => {
          // Get cursor position in editor
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (pos) {
            const rect = editorContainerRef.current?.getBoundingClientRect();
            if (rect) {
              onCursorMove?.({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                from: pos.pos,
                to: pos.pos,
              });
            }
          }
          return false;
        },
      },
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      try {
        const parsedContent = JSON.parse(content);
        // Only update if content is different to avoid cursor jumping
        const currentContent = JSON.stringify(editor.getJSON());
        if (currentContent !== content) {
          editor.commands.setContent(parsedContent, { emitUpdate: false });
        }
      } catch {
        // If content is not JSON, treat as HTML
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white relative" ref={editorContainerRef}>
      {editable && <EditorToolbar editor={editor} />}
      <div className="relative">
        <EditorContent editor={editor} />
        <CollaborationCursors cursors={collaborators} />
      </div>
    </div>
  );
}
