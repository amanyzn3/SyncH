import express from 'express';
import { loadData, saveData, getTodayString } from '../db.js';

const router = express.Router();

function verifyCanEdit(userHeaderId, userHeaderRole, task) {
  if (userHeaderRole === 'manager') return true;
  if (!userHeaderId) return true;
  return task.assigneeId === userHeaderId || (task.isPersonal && task.assigneeId === userHeaderId);
}

// GET all tasks (with optional query filters)
router.get('/', (req, res) => {
  const db = loadData();
  let tasks = db.tasks;
  
  const { assigneeId, projectId, status, priority, inMyDay, dueToday, search, isPersonal, hasError } = req.query;

  if (assigneeId) {
    tasks = tasks.filter((t) => t.assigneeId === assigneeId);
  }

  if (projectId) {
    tasks = tasks.filter((t) => t.projectId === projectId);
  }

  if (status) {
    tasks = tasks.filter((t) => t.status === status);
  }

  if (priority) {
    tasks = tasks.filter((t) => t.priority === priority);
  }

  if (inMyDay === 'true') {
    const today = getTodayString(0);
    tasks = tasks.filter((t) => t.inMyDay || t.dueDate === today);
  }

  if (dueToday === 'true') {
    const today = getTodayString(0);
    tasks = tasks.filter((t) => t.dueDate === today);
  }

  if (isPersonal === 'true') {
    tasks = tasks.filter((t) => t.isPersonal === true);
  } else if (isPersonal === 'false') {
    tasks = tasks.filter((t) => !t.isPersonal);
  }

  if (hasError === 'true') {
    tasks = tasks.filter((t) => t.hasError === true);
  }

  if (search) {
    const q = search.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }

  res.json(tasks);
});

// GET single task
router.get('/:id', (req, res) => {
  const db = loadData();
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// CREATE new task
router.post('/', (req, res) => {
  const {
    title,
    description = '',
    projectId = null,
    assigneeId,
    assigneeName = 'Unassigned',
    priority = 'Medium',
    status = 'To Do',
    dueDate = getTodayString(0),
    tags = [],
    inMyDay = false,
    isImportant = false,
    isPersonal = false,
    recurring = 'none',
    subtasks = []
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const db = loadData();
  
  let resolvedAssigneeName = assigneeName;
  if (assigneeId) {
    const user = db.users.find((u) => u.id === assigneeId);
    if (user) resolvedAssigneeName = user.name;
  }

  const newTask = {
    id: `tsk-${Date.now()}`,
    title,
    description,
    projectId,
    assigneeId,
    assigneeName: resolvedAssigneeName,
    priority,
    status,
    dueDate,
    tags: Array.isArray(tags) ? tags : tags.split(',').map((s) => s.trim()).filter(Boolean),
    inMyDay: Boolean(inMyDay),
    isImportant: Boolean(isImportant),
    isPersonal: Boolean(isPersonal),
    recurring,
    hasError: false,
    errorDetails: '',
    errorSeverity: 'Low',
    createdAt: getTodayString(0),
    subtasks: subtasks.map((st, index) => ({
      id: `sub-${Date.now()}-${index}`,
      title: typeof st === 'string' ? st : st.title,
      completed: typeof st === 'object' ? Boolean(st.completed) : false
    })),
    comments: []
  };

  db.tasks.unshift(newTask);

  // AUTO-UPDATE FEATURE 3: Post system chat message on task creation if in a project
  if (projectId) {
    if (!db.chatMessages) db.chatMessages = [];
    db.chatMessages.push({
      id: `msg-sys-${Date.now()}`,
      projectId,
      userId: 'system',
      userName: 'System',
      userAvatar: '',
      text: `New task created: "${title}" (Assigned to ${resolvedAssigneeName})`,
      isSystemMessage: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  saveData(db);

  res.status(201).json(newTask);
});

// UPDATE task (with RBAC check)
router.put('/:id', (req, res) => {
  const db = loadData();
  const index = db.tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const existingTask = db.tasks[index];
  const userHeaderId = req.headers['x-user-id'] || req.body.requestUserId;
  const userHeaderRole = req.headers['x-user-role'] || req.body.requestUserRole;

  if (!verifyCanEdit(userHeaderId, userHeaderRole, existingTask)) {
    return res.status(403).json({ error: 'Access denied: Employees can only edit their assigned tasks' });
  }

  const updates = req.body;

  if (updates.assigneeId && updates.assigneeId !== existingTask.assigneeId) {
    const user = db.users.find((u) => u.id === updates.assigneeId);
    if (user) updates.assigneeName = user.name;
  }

  const updatedTask = {
    ...existingTask,
    ...updates,
    id: existingTask.id
  };

  db.tasks[index] = updatedTask;
  saveData(db);

  res.json(updatedTask);
});

// UPDATE status (with RBAC check & AUTO CHAT SYSTEM MESSAGE)
router.patch('/:id/status', (req, res) => {
  const { status, requestUserId, requestUserRole } = req.body;
  const userHeaderId = req.headers['x-user-id'] || requestUserId;
  const userHeaderRole = req.headers['x-user-role'] || requestUserRole;

  if (!['To Do', 'In Progress', 'Done'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = loadData();
  const task = db.tasks.find((t) => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (!verifyCanEdit(userHeaderId, userHeaderRole, task)) {
    return res.status(403).json({ error: 'Access denied: Employees can only edit their assigned tasks' });
  }

  const previousStatus = task.status;
  task.status = status;

  // DEDUPLICATION FIX for recurring tasks:
  if (status === 'Done' && task.recurring && task.recurring !== 'none') {
    let nextOffset = 1;
    if (task.recurring === 'weekly') nextOffset = 7;
    const targetNextDate = getTodayString(nextOffset);

    const existingNext = db.tasks.find(
      t => t.title === task.title && t.assigneeId === task.assigneeId && t.dueDate === targetNextDate && t.status === 'To Do'
    );

    if (!existingNext) {
      const nextTask = {
        ...task,
        id: `tsk-${Date.now()}`,
        status: 'To Do',
        dueDate: targetNextDate,
        inMyDay: false,
        hasError: false,
        errorDetails: '',
        subtasks: task.subtasks.map((s, i) => ({ ...s, id: `sub-${Date.now()}-${i}`, completed: false })),
        comments: []
      };
      db.tasks.unshift(nextTask);
    }
  }

  // AUTO-UPDATE FEATURE 3: Post short system message into project chat
  if (task.projectId && previousStatus !== status) {
    if (!db.chatMessages) db.chatMessages = [];

    const actor = db.users.find(u => u.id === userHeaderId) || { name: task.assigneeName || 'Team Member' };
    const systemText = `${actor.name} marked "${task.title}" as ${status}`;

    db.chatMessages.push({
      id: `msg-sys-${Date.now()}`,
      projectId: task.projectId,
      userId: 'system',
      userName: 'System',
      userAvatar: '',
      text: systemText,
      isSystemMessage: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  saveData(db);
  res.json(task);
});

// REPORT TASK ERROR / BLOCKER
router.patch('/:id/report-error', (req, res) => {
  const { errorDetails, errorSeverity = 'Medium' } = req.body;
  if (!errorDetails) return res.status(400).json({ error: 'Error details are required' });

  const db = loadData();
  const task = db.tasks.find((t) => t.id === req.params.id);

  if (!task) return res.status(404).json({ error: 'Task not found' });

  task.hasError = true;
  task.errorDetails = errorDetails;
  task.errorSeverity = errorSeverity;

  // AUTO-UPDATE FEATURE 3: Post error warning into project chat
  if (task.projectId) {
    if (!db.chatMessages) db.chatMessages = [];
    db.chatMessages.push({
      id: `msg-sys-${Date.now()}`,
      projectId: task.projectId,
      userId: 'system',
      userName: 'System',
      userAvatar: '',
      text: `Issue reported on "${task.title}": ${errorDetails}`,
      isSystemMessage: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  saveData(db);
  res.json(task);
});

// RESOLVE TASK ERROR
router.patch('/:id/resolve-error', (req, res) => {
  const db = loadData();
  const task = db.tasks.find((t) => t.id === req.params.id);

  if (!task) return res.status(404).json({ error: 'Task not found' });

  task.hasError = false;
  task.errorDetails = '';

  saveData(db);
  res.json(task);
});

// TOGGLE My Day flag
router.patch('/:id/toggle-myday', (req, res) => {
  const db = loadData();
  const task = db.tasks.find((t) => t.id === req.params.id);

  if (!task) return res.status(404).json({ error: 'Task not found' });

  task.inMyDay = !task.inMyDay;
  saveData(db);
  res.json(task);
});

// TOGGLE Important flag
router.patch('/:id/toggle-important', (req, res) => {
  const db = loadData();
  const task = db.tasks.find((t) => t.id === req.params.id);

  if (!task) return res.status(404).json({ error: 'Task not found' });

  task.isImportant = !task.isImportant;
  saveData(db);
  res.json(task);
});

// DELETE task
router.delete('/:id', (req, res) => {
  const db = loadData();
  const index = db.tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  const existingTask = db.tasks[index];
  const userHeaderId = req.headers['x-user-id'];
  const userHeaderRole = req.headers['x-user-role'];

  if (!verifyCanEdit(userHeaderId, userHeaderRole, existingTask)) {
    return res.status(403).json({ error: 'Access denied: Employees can only edit or delete their assigned tasks' });
  }

  db.tasks.splice(index, 1);
  saveData(db);
  res.json({ message: 'Task deleted successfully' });
});

export default router;
