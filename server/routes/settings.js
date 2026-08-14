import express from 'express';
import { loadData, saveData } from '../db.js';

const router = express.Router();

// GET settings
router.get('/', (req, res) => {
  const db = loadData();
  if (!db.settings) {
    db.settings = { geminiApiKey: '' };
  }
  res.json(db.settings);
});

// SAVE settings
router.post('/', (req, res) => {
  const { geminiApiKey } = req.body;
  const db = loadData();
  
  if (!db.settings) {
    db.settings = {};
  }

  if (geminiApiKey !== undefined) {
    db.settings.geminiApiKey = geminiApiKey.trim();
  }

  saveData(db);
  res.json({ message: 'Settings saved successfully', settings: db.settings });
});

export default router;
