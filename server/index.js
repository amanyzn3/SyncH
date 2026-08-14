import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import commentRoutes from './routes/comments.js';
import aiRoutes from './routes/ai.js';
import personalRoutes from './routes/personal.js';
import chatRoutes from './routes/chat.js';
import settingsRoutes from './routes/settings.js';
import { loadData } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

loadData();

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Synhub API', timestamp: new Date().toISOString() });
});

const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Synhub Server Running. Frontend running on Vite dev server.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Synhub Backend Express Server listening on http://localhost:${PORT}`);
});
