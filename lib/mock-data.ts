import { User, AuthUser, Project, DocumentPage, KanbanBoard } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@froncort.ai',
    color: '#3b82f6',
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@froncort.ai',
    color: '#10b981',
  },
  {
    id: 'user-3',
    name: 'Carol White',
    email: 'carol@froncort.ai',
    color: '#f59e0b',
  },
];

export const CURRENT_USER: AuthUser = {
  ...MOCK_USERS[0],
  role: 'admin',
};

export function generateMockProject(): Project {
  return {
    id: 'project-1',
    name: 'Froncort Platform',
    description: 'Main development project for Froncort AI platform',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    members: [
      { userId: 'user-1', role: 'admin', addedAt: new Date('2024-01-01') },
      { userId: 'user-2', role: 'editor', addedAt: new Date('2024-01-02') },
      { userId: 'user-3', role: 'viewer', addedAt: new Date('2024-01-03') },
    ],
  };
}

export function generateMockPage(projectId: string): DocumentPage {
  return {
    id: `page-${Date.now()}`,
    projectId,
    title: 'Getting Started',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Welcome to Froncort' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a collaborative workspace for your team.',
            },
          ],
        },
      ],
    }),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    createdBy: 'user-1',
    lastEditedBy: 'user-1',
    versions: [],
  };
}

export function generateMockKanbanBoard(projectId: string): KanbanBoard {
  const timestamp = Date.now();
  return {
    id: `board-${timestamp}`,
    projectId,
    name: 'Sprint Board',
    columns: [
      {
        id: `col-${timestamp}-1`,
        title: 'To Do',
        order: 0,
        cards: [
          {
            id: `card-${timestamp}-1`,
            title: 'Setup authentication',
            description: 'Implement user authentication flow',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date(),
            createdBy: 'user-1',
            order: 0,
            labels: [{ id: `label-${timestamp}-1`, name: 'Feature', color: '#3b82f6' }],
          },
        ],
      },
      {
        id: `col-${timestamp}-2`,
        title: 'In Progress',
        order: 1,
        cards: [],
      },
      {
        id: `col-${timestamp}-3`,
        title: 'Done',
        order: 2,
        cards: [],
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  };
}
