import express from 'express';
import { loadData, saveData } from '../db.js';

const router = express.Router();

// ADD comment to a task
router.post('/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { text, authorId, authorName, authorAvatar } = req.body;

  if (!text) return res.status(400).json({ error: 'Comment text is required' });

  const db = loadData();
  const task = db.tasks.find((t) => t.id === taskId);

  if (!task) return res.status(404).json({ error: 'Task not found' });

  const newComment = {
    id: `cmt-${Date.now()}`,
    authorId: authorId || 'usr-guest',
    authorName: authorName || 'Anonymous',
    authorAvatar: authorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
    text,
    timestamp: 'Just now'
  };

  if (!task.comments) task.comments = [];
  task.comments.push(newComment);
  saveData(db);

  res.status(201).json(newComment);
});

export default router;
