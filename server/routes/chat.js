import express from 'express';
import { loadData, saveData } from '../db.js';

const router = express.Router();

function canAccessProjectChat(db, userId, userRole, projectId) {
  if (!userId || userRole === 'manager') return true;
  const proj = db.projects.find((p) => p.id === projectId);
  if (!proj) return true;
  const isMember = Array.isArray(proj.members) && proj.members.includes(userId);
  const hasAssignedTask = db.tasks.some((t) => t.projectId === projectId && t.assigneeId === userId);
  return isMember || hasAssignedTask;
}

// GET chat messages for a specific project
router.get('/:projectId', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  const userRole = req.headers['x-user-role'] || req.query.userRole;

  const db = loadData();
  if (!db.chatMessages) db.chatMessages = [];

  if (!canAccessProjectChat(db, userId, userRole, req.params.projectId)) {
    return res.status(403).json({ error: 'Access denied. Only project co-workers can access this chat.' });
  }

  const projectMessages = db.chatMessages.filter(
    (m) => m.projectId === req.params.projectId
  );

  res.json(projectMessages);
});

// POST new user chat message to a project
router.post('/:projectId', (req, res) => {
  const { text, replyTo, attachment } = req.body;
  const userId = req.headers['x-user-id'] || req.body.userId;
  const userRole = req.headers['x-user-role'] || req.body.userRole;

  const db = loadData();
  if (!db.chatMessages) db.chatMessages = [];

  if (!canAccessProjectChat(db, userId, userRole, req.params.projectId)) {
    return res.status(403).json({ error: 'Access denied. Only project co-workers can post in this chat.' });
  }

  if ((!text || !text.trim()) && !attachment) {
    return res.status(400).json({ error: 'Message text or attachment is required' });
  }

  const sender = db.users.find((u) => u.id === userId) || {
    id: 'usr-guest',
    name: 'Team Member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
  };

  const newMessage = {
    id: `msg-${Date.now()}`,
    projectId: req.params.projectId,
    userId: sender.id,
    userName: sender.name,
    userAvatar: sender.avatar,
    text: text ? text.trim() : '',
    replyTo: replyTo || null,
    attachment: attachment || null,
    isSystemMessage: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  db.chatMessages.push(newMessage);
  saveData(db);

  res.status(201).json(newMessage);
});

export default router;
