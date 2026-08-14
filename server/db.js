import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

export const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const defaultUsers = [
  {
    id: 'usr-1',
    username: 'alex',
    name: 'Alex Vance',
    email: 'alex@synhub.com',
    password: 'password123',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Product Manager'
  },
  {
    id: 'usr-2',
    username: 'sarah',
    name: 'Sarah Jenkins',
    email: 'sarah@synhub.com',
    password: 'password123',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Frontend Engineer'
  },
  {
    id: 'usr-3',
    username: 'mike',
    name: 'Mike Chen',
    email: 'mike@synhub.com',
    password: 'password123',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'UI/UX Designer'
  },
  {
    id: 'usr-4',
    username: 'emma',
    name: 'Emma Watson',
    email: 'emma@synhub.com',
    password: 'password123',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    title: 'Backend Engineer'
  }
];

const defaultProjects = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'Overhauling core landing pages, components, and dashboard UI for 2.0 release.',
    color: '#059669',
    createdAt: getTodayString(-10)
  },
  {
    id: 'proj-2',
    name: 'Mobile App v2.0',
    description: 'Rebuilding native iOS and Android application with offline sync.',
    color: '#10b981',
    createdAt: getTodayString(-7)
  },
  {
    id: 'proj-3',
    name: 'Internal Dev Tooling',
    description: 'Improving CI/CD pipeline speed, automated testing, and dev productivity.',
    color: '#d97706',
    createdAt: getTodayString(-5)
  }
];

const defaultTasks = [
  {
    id: 'tsk-101',
    title: 'Fix authentication login bug',
    description: 'Users reporting intermittent 401 token expiration errors during login retry.',
    projectId: 'proj-1',
    assigneeId: 'usr-2',
    assigneeName: 'Sarah Jenkins',
    priority: 'High',
    status: 'In Progress',
    dueDate: getTodayString(0),
    tags: ['Bug', 'Auth', 'Frontend'],
    inMyDay: true,
    isImportant: true,
    isPersonal: false,
    recurring: 'none',
    hasError: true,
    errorDetails: 'Cookie domain mismatch causing token drop in Safari browser.',
    errorSeverity: 'Critical',
    createdAt: getTodayString(-2),
    subtasks: [
      { id: 'sub-1', title: 'Reproduce token refresh issue in dev env', completed: true },
      { id: 'sub-2', title: 'Update Axios interceptor refresh token loop', completed: false },
      { id: 'sub-3', title: 'Add regression test suite', completed: false }
    ],
    comments: []
  },
  {
    id: 'tsk-102',
    title: 'Design hero section banner',
    description: 'Create high-resolution responsive hero illustrations and typography mockups in Figma.',
    projectId: 'proj-1',
    assigneeId: 'usr-3',
    assigneeName: 'Mike Chen',
    priority: 'High',
    status: 'Done',
    dueDate: getTodayString(-1),
    tags: ['Design', 'UI/UX'],
    inMyDay: false,
    isImportant: true,
    isPersonal: false,
    recurring: 'none',
    hasError: false,
    errorDetails: '',
    errorSeverity: 'Low',
    createdAt: getTodayString(-4),
    subtasks: [],
    comments: []
  },
  {
    id: 'tsk-103',
    title: 'Optimize SQL database index performance',
    description: 'Slow queries on task search endpoint when filtering by project tags.',
    projectId: 'proj-3',
    assigneeId: 'usr-4',
    assigneeName: 'Emma Watson',
    priority: 'Medium',
    status: 'To Do',
    dueDate: getTodayString(1),
    tags: ['Database', 'Performance'],
    inMyDay: false,
    isImportant: false,
    isPersonal: false,
    recurring: 'none',
    hasError: false,
    errorDetails: '',
    errorSeverity: 'Low',
    createdAt: getTodayString(-1),
    subtasks: [],
    comments: []
  }
];

const defaultPersonalGoals = [
  {
    id: 'goal-1',
    userId: 'usr-2',
    title: 'Read 20 pages of technical architecture book',
    category: 'Learning',
    completed: true,
    dueDate: getTodayString(0),
    createdAt: getTodayString(0)
  }
];

const defaultChatMessages = [
  {
    id: 'msg-1',
    projectId: 'proj-1',
    userId: 'usr-1',
    userName: 'Alex Vance',
    userAvatar: defaultUsers[0].avatar,
    text: 'Hey team, let us make sure the website redesign hero section is ready by Friday.',
    isSystemMessage: false,
    timestamp: '09:30 AM'
  },
  {
    id: 'msg-2',
    projectId: 'proj-1',
    userId: 'usr-2',
    userName: 'Sarah Jenkins',
    userAvatar: defaultUsers[1].avatar,
    text: 'Working on the Safari auth cookie bug fix right now.',
    isSystemMessage: false,
    timestamp: '09:42 AM'
  },
  {
    id: 'msg-3',
    projectId: 'proj-1',
    userId: 'system',
    userName: 'System',
    userAvatar: '',
    text: 'Sarah Jenkins marked "Fix authentication login bug" as In Progress',
    isSystemMessage: true,
    timestamp: '09:45 AM'
  }
];

export function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving Synhub DB file:', err);
  }
}

export function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        if (!parsed.settings) parsed.settings = { geminiApiKey: '' };
        return parsed;
      }
    } catch (err) {
      console.error('Error reading Synhub DB file:', err);
    }
  }

  const initial = {
    users: defaultUsers,
    projects: defaultProjects,
    tasks: defaultTasks,
    personalGoals: defaultPersonalGoals,
    chatMessages: defaultChatMessages,
    settings: { geminiApiKey: '' }
  };
  saveData(initial);
  return initial;
}
