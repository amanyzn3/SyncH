import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';
import { 
  Sun, 
  Kanban, 
  BarChart3, 
  Settings, 
  FolderKanban, 
  Sparkles,
  Layers,
  Heart,
  MessageSquare
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenAIChat, onOpenTeamChat, onOpenCreateTask }) {
  const { user } = useAuth();
  const { projects, filterProject, setFilterProject, tasks } = useTasks();

  const isManager = user?.role === 'manager';

  const todayStr = new Date().toISOString().split('T')[0];
  const myTasksCount = tasks.filter(t => (t.inMyDay || t.dueDate === todayStr) && t.status !== 'Done' && (t.assigneeId === user?.id || t.isPersonal)).length;
  const errorTasksCount = tasks.filter(t => t.hasError).length;

  return (
    <aside className="sidebar-container" style={{
      width: '240px',
      minWidth: '240px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.25rem 0.85rem',
      position: 'sticky',
      top: '64px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0 0.6rem 0.4rem'
          }}>
            Navigation
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            
            {/* 1. Main Role-Based Primary Dashboard */}
            {isManager ? (
              <button
                onClick={() => setActiveTab('manager')}
                className="sidebar-nav-item"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: activeTab === 'manager' ? '700' : '500',
                  color: activeTab === 'manager' ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: activeTab === 'manager' ? 'var(--primary-light)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
                  <span>Manager Dashboard</span>
                </div>
                {errorTasksCount > 0 && (
                  <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>
                    {errorTasksCount} Issue(s)
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('myday')}
                className="sidebar-nav-item"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: activeTab === 'myday' ? '700' : '500',
                  color: activeTab === 'myday' ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: activeTab === 'myday' ? 'var(--primary-light)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Sun size={18} style={{ color: activeTab === 'myday' ? 'var(--primary)' : 'var(--accent-amber)' }} />
                  <span>Employee Dashboard</span>
                </div>
                {myTasksCount > 0 && (
                  <span className="badge badge-status" style={{ fontSize: '0.7rem' }}>
                    {myTasksCount}
                  </span>
                )}
              </button>
            )}

            {/* 2. Personal Goals & Habits */}
            <button
              onClick={() => setActiveTab('personal-habits')}
              className="sidebar-nav-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: activeTab === 'personal-habits' ? '700' : '500',
                color: activeTab === 'personal-habits' ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: activeTab === 'personal-habits' ? 'var(--primary-light)' : 'transparent'
              }}
            >
              <Heart size={18} style={{ color: 'var(--primary)' }} />
              <span>Personal Habits & Goals</span>
            </button>

            {/* 3. Team Chat Drawer Trigger */}
            <button
              onClick={onOpenTeamChat}
              className="sidebar-nav-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: '500',
                color: 'var(--text-secondary)'
              }}
            >
              <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
              <span>Team Chat</span>
            </button>

            {/* 4. Project Board */}
            <button
              onClick={() => { setActiveTab('board'); setFilterProject('ALL'); }}
              className="sidebar-nav-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: activeTab === 'board' ? '700' : '500',
                color: activeTab === 'board' ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: activeTab === 'board' ? 'var(--primary-light)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Kanban size={18} />
                <span>Project Board</span>
              </div>
            </button>

            {/* 5. Overall Project Status */}
            <button
              onClick={() => setActiveTab('project-status')}
              className="sidebar-nav-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: activeTab === 'project-status' ? '700' : '500',
                color: activeTab === 'project-status' ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: activeTab === 'project-status' ? 'var(--primary-light)' : 'transparent'
              }}
            >
              <Layers size={18} />
              <span>Project Status</span>
            </button>

            {/* 6. Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className="sidebar-nav-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: activeTab === 'settings' ? '700' : '500',
                color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: activeTab === 'settings' ? 'var(--primary-light)' : 'transparent'
              }}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>

          </div>
        </div>

        {/* Projects List */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.6rem 0.4rem'
          }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Projects ({projects.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {projects.map((proj) => {
              const isSelected = activeTab === 'board' && filterProject === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    setFilterProject(proj.id);
                    setActiveTab('board');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: proj.color || 'var(--primary)',
                      flexShrink: 0
                    }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{proj.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {proj.stats?.total || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <div style={{
        backgroundColor: 'var(--bg-surface-hover)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '0.85rem' }}>
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          <span>AI Task Copilot</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
          Execute commands or query assigned tasks using plain natural text.
        </p>
        <button
          onClick={onOpenAIChat}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.78rem',
            padding: '0.4rem',
            marginTop: '0.2rem'
          }}
        >
          Open AI Assistant
        </button>
      </div>

    </aside>
  );
}
