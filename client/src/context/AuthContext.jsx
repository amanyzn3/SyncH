import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../utils/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('synhub_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'usr-2',
      username: 'sarah',
      name: 'Sarah Jenkins',
      email: 'sarah@synhub.com',
      role: 'employee',
      title: 'Senior Frontend Engineer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    };
  });

  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('synhub_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('synhub_user');
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const users = await fetchApi('/auth/users');
      setAllUsers(users);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const login = async (email, password) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    setUser(data.user);
    return data.user;
  };

  const signup = async (name, email, password, role, title) => {
    const data = await fetchApi('/auth/signup', {
      method: 'POST',
      body: { name, email, password, role, title }
    });
    setUser(data.user);
    loadUsers();
    return data.user;
  };

  const logout = () => {
    setUser(null);
  };

  const canEditTask = (task) => {
    if (!user || !task) return false;
    if (user.role === 'manager') return true;
    return task.assigneeId === user.id || (task.isPersonal && task.assigneeId === user.id);
  };

  return (
    <AuthContext.Provider value={{ user, allUsers, login, signup, logout, loadUsers, canEditTask }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
