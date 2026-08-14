import express from 'express';
import { loadData, saveData } from '../db.js';

const router = express.Router();

// GET chat messages for a specific project
router.get('/:projectId', (req, res) => {
  const db = loadData();
  if (!db.chatMessages) db.chatMessages = [];

  const projectMessages = db.chatMessages.filter(
    (m) => m.projectId === req.params.projectId
  );

  res.json(projectMessages);
});

// POST new user chat message to a project
router.post('/:projectId', (req, res) => {
  const { text } = req.body;
  const userId = req.headers['x-user-id'] || req.body.userId;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const db = loadData();
  if (!db.chatMessages) db.chatMessages = [];

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
    text: text.trim(),
    isSystemMessage: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  db.chatMessages.push(newMessage);
  saveData(db);

  res.status(201).json(newMessage);
});

export default router;
