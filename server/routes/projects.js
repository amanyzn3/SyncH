import express from 'express';
import { loadData, saveData, getTodayString } from '../db.js';

const router = express.Router();

// GET all projects with task stats summary
router.get('/', (req, res) => {
  const db = loadData();
  const projectsWithStats = db.projects.map((proj) => {
    const projTasks = db.tasks.filter((t) => t.projectId === proj.id);
    const total = projTasks.length;
    const done = projTasks.filter((t) => t.status === 'Done').length;
    const inProgress = projTasks.filter((t) => t.status === 'In Progress').length;
    const toDo = projTasks.filter((t) => t.status === 'To Do').length;

    return {
      ...proj,
      stats: {
        total,
        done,
        inProgress,
        toDo,
        progressPercent: total > 0 ? Math.round((done / total) * 100) : 0
      }
    };
  });

  res.json(projectsWithStats);
});

// CREATE new project
router.post('/', (req, res) => {
  const { name, description = '', color = '#6366f1' } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });

  const db = loadData();
  const newProject = {
    id: `proj-${Date.now()}`,
    name,
    description,
    color,
    createdAt: getTodayString(0)
  };

  db.projects.push(newProject);
  saveData(db);

  res.status(201).json(newProject);
});

export default router;
