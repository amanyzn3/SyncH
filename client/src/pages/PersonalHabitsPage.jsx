import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchApi } from '../utils/api.js';
import { 
  Sun, 
  Star, 
  Calendar, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Award,
  Heart,
  Tag,
  Smile,
  BookOpen,
  TrendingUp,
  Target
} from 'lucide-react';

export default function PersonalHabitsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Learning');
  const [isImportantNew, setIsImportantNew] = useState(false);
  const [activeTab, setActiveTab] = useState('myday');

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const loadPersonalGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchApi(`/personal?userId=${user?.id}`, {
        headers: { 'x-user-id': user?.id || '' }
      });
      setGoals(data);
    } catch (err) {
      console.error('Error fetching personal goals:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPersonalGoals();
    }
  }, [user, loadPersonalGoals]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await fetchApi('/personal', {
        method: 'POST',
        headers: { 'x-user-id': user?.id || '' },
        body: { 
          title: newTitle.trim(), 
          category: newCategory, 
          userId: user?.id,
          isImportant: isImportantNew
        }
      });
      setGoals(prev => [created, ...prev]);
      setNewTitle('');
      setIsImportantNew(false);
    } catch (err) {
      console.error('Error adding personal goal:', err);
    }
  };

  const handleToggleGoal = async (goalId) => {
    setGoals(prev => prev.map(g => (g.id === goalId ? { ...g, completed: !g.completed } : g)));
    try {
      const updated = await fetchApi(`/personal/${goalId}/toggle`, {
        method: 'PATCH',
        headers: { 'x-user-id': user?.id || '' }
      });
      setGoals(prev => prev.map(g => (g.id === goalId ? updated : g)));
    } catch (err) {
      loadPersonalGoals();
    }
  };

  const handleToggleImportantGoal = (goalId) => {
    setGoals(prev => prev.map(g => (g.id === goalId ? { ...g, isImportant: !g.isImportant } : g)));
  };

  const handleDeleteGoal = async (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    try {
      await fetchApi(`/personal/${goalId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || '' }
      });
    } catch (err) {
      loadPersonalGoals();
    }
  };

  const handleAnalyzeAndMotivate = async () => {
    try {
      setAiLoading(true);
      const res = await fetchApi('/personal/motivate', {
        method: 'POST',
        headers: { 'x-user-id': user?.id || '' },
        body: { userId: user?.id }
      });
      setAiAnalysis(res);
    } catch (err) {
      console.error('Error generating AI motivation:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const myDayGoals = goals.filter(g => g.dueDate === todayStr || !g.dueDate);
  const importantGoals = goals.filter(g => g.isImportant);
  const plannedGoals = goals.filter(g => g.dueDate);
  const habitGoals = goals.filter(g => g.category === 'Learning' || g.category === 'Health & Wellness');

  const displayedGoals = activeTab === 'myday' ? myDayGoals
    : activeTab === 'important' ? importantGoals
    : activeTab === 'planned' ? plannedGoals
    : habitGoals;

  const completedCount = goals.filter(g => g.completed).length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <div style={{ padding: '1.75rem 2rem', width: '100%' }}>
      
      {/* Hero Header */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem 2rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sun size={32} style={{ color: 'var(--accent-amber)' }} />
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Personal To-Do & Habits Hub — {user?.name}
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {dateFormatted} — Private habits, focus list, and personal goals
          </p>
        </div>

        <button
          onClick={handleAnalyzeAndMotivate}
          className="btn-primary"
          disabled={aiLoading}
          style={{ fontSize: '0.85rem', padding: '0.6rem 1.1rem' }}
        >
          <Sparkles size={16} />
          <span>AI Habit Motivator</span>
        </button>
      </div>

      {/* 2-Column Full Width Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.75rem' }}>
        
        {/* Left Column: Sub-Tabs, Quick Add & Task List */}
        <div>
          <div style={{
            display: 'flex',
            gap: '0.6rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setActiveTab('myday')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: activeTab === 'myday' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'myday' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <Sun size={16} /> My Day ({myDayGoals.length})
            </button>

            <button
              onClick={() => setActiveTab('important')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: activeTab === 'important' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'important' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <Star size={16} fill={activeTab === 'important' ? 'currentColor' : 'none'} /> Important ({importantGoals.length})
            </button>

            <button
              onClick={() => setActiveTab('planned')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: activeTab === 'planned' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'planned' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <Calendar size={16} /> Planned ({plannedGoals.length})
            </button>

            <button
              onClick={() => setActiveTab('habits')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: activeTab === 'habits' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'habits' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <Heart size={16} /> Habits & Learning ({habitGoals.length})
            </button>
          </div>

          {/* Quick Add Bar */}
          <form onSubmit={handleAddGoal} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Plus size={20} style={{ color: 'var(--primary)' }} />
            <input
              type="text"
              placeholder="Add a personal task or habit..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.95rem' }}
            />
            
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.65rem' }}
            >
              <option value="Learning">Learning</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Skill Development">Skill Development</option>
              <option value="Personal Goal">Personal Goal</option>
            </select>

            <button
              type="button"
              onClick={() => setIsImportantNew(!isImportantNew)}
              style={{ color: isImportantNew ? 'var(--accent-amber)' : 'var(--text-muted)', padding: '0.35rem' }}
              title="Flag as Important"
            >
              <Star size={18} fill={isImportantNew ? 'currentColor' : 'none'} />
            </button>

            <button type="submit" className="btn-primary" style={{ padding: '0.45rem 1rem' }}>
              Add Task
            </button>
          </form>

          {/* Tasks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {displayedGoals.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <Smile size={38} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                  No personal tasks in this view
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                  Type your personal habits or goals in the "Add a task" field above to get started.
                </p>
              </div>
            ) : (
              displayedGoals.map((g) => (
                <div
                  key={g.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-sm)',
                    opacity: g.completed ? 0.65 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                    <button
                      onClick={() => handleToggleGoal(g.id)}
                      style={{ color: g.completed ? 'var(--accent-green)' : 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {g.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>

                    <div>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '0.92rem',
                        textDecoration: g.completed ? 'line-through' : 'none',
                        color: 'var(--text-primary)'
                      }}>
                        {g.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span className="badge badge-status" style={{ fontSize: '0.7rem' }}>
                          {g.category}
                        </span>
                        {g.dueDate && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Due: {g.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      onClick={() => handleToggleImportantGoal(g.id)}
                      style={{ color: g.isImportant ? 'var(--accent-amber)' : 'var(--text-muted)', padding: '0.35rem' }}
                      title="Flag Important"
                    >
                      <Star size={18} fill={g.isImportant ? 'currentColor' : 'none'} />
                    </button>

                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      style={{ color: 'var(--accent-red)', padding: '0.35rem' }}
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar: AI Motivation & Habit Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* AI Coach Banner */}
          {aiAnalysis ? (
            <div style={{
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                <Award size={18} /> AI Habit Coach
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '0.5rem' }}>
                {aiAnalysis.message}
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600', backgroundColor: 'var(--bg-surface)', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-md)' }}>
                Tip: {aiAnalysis.motivationalTip}
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <Sparkles size={28} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>AI Habit Motivation</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Analyze your personal goals to receive personalized feedback and daily encouragement.
              </p>
              <button onClick={handleAnalyzeAndMotivate} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}>
                Analyze My Progress
              </button>
            </div>
          )}

          {/* Progress Widget */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Target size={16} style={{ color: 'var(--primary)' }} /> Habit Progress
            </h4>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.2rem' }}>
              {progressPercent}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {completedCount} of {goals.length} goals completed today
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: 'var(--primary)', borderRadius: '99px' }} />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
