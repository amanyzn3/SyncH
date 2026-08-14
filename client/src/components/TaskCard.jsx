import React from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/api.js';
import { 
  Sun, 
  Star, 
  CheckSquare, 
  MessageSquare, 
  CheckCircle2, 
  Circle,
  Repeat,
  Lock,
  AlertTriangle
} from 'lucide-react';

export default function TaskCard({ task, onSelectTask, isListView = false }) {
  const { toggleMyDay, toggleImportant, moveTaskStatus, projects } = useTasks();
  const { canEditTask } = useAuth();

  const isEditable = canEditTask(task);
  const project = projects.find(p => p.id === task.projectId);
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'Done';
  const isDueToday = task.dueDate === todayStr;

  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const commentCount = task.comments ? task.comments.length : 0;

  const handleDragStart = (e) => {
    if (!isEditable) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', task.id);
  };

  const getPriorityBadgeClass = (p) => {
    if (p === 'High') return 'badge-high';
    if (p === 'Medium') return 'badge-medium';
    return 'badge-low';
  };

  if (isListView) {
    return (
      <div
        className="task-card-list-item"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid ${task.hasError ? 'var(--accent-red)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
          opacity: task.status === 'Done' ? 0.65 : 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isEditable) {
                moveTaskStatus(task.id, task.status === 'Done' ? 'To Do' : 'Done');
              }
            }}
            disabled={!isEditable}
            style={{
              color: task.status === 'Done' ? 'var(--accent-green)' : 'var(--text-muted)',
              cursor: isEditable ? 'pointer' : 'not-allowed'
            }}
          >
            {task.status === 'Done' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
          </button>

          <div 
            onClick={() => onSelectTask(task)}
            style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
          >
            <div style={{
              fontWeight: '600',
              fontSize: '0.92rem',
              textDecoration: task.status === 'Done' ? 'line-through' : 'none',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <span>{task.title}</span>
              {!isEditable && (
                <span title={`Assigned to ${task.assigneeName} (Read Only)`} style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>
                  <Lock size={14} />
                </span>
              )}
              {task.hasError && (
                <span className="badge badge-high" style={{ fontSize: '0.68rem' }}>
                  <AlertTriangle size={12} /> Issue Reported
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {project && (
                <span style={{ color: project.color, fontWeight: '600' }}>
                  {project.name}
                </span>
              )}
              {task.recurring && task.recurring !== 'none' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)' }}>
                  <Repeat size={12} /> {task.recurring}
                </span>
              )}
              {task.dueDate && (
                <span style={{
                  color: isOverdue ? 'var(--accent-red)' : isDueToday ? 'var(--accent-amber)' : 'var(--text-muted)',
                  fontWeight: isOverdue || isDueToday ? '700' : '400'
                }}>
                  Due: {formatDate(task.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
            {task.priority}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); toggleMyDay(task.id); }}
            style={{
              padding: '0.3rem',
              borderRadius: '50%',
              color: task.inMyDay ? 'var(--accent-amber)' : 'var(--text-muted)'
            }}
            title={task.inMyDay ? 'In My Day Focus' : 'Add to My Day'}
          >
            <Sun size={18} fill={task.inMyDay ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); toggleImportant(task.id); }}
            style={{
              padding: '0.3rem',
              borderRadius: '50%',
              color: task.isImportant ? 'var(--accent-amber)' : 'var(--text-muted)'
            }}
            title={task.isImportant ? 'Flagged Important' : 'Mark Important'}
          >
            <Star size={18} fill={task.isImportant ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    );
  }

  // Kanban Card View
  return (
    <div
      draggable={isEditable}
      onDragStart={handleDragStart}
      onClick={() => onSelectTask(task)}
      className="task-kanban-card"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${task.hasError ? 'var(--accent-red)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '0.9rem',
        boxShadow: 'var(--shadow-sm)',
        cursor: isEditable ? 'grab' : 'pointer',
        opacity: !isEditable ? 0.9 : 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {project ? (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: project.color || 'var(--primary)',
            backgroundColor: `${project.color || '#6366f1'}15`,
            padding: '0.15rem 0.5rem',
            borderRadius: '4px'
          }}>
            {project.name}
          </span>
        ) : (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Personal Task</span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {!isEditable && (
            <span title={`Assigned to ${task.assigneeName} (Read Only)`} style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>
              <Lock size={14} />
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggleMyDay(task.id); }}
            style={{ color: task.inMyDay ? 'var(--accent-amber)' : 'var(--text-muted)', padding: '2px' }}
            title="My Day Focus Toggle"
          >
            <Sun size={15} fill={task.inMyDay ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); toggleImportant(task.id); }}
            style={{ color: task.isImportant ? 'var(--accent-amber)' : 'var(--text-muted)', padding: '2px' }}
            title="Important Flag Toggle"
          >
            <Star size={15} fill={task.isImportant ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div style={{
        fontWeight: '600',
        fontSize: '0.92rem',
        color: 'var(--text-primary)',
        lineHeight: 1.35
      }}>
        {task.title}
      </div>

      {task.hasError && (
        <div style={{
          backgroundColor: 'var(--accent-red-bg)',
          color: 'var(--accent-red)',
          fontSize: '0.75rem',
          padding: '0.35rem 0.5rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontWeight: '600'
        }}>
          <AlertTriangle size={13} /> Issue: {task.errorDetails || 'Technical error reported'}
        </div>
      )}

      {task.description && (
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {task.description}
        </p>
      )}

      {task.tags && task.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {task.tags.map((tag, idx) => (
            <span key={idx} style={{
              fontSize: '0.68rem',
              backgroundColor: 'var(--bg-surface-hover)',
              color: 'var(--text-secondary)',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px'
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.4rem',
        borderTop: '1px solid var(--border-color)',
        marginTop: '0.2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span className={`badge ${getPriorityBadgeClass(task.priority)}`} style={{ fontSize: '0.68rem' }}>
            {task.priority}
          </span>

          {totalSubtasks > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }} title="Subtasks">
              <CheckSquare size={13} />
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}

          {commentCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }} title="Comments">
              <MessageSquare size={13} />
              {commentCount}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {task.dueDate && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: isOverdue || isDueToday ? '700' : '500',
              color: isOverdue ? 'var(--accent-red)' : isDueToday ? 'var(--accent-amber)' : 'var(--text-muted)'
            }} title={`Due: ${task.dueDate}`}>
              {formatDate(task.dueDate)}
            </span>
          )}

          <div
            title={`Assigned to: ${task.assigneeName || 'Unassigned'}`}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.68rem',
              fontWeight: '700'
            }}
          >
            {(task.assigneeName || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
