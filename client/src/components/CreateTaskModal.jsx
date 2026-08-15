import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { X, Plus, Calendar, Tag, User, Layers, FolderPlus, Check } from 'lucide-react';

export function parseChatToTask(rawChatText) {
  if (!rawChatText) return { title: '', description: '' };

  const text = rawChatText.trim();
  const lower = text.toLowerCase();

  // 1. Precise Title Extraction Logic
  let title = text;

  // Strip conversational chat greetings and filler phrases
  title = title
    .replace(/^(hey|hi|hello)\s+(team|everyone|guys|all)[,\s!]*/i, '')
    .replace(/^(let\s+us|lets|please|can\s+someone|can\s+we|make\s+sure|make\s+sure\s+that|we\s+need\s+to|need\s+to|i\s+am|iam|working\s+on\s+the|working\s+on)\s+/i, '')
    .replace(/\s+(right\s+now|asap|by\s+(friday|monday|tuesday|wednesday|thursday|saturday|sunday|today|tomorrow))[.!?]*$/i, '')
    .replace(/[.!?]+$/, '')
    .trim();

  // Capitalize title
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // If title still starts with conversational words, refine further
  if (/^(is\s+ready|ready|done|complete)/i.test(title)) {
    title = title.replace(/^(is\s+ready|ready|done|complete)\s*/i, '');
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Ensure title is concise (max 65 chars)
  if (title.length > 65) {
    const spaceIdx = title.lastIndexOf(' ', 60);
    title = spaceIdx > 20 ? title.substring(0, spaceIdx) : title.substring(0, 60);
  }

  // Format into Title Case for a professional deliverable title
  title = title
    .split(' ')
    .map(w => {
      if (['a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'by', 'of', 'with', 'is'].includes(w.toLowerCase())) {
        return w.toLowerCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');

  title = title.charAt(0).toUpperCase() + title.slice(1);

  // 2. Precise Description Extraction
  let actionVerb = 'Execute deliverable';
  if (lower.includes('fix') || lower.includes('bug')) actionVerb = 'Resolve bug and fix issue';
  else if (lower.includes('redesign') || lower.includes('design') || lower.includes('hero')) actionVerb = 'Design and implement updated component';
  else if (lower.includes('update') || lower.includes('slides')) actionVerb = 'Revise and update deliverable assets';
  else if (lower.includes('build') || lower.includes('create')) actionVerb = 'Build and deploy new functionality';

  const description = `Objective: ${title}\n\nTask Details:\n• ${actionVerb} based on team discussion.\n• Review implementation and verify quality standards prior to completion.`;

  return { title, description };
}

export default function CreateTaskModal({ onClose, defaultProjectId, defaultInMyDay, initialTitle = '', initialDescription = '' }) {
  const { createTask, createProject, projects } = useTasks();
  const { allUsers, user: currentUser } = useAuth();

  const isManager = currentUser?.role === 'manager';

  const parsed = parseChatToTask(initialTitle || initialDescription);

  const [title, setTitle] = useState(parsed.title || initialTitle || '');
  const [description, setDescription] = useState(parsed.description || initialDescription || '');
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id || ''));
  const [assigneeId, setAssigneeId] = useState(isManager ? (allUsers[1]?.id || '') : (currentUser?.id || ''));
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [inMyDay, setInMyDay] = useState(Boolean(defaultInMyDay));
  const [isImportant, setIsImportant] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);

  // New Project Form Inline Toggle & State
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjColor, setNewProjColor] = useState('#10b981');
  const [creatingProj, setCreatingProj] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTitle || initialDescription) {
      const res = parseChatToTask(initialTitle || initialDescription);
      setTitle(res.title);
      setDescription(res.description);
    }
  }, [initialTitle, initialDescription]);

  const handleSelectProjectChange = (e) => {
    const val = e.target.value;
    if (val === 'CREATE_NEW') {
      setShowNewProjectForm(true);
    } else {
      setProjectId(val);
      setShowNewProjectForm(false);
    }
  };

  const handleCreateNewProject = async (e) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    setCreatingProj(true);
    try {
      const created = await createProject({
        name: newProjName.trim(),
        description: newProjDesc.trim(),
        color: newProjColor
      });
      setProjectId(created.id);
      setShowNewProjectForm(false);
      setNewProjName('');
      setNewProjDesc('');
    } catch (err) {
      console.error('Error creating new project:', err);
    } finally {
      setCreatingProj(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedUser = allUsers.find(u => u.id === assigneeId) || currentUser;
      const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);

      await createTask({
        title: title.trim(),
        description: description.trim(),
        projectId: isPersonal ? null : projectId,
        assigneeId: selectedUser.id,
        assigneeName: selectedUser.name,
        priority,
        status,
        dueDate,
        tags,
        inMyDay,
        isImportant,
        isPersonal
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Plus size={20} style={{ color: 'var(--primary)' }} /> Create & Assign Task
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.2rem' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--accent-red-bg)', color: 'var(--accent-red)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Implement user login OAuth flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
              Description
            </label>
            <textarea
              placeholder="Add relevant notes, acceptance criteria, or requirements..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Project Selection & Add New Project Feature */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Working Project
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <FolderPlus size={13} /> {showNewProjectForm ? 'Select Existing' : '+ New Project'}
                </button>
              </div>

              <select
                value={showNewProjectForm ? 'CREATE_NEW' : projectId}
                onChange={handleSelectProjectChange}
                style={{ width: '100%' }}
                disabled={isPersonal}
              >
                <optgroup label="Active Working Projects">
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Actions">
                  <option value="CREATE_NEW">+ Create New Project...</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                Assignee
              </label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={{ width: '100%' }}>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Inline New Project Form Panel */}
          {showNewProjectForm && (
            <div style={{
              backgroundColor: 'var(--bg-surface-hover)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FolderPlus size={16} /> Create New Project Workspace
              </div>

              <input
                type="text"
                placeholder="Project Name (e.g. Customer Portal v3.0)..."
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />

              <input
                type="text"
                placeholder="Short Description / Roadmap Notes..."
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                style={{ width: '100%', fontSize: '0.82rem' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Color:</span>
                  {['#10b981', '#059669', '#d97706', '#8b5cf6', '#3b82f6'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewProjColor(c)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: newProjColor === c ? '2px solid #ffffff' : 'none'
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCreateNewProject}
                  disabled={creatingProj || !newProjName.trim()}
                  className="btn-primary"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  <Check size={14} /> {creatingProj ? 'Creating...' : 'Create & Select'}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                Priority
              </label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%' }}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                Status
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%' }}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Chat-Derived, Bug, Frontend"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', paddingTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ marginRight: 'auto' }}>
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Task...' : 'Create Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
