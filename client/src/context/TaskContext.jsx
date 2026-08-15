import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active filters
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected task for detail view
  const [selectedTask, setSelectedTask] = useState(null);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
      const [fetchedTasks, fetchedProjects] = await Promise.all([
        fetchApi('/tasks', { headers }),
        fetchApi('/projects', { headers })
      ]);

      setTasks(fetchedTasks);
      setProjects(fetchedProjects);
    } catch (err) {
      console.error('Error loading initial task data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const fetchChatMessages = useCallback(async (projectId) => {
    if (!projectId || projectId === 'ALL') {
      setChatMessages([]);
      return;
    }
    try {
      const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
      const messages = await fetchApi(`/chat/${projectId}`, { headers });
      setChatMessages(messages);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  }, [user]);

  const sendChatMessage = async (projectId, text = '', replyTo = null, attachment = null) => {
    if (!projectId || (!text.trim() && !attachment)) return;
    try {
      const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
      const newMessage = await fetchApi(`/chat/${projectId}`, {
        method: 'POST',
        headers,
        body: { 
          text: text.trim(), 
          userId: user?.id,
          userRole: user?.role,
          replyTo,
          attachment
        }
      });
      setChatMessages((prev) => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      console.error('Error sending chat message:', err);
    }
  };

  const refreshTasks = async () => {
    const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
    const [fetchedTasks, fetchedProjects] = await Promise.all([
      fetchApi('/tasks', { headers }),
      fetchApi('/projects', { headers })
    ]);
    setTasks(fetchedTasks);
    setProjects(fetchedProjects);

    if (filterProject && filterProject !== 'ALL') {
      fetchChatMessages(filterProject);
    }
  };

  const createProject = async (projectData) => {
    const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
    const newProj = await fetchApi('/projects', {
      method: 'POST',
      headers,
      body: projectData
    });
    setProjects((prev) => [...prev, newProj]);
    return newProj;
  };

  const createTask = async (taskData) => {
    const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
    const newTask = await fetchApi('/tasks', {
      method: 'POST',
      headers,
      body: taskData
    });
    setTasks((prev) => [newTask, ...prev]);
    if (taskData.projectId) {
      fetchChatMessages(taskData.projectId);
    }
    return newTask;
  };

  const updateTask = async (taskId, updates) => {
    const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
    const updated = await fetchApi(`/tasks/${taskId}`, {
      method: 'PUT',
      headers,
      body: { ...updates, requestUserId: user?.id, requestUserRole: user?.role }
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated);
    }
    return updated;
  };

  const moveTaskStatus = async (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
      const updated = await fetchApi(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers,
        body: { status: newStatus, requestUserId: user?.id, requestUserRole: user?.role }
      });
      
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      
      if (updated.projectId) {
        fetchChatMessages(updated.projectId);
      }
    } catch (err) {
      console.error('Error moving task status:', err);
      refreshTasks();
    }
  };

  const reportTaskError = async (taskId, errorDetails, errorSeverity) => {
    const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
    const updated = await fetchApi(`/tasks/${taskId}/report-error`, {
      method: 'PATCH',
      headers,
      body: { errorDetails, errorSeverity }
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (updated.projectId) {
      fetchChatMessages(updated.projectId);
    }
    return updated;
  };

  const resolveTaskError = async (taskId) => {
    const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
    const updated = await fetchApi(`/tasks/${taskId}/resolve-error`, {
      method: 'PATCH',
      headers
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  };

  const toggleMyDay = async (taskId) => {
    const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
    const updated = await fetchApi(`/tasks/${taskId}/toggle-myday`, { method: 'PATCH', headers });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  };

  const toggleImportant = async (taskId) => {
    const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
    const updated = await fetchApi(`/tasks/${taskId}/toggle-important`, { method: 'PATCH', headers });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  };

  const deleteTask = async (taskId) => {
    const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } : {};
    await fetchApi(`/tasks/${taskId}`, { method: 'DELETE', headers });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        chatMessages,
        loading,
        filterProject,
        setFilterProject,
        filterAssignee,
        setFilterAssignee,
        filterPriority,
        setFilterPriority,
        searchQuery,
        setSearchQuery,
        selectedTask,
        setSelectedTask,
        createProject,
        createTask,
        updateTask,
        moveTaskStatus,
        reportTaskError,
        resolveTaskError,
        toggleMyDay,
        toggleImportant,
        deleteTask,
        refreshTasks,
        fetchChatMessages,
        sendChatMessage
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
}
