import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/api.js';
import { 
  X, 
  Trash2, 
  Plus, 
  CheckSquare, 
  MessageSquare, 
  User, 
  Calendar, 
  Sun,
  Flag,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Send
} from 'lucide-react';

export default function TaskDetailModal({ task, onClose }) {
  const { updateTask, deleteTask, addSubtask, toggleSubtask, addComment, reportTaskError, resolveTaskError, toggleMyDay, toggleImportant } = useTasks();
  const { user, allUsers, canEditTask } = useAuth();

  const isEditable = canEditTask(task);
  const isManager = user?.role === 'manager';

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'To Do');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '');
  const [projectId, setProjectId] = useState(task?.projectId || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [recurring, setRecurring] = useState(task?.recurring || 'none');

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Error reporting form state
  const [showReportError, setShowReportError] = useState(false);
  const [errorInputText, setErrorInputText] = useState('');
  const [errorSeverityInput, setErrorSeverityInput] = useState('Medium');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId || '');
      setProjectId(task.projectId || '');
      setDueDate(task.dueDate || '');
      setRecurring(task.recurring || 'none');
    }
  }, [task]);

  if (!task) return null;

  const handleSaveBasic = () => {
    if (!isEditable) return;
    updateTask(task.id, {
      title,
      description,
      status,
      priority,
      assigneeId,
      projectId,
      dueDate,
      recurring
    });
  };

  const handleAddSubtaskSubmit = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !isEditable) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddCommentSubmit = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(task.id, {
      text: newCommentText.trim(),
      authorId: user?.id,
      authorName: user?.name || 'Anonymous',
      authorAvatar: user?.avatar
    });
    setNewCommentText('');
  };

  const handleReportErrorSubmit = async (e) => {
    e.preventDefault();
    if (!errorInputText.trim()) return;
    await reportTaskError(task.id, errorInputText.trim(), errorSeverityInput);
    setShowReportError(false);
    setErrorInputText('');
  };

  const handleResolveErrorClick = async () => {
    await resolveTaskError(task.id);
  };

  const handleDelete = () => {
    if (!isEditable) return;
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        
        {/* Read Only Notice if assigned to someone else */}
        {!isEditable && (
          <div style={{
            backgroundColor: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.6rem 0.85rem',
            marginBottom: '1rem',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-muted)'
          }}>
            <Lock size={16} />
            <span>This task is assigned to <strong>{task.assigneeName}</strong>. You are viewing in Read-Only mode.</span>
          </div>
        )}

        {/* Task Error Reported Alert Box */}
        {task.hasError && (
          <div style={{
            backgroundColor: 'var(--accent-red-bg)',
            border: '1px solid var(--accent-red)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} /> Technical Issue / Blocker Reported ({task.errorSeverity || 'Medium'})
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.25rem', margin: 0 }}>
                {task.errorDetails}
              </p>
            </div>

            {isManager && (
              <button
                onClick={handleResolveErrorClick}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
              >
                <CheckCircle2 size={14} /> Resolve Issue
              </button>
            )}
          </div>
        )}

        {/* Top Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => toggleMyDay(task.id)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: task.inMyDay ? 'var(--accent-amber)' : 'var(--text-secondary)'
              }}
            >
              <Sun size={15} fill={task.inMyDay ? 'currentColor' : 'none'} />
              {task.inMyDay ? 'In My Day' : 'Add to My Day'}
            </button>

            <button
              onClick={() => toggleImportant(task.id)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: task.isImportant ? 'var(--accent-amber)' : 'var(--text-secondary)'
              }}
            >
              <Flag size={15} fill={task.isImportant ? 'currentColor' : 'none'} />
              {task.isImportant ? 'Flagged' : 'Flag'}
            </button>

            {!task.hasError && (
              <button
                onClick={() => setShowReportError(!showReportError)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-red)'
                }}
              >
                <AlertTriangle size={15} /> Report Issue
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isEditable && (
              <button
                onClick={handleDelete}
                style={{ color: 'var(--accent-red)', padding: '0.4rem' }}
                title="Delete Task"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.4rem' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Report Error Input Form */}
        {showReportError && (
          <form onSubmit={handleReportErrorSubmit} style={{
            backgroundColor: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Report Task Bug or Blocker</div>
            <textarea
              rows={2}
              placeholder="Describe the error, failure log, or blocker..."
              value={errorInputText}
              onChange={(e) => setErrorInputText(e.target.value)}
              required
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>Severity:</span>
                <select
                  value={errorSeverityInput}
                  onChange={(e) => setErrorSeverityInput(e.target.value)}
                  style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowReportError(false)} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', backgroundColor: 'var(--accent-red)' }}>
                  Submit Issue
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Task Title */}
        <input
          type="text"
          value={title}
          disabled={!isEditable}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSaveBasic}
          style={{
            fontSize: '1.35rem',
            fontWeight: '700',
            width: '100%',
            border: '1px transparent solid',
            padding: '0.4rem',
            marginBottom: '0.75rem',
            borderRadius: 'var(--radius-sm)'
          }}
          placeholder="Task title..."
        />

        {/* Attributes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.85rem',
          backgroundColor: 'var(--bg-surface-hover)',
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem'
        }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              STATUS
            </label>
            <select
              value={status}
              disabled={!isEditable}
              onChange={(e) => { setStatus(e.target.value); updateTask(task.id, { status: e.target.value }); }}
              style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem' }}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              PRIORITY
            </label>
            <select
              value={priority}
              disabled={!isEditable}
              onChange={(e) => { setPriority(e.target.value); updateTask(task.id, { priority: e.target.value }); }}
              style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem' }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              ASSIGNEE
            </label>
            <select
              value={assigneeId}
              disabled={!isManager}
              onChange={(e) => { setAssigneeId(e.target.value); updateTask(task.id, { assigneeId: e.target.value }); }}
              style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem' }}
            >
              <option value="">Unassigned</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              DUE DATE
            </label>
            <input
              type="date"
              value={dueDate}
              disabled={!isEditable}
              onChange={(e) => { setDueDate(e.target.value); updateTask(task.id, { dueDate: e.target.value }); }}
              style={{ width: '100%', fontSize: '0.82rem', padding: '0.35rem' }}
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            disabled={!isEditable}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSaveBasic}
            placeholder="Add detailed task instructions..."
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        {/* Subtasks Checklist */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
              <CheckSquare size={16} /> Subtasks Checklist
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {task.subtasks?.filter(s => s.completed).length || 0} / {task.subtasks?.length || 0}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
            {task.subtasks && task.subtasks.map((st) => (
              <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.3rem 0' }}>
                <input
                  type="checkbox"
                  checked={st.completed}
                  disabled={!isEditable}
                  onChange={(e) => toggleSubtask(task.id, st.id, e.target.checked)}
                  style={{ cursor: isEditable ? 'pointer' : 'not-allowed', width: '16px', height: '16px' }}
                />
                <span style={{
                  fontSize: '0.88rem',
                  textDecoration: st.completed ? 'line-through' : 'none',
                  color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                }}>
                  {st.title}
                </span>
              </div>
            ))}
          </div>

          {isEditable && (
            <form onSubmit={handleAddSubtaskSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Add checklist item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                style={{ flex: 1, height: '34px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn-secondary" style={{ height: '34px', padding: '0 0.85rem' }}>
                <Plus size={16} /> Add
              </button>
            </form>
          )}
        </div>

        {/* Comments Section */}
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', color: 'var(--text-secondary)' }}>
            <MessageSquare size={16} /> Comments & Activity ({task.comments?.length || 0})
          </label>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxHeight: '180px',
            overflowY: 'auto',
            marginBottom: '0.85rem',
            paddingRight: '0.4rem'
          }}>
            {task.comments && task.comments.map((cmt) => (
              <div key={cmt.id} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.82rem' }}>
                <img
                  src={cmt.authorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'}
                  alt={cmt.authorName}
                  style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                />
                <div style={{
                  backgroundColor: 'var(--bg-surface-hover)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  flex: 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.8rem' }}>{cmt.authorName}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cmt.timestamp}</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', margin: 0 }}>{cmt.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddCommentSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              style={{ flex: 1, height: '36px', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn-primary" style={{ height: '36px', padding: '0 0.85rem' }}>
              <Send size={15} /> Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
