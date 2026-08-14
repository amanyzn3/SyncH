import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { 
  Sun, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Star, 
  Sparkles,
  User,
  ShieldCheck,
  Clock,
  Layers
} from 'lucide-react';

export default function MyDayPage({ onSelectTask, onOpenCreateTask, onOpenAIChat }) {
  const { user } = useAuth();
  const { tasks, searchQuery } = useTasks();
  const [activeSubTab, setActiveSubTab] = useState('myday');

  const isManager = user?.role === 'manager';

  const todayStr = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  // STRICT RULE: Employee Dashboard displays ONLY tasks assigned to the logged-in user
  let userTasks = tasks.filter(t => t.assigneeId === user?.id && !t.isPersonal);

  if (searchQuery) {
    userTasks = userTasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }

  const myDayTasks = userTasks.filter(t => (t.inMyDay || t.dueDate === todayStr));
  const importantTasks = userTasks.filter(t => t.isImportant);

  const displayedTasks = activeSubTab === 'myday' ? myDayTasks
    : activeSubTab === 'important' ? importantTasks
    : userTasks;

  const completedCount = userTasks.filter(t => t.status === 'Done').length;
  const progressPercent = userTasks.length > 0 ? Math.round((completedCount / userTasks.length) * 100) : 0;
  const overdueCount = userTasks.filter(t => t.dueDate < todayStr && t.status !== 'Done').length;

  return (
    <div style={{ padding: '1.75rem 2rem', width: '100%' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={28} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Employee Dashboard — {user?.name}
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {dateFormatted} — Managing assigned deliverables
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onOpenAIChat}
            className="btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span>AI Assistant</span>
          </button>

          {isManager && (
            <button
              onClick={() => onOpenCreateTask(null, true)}
              className="btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span>Assign Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left (Assigned Tasks List), Right (Overview Sidebar Panel) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.75rem' }}>
        
        {/* Left Column: Sub-Tabs & Tasks List */}
        <div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.65rem',
            marginBottom: '1.25rem'
          }}>
            <button
              onClick={() => setActiveSubTab('myday')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: '600',
                backgroundColor: activeSubTab === 'myday' ? 'var(--primary)' : 'transparent',
                color: activeSubTab === 'myday' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              My Day ({myDayTasks.length})
            </button>

            <button
              onClick={() => setActiveSubTab('important')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: '600',
                backgroundColor: activeSubTab === 'important' ? 'var(--primary)' : 'transparent',
                color: activeSubTab === 'important' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              Flagged ({importantTasks.length})
            </button>

            <button
              onClick={() => setActiveSubTab('all')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: '600',
                backgroundColor: activeSubTab === 'all' ? 'var(--primary)' : 'transparent',
                color: activeSubTab === 'all' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              All Assigned ({userTasks.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {displayedTasks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <ShieldCheck size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                  No assigned tasks scheduled
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                  No assigned deliverables found for your profile in this view.
                </p>
              </div>
            ) : (
              displayedTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onSelectTask={onSelectTask}
                  isListView={true}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar Panel: Workload Metrics & Upcoming Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Progress Card */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} /> Deliverables Progress
            </h4>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.2rem' }}>
              {progressPercent}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {completedCount} of {userTasks.length} tasks finished
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: 'var(--primary)', borderRadius: '99px' }} />
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} style={{ color: 'var(--accent-amber)' }} /> Summary Overview
            </h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Due Today</span>
              <strong style={{ color: 'var(--text-primary)' }}>{myDayTasks.length}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Flagged Items</span>
              <strong style={{ color: 'var(--accent-amber)' }}>{importantTasks.length}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Overdue Items</span>
              <strong style={{ color: overdueCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>{overdueCount}</strong>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
