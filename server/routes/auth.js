import express from 'express';
import { loadData, saveData } from '../db.js';

const router = express.Router();

router.get('/users', (req, res) => {
  const db = loadData();
  const sanitizedUsers = db.users.map(({ password, ...user }) => user);
  res.json(sanitizedUsers);
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = loadData();
  
  const user = db.users.find(
    (u) => u.email.toLowerCase() === (email || '').toLowerCase()
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    message: 'Login successful',
    user: userWithoutPassword
  });
});

router.post('/signup', (req, res) => {
  const { name, email, password, role, title } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const db = loadData();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    username: name.toLowerCase().replace(/\s+/g, ''),
    name,
    email,
    password,
    role: role === 'manager' ? 'manager' : 'employee',
    title: title || (role === 'manager' ? 'Team Manager' : 'Team Member'),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
  };

  db.users.push(newUser);
  saveData(db);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    message: 'Account created successfully',
    user: userWithoutPassword
  });
});

export default router;
