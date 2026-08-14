import express from 'express';
import { loadData, saveData, getTodayString } from '../db.js';
import { generateGeminiContent } from '../geminiService.js';

const router = express.Router();

// GET user's personal goals & habits
router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  const db = loadData();
  
  if (!db.personalGoals) db.personalGoals = [];

  const userGoals = userId 
    ? db.personalGoals.filter(g => g.userId === userId)
    : db.personalGoals;

  res.json(userGoals);
});

// CREATE new personal goal
router.post('/', (req, res) => {
  const { title, category = 'General', dueDate = getTodayString(0) } = req.body;
  const userId = req.headers['x-user-id'] || req.body.userId;

  if (!title) return res.status(400).json({ error: 'Goal title is required' });

  const db = loadData();
  if (!db.personalGoals) db.personalGoals = [];

  const newGoal = {
    id: `goal-${Date.now()}`,
    userId: userId || 'usr-guest',
    title,
    category,
    completed: false,
    dueDate,
    createdAt: getTodayString(0)
  };

  db.personalGoals.unshift(newGoal);
  saveData(db);

  res.status(201).json(newGoal);
});

// TOGGLE personal goal completion
router.patch('/:id/toggle', (req, res) => {
  const db = loadData();
  if (!db.personalGoals) db.personalGoals = [];

  const goal = db.personalGoals.find(g => g.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Personal goal not found' });

  goal.completed = !goal.completed;
  saveData(db);

  res.json(goal);
});

// DELETE personal goal
router.delete('/:id', (req, res) => {
  const db = loadData();
  if (!db.personalGoals) db.personalGoals = [];

  const index = db.personalGoals.findIndex(g => g.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Goal not found' });

  db.personalGoals.splice(index, 1);
  saveData(db);

  res.json({ message: 'Personal goal deleted' });
});

// AI PERSONAL ANALYZER & MOTIVATOR (WITH GEMINI SUPPORT)
router.post('/motivate', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.body.userId;
  const db = loadData();
  const user = db.users.find(u => u.id === userId) || { name: 'User' };

  const userGoals = (db.personalGoals || []).filter(g => g.userId === userId);
  const total = userGoals.length;
  const completedCount = userGoals.filter(g => g.completed).length;
  const pendingCount = total - completedCount;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Attempt Gemini API call
  const systemContext = `User: ${user.name}
Total Habits: ${total}
Completed Habits: ${completedCount} (${percent}%)
Pending Habits: ${userGoals.filter(g => !g.completed).map(g => g.title).join(', ')}`;

  const geminiMotivation = await generateGeminiContent(
    `Give a short, inspiring 2-sentence feedback and motivational coaching tip to ${user.name} based on their habit progress today.`,
    systemContext
  );

  if (geminiMotivation) {
    return res.json({
      summary: { total, completedCount, pendingCount, percent },
      message: geminiMotivation,
      motivationalTip: "Powered by Google Gemini 1.5 AI Coach"
    });
  }

  let feedback = '';
  let tip = '';

  if (total === 0) {
    feedback = `Hello ${user.name}! You haven't added any personal growth habits yet. Creating personal goals like reading, exercising, or learning helps maintain wellness alongside work.`;
    tip = "Try adding a personal habit like 'Drink 2 liters of water' or 'Read 15 minutes of a book'.";
  } else if (percent === 100) {
    feedback = `Outstanding achievement, ${user.name}! You've accomplished 100% (${completedCount}/${total}) of your personal growth goals for today. Consistent daily habits compound into massive long-term success.`;
    tip = "Rest well tonight and recharge for tomorrow's focus.";
  } else if (percent >= 50) {
    feedback = `Great momentum, ${user.name}! You're over halfway there with ${percent}% of your personal habits checked off (${completedCount}/${total} goals finished).`;
    tip = `Focus on finishing "${userGoals.find(g => !g.completed)?.title || 'your next goal'}" next to complete your streak!`;
  } else {
    feedback = `Keep pushing forward, ${user.name}! You've completed ${completedCount} out of ${total} personal goals today. Small consistent actions build resilience and balance.`;
    tip = "Tackle just one small personal habit right now to build momentum.";
  }

  res.json({
    summary: { total, completedCount, pendingCount, percent },
    message: feedback,
    motivationalTip: tip
  });
});

export default router;
