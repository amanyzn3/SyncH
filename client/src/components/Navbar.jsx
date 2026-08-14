import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';
import { 
  Sun, 
  Moon, 
  Plus, 
  Search, 
  Bell, 
  Sparkles,
  LogOut, 
  HelpCircle,
  Layers,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

export default function Navbar({ onOpenCreateTask, onOpenAIChat, onOpenTeamChat, onOpenTour }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery, tasks } = useTasks();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isManager = user?.role === 'manager';

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(t => t.dueDate < todayStr && t.status !== 'Done').length;
  const errorCount = tasks.filter(t => t.hasError).length;

  // Employee notifications for assigned deliverables
  const assignedToMe = tasks.filter(t => t.assigneeId === user?.id && !t.isPersonal);

  return (
    <header className="navbar-container" style={{
      height: '64px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Left: Brand Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Layers size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, lineHeight: 1, color: 'var(--text-primary)' }}>Synhub</h1>
            <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: '700', letterSpacing: '0.05em' }}>
              ENTERPRISE PLATFORM
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', marginLeft: '1.5rem', width: '280px' }} className="nav-search-box">
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search tasks, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '36px',
              paddingRight: '12px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* System Overview Guide */}
        <button
          onClick={onOpenTour}
          title="System Overview Guide"
          style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <HelpCircle size={19} />
        </button>

        {/* Team Chat Button in Navigation Bar */}
        <button
          onClick={onOpenTeamChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}
        >
          <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
          <span>Team Chat</span>
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAIChat}
          className="nav-ai-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--border-color)',
            color: 'var(--primary)',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}
        >
          <Sparkles size={16} />
          <span>AI Assistant</span>
        </button>

        {/* New Task Button — Manager Only */}
        {isManager && (
          <button
            onClick={onOpenCreateTask}
            className="btn-primary nav-create-task-btn"
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem'
            }}
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        )}

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-surface-hover)',
            color: 'var(--text-secondary)'
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-surface-hover)',
              color: 'var(--text-secondary)',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {(overdueCount > 0 || errorCount > 0 || assignedToMe.length > 0) && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: errorCount > 0 ? 'var(--accent-red)' : 'var(--primary)',
                color: '#fff',
                borderRadius: '99px',
                fontSize: '0.65rem',
                fontWeight: '700',
                padding: '0.1rem 0.35rem',
                lineHeight: 1
              }}>
                {assignedToMe.length + errorCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '320px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '1rem',
              zIndex: 100
            }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                <Bell size={16} style={{ color: 'var(--primary)' }} /> Task Notifications
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                {!isManager && assignedToMe.map(t => (
                  <div key={t.id} style={{ fontSize: '0.8rem', color: 'var(--text-primary)', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    <UserCheck size={14} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary)' }} />
                    <strong>Assigned Workload:</strong> Manager Alex Vance assigned "{t.title}" to you ({t.priority} Priority).
                  </div>
                ))}

                {errorCount > 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', backgroundColor: 'var(--accent-red-bg)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    <ShieldAlert size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {errorCount} task(s) reported with technical issues.
                  </div>
                )}
                {overdueCount > 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', backgroundColor: 'var(--accent-amber-bg)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    {overdueCount} task(s) are overdue past target date.
                  </div>
                )}
                {errorCount === 0 && overdueCount === 0 && assignedToMe.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    No active notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
              alt={user?.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '2px solid var(--primary)'
              }}
            />
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '220px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '0.75rem',
              zIndex: 100
            }}>
              <div style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                <span className="badge badge-status" style={{ marginTop: '0.4rem', textTransform: 'capitalize' }}>
                  Role: {user?.role}
                </span>
              </div>
              <button
                onClick={() => { setShowProfileMenu(false); logout(); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--accent-red)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  padding: '0.4rem'
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
