import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { 
  Kanban, 
  Plus, 
  Filter, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ListTodo,
  FolderKanban,
  MessageSquare,
  Send,
  PlusCircle,
  X,
  Info
} from 'lucide-react';

export default function ProjectBoardPage({ onSelectTask, onOpenCreateTask, onOpenAIChat }) {
  const { 
    tasks, 
    projects, 
    filterProject, 
    setFilterProject,
    filterAssignee,
    setFilterAssignee,
    filterPriority,
    setFilterPriority,
    searchQuery,
    setSearchQuery,
    moveTaskStatus,
    chatMessages,
    fetchChatMessages,
    sendChatMessage
  } = useTasks();
  
  const { user, allUsers } = useAuth();
  const isManager = user?.role === 'manager';

  // Default to false so Kanban board occupies full width, opening chat ONLY when icon is clicked
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatInputText, setChatInputText] = useState('');

  const activeProjectId = filterProject !== 'ALL' ? filterProject : (projects[0]?.id || 'proj-1');

  useEffect(() => {
    if (activeProjectId && showChatPanel) {
      fetchChatMessages(activeProjectId);
    }
  }, [activeProjectId, showChatPanel, fetchChatMessages]);

  let filtered = tasks.filter(t => !t.isPersonal);

  if (filterProject !== 'ALL') {
    filtered = filtered.filter(t => t.projectId === filterProject);
  }

  if (filterAssignee !== 'ALL') {
    filtered = filtered.filter(t => t.assigneeId === filterAssignee);
  }

  if (filterPriority !== 'ALL') {
    filtered = filtered.filter(t => t.priority === filterPriority);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  }

  const toDoTasks = filtered.filter(t => t.status === 'To Do');
  const inProgressTasks = filtered.filter(t => t.status === 'In Progress');
  const doneTasks = filtered.filter(t => t.status === 'Done');

  const selectedProject = projects.find(p => p.id === filterProject);

  const handleDropColumn = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
    }
  };

  const handleDragOverColumn = (e) => {
    e.preventDefault();
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;
    await sendChatMessage(activeProjectId, chatInputText);
    setChatInputText('');
  };

  const handleTurnMessageIntoTask = (msgText) => {
    if (!isManager) return;
    onOpenCreateTask(activeProjectId, false, msgText);
  };

  return (
    <div style={{ padding: '1.75rem 2rem', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FolderKanban size={26} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0 }}>
              {selectedProject ? selectedProject.name : 'All Projects Board'}
            </h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {selectedProject ? selectedProject.description : 'Track deliverables and workflows across active projects'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Team Chat Toggle Icon Button */}
          <button 
            onClick={() => setShowChatPanel(!showChatPanel)} 
            className="btn-secondary" 
            style={{
              fontSize: '0.85rem',
              backgroundColor: showChatPanel ? 'var(--primary-light)' : 'var(--bg-surface-hover)',
              borderColor: showChatPanel ? 'var(--primary)' : 'var(--border-color)',
              color: showChatPanel ? 'var(--primary)' : 'var(--text-primary)'
            }}
            title={showChatPanel ? 'Close Team Chat' : 'Open Team Chat'}
          >
            <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
            <span>{showChatPanel ? 'Close Chat' : 'Team Chat'}</span>
          </button>

          <button onClick={onOpenAIChat} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span>AI Copilot</span>
          </button>
          
          {isManager && (
            <button onClick={() => onOpenCreateTask(filterProject !== 'ALL' ? filterProject : null)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Toolbar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>
          <Filter size={15} /> Filter By:
        </div>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          style={{ fontSize: '0.82rem', padding: '0.35rem 0.65rem' }}
        >
          <option value="ALL">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          style={{ fontSize: '0.82rem', padding: '0.35rem 0.65rem' }}
        >
          <option value="ALL">All Assignees</option>
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{ fontSize: '0.82rem', padding: '0.35rem 0.65rem' }}
        >
          <option value="ALL">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        {(filterProject !== 'ALL' || filterAssignee !== 'ALL' || filterPriority !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setFilterProject('ALL');
              setFilterAssignee('ALL');
              setFilterPriority('ALL');
              setSearchQuery('');
            }}
            style={{ fontSize: '0.78rem', color: 'var(--accent-red)', fontWeight: '600', marginLeft: 'auto' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Board Container */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: showChatPanel ? '1fr 320px' : '1fr',
        gap: '1.25rem',
        overflow: 'hidden',
        minHeight: 0
      }}>
        
        {/* KANBAN BOARD GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          overflow: 'hidden'
        }}>
          
          {/* Column 1: TO DO */}
          <div
            onDragOver={handleDragOverColumn}
            onDrop={(e) => handleDropColumn(e, 'To Do')}
            style={{
              backgroundColor: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.92rem' }}>
                <ListTodo size={18} style={{ color: 'var(--text-secondary)' }} />
                <span>To Do</span>
              </div>
              <span className="badge badge-status">{toDoTasks.length}</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.2rem' }}>
              {toDoTasks.map((t) => (
                <TaskCard key={t.id} task={t} onSelectTask={onSelectTask} />
              ))}
            </div>

            {isManager && (
              <button
                onClick={() => onOpenCreateTask(filterProject !== 'ALL' ? filterProject : null)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <Plus size={15} /> Add Task
              </button>
            )}
          </div>

          {/* Column 2: IN PROGRESS */}
          <div
            onDragOver={handleDragOverColumn}
            onDrop={(e) => handleDropColumn(e, 'In Progress')}
            style={{
              backgroundColor: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.92rem' }}>
                <Clock size={18} style={{ color: 'var(--accent-amber)' }} />
                <span>In Progress</span>
              </div>
              <span className="badge badge-medium">{inProgressTasks.length}</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.2rem' }}>
              {inProgressTasks.map((t) => (
                <TaskCard key={t.id} task={t} onSelectTask={onSelectTask} />
              ))}
            </div>

            {isManager && (
              <button
                onClick={() => onOpenCreateTask(filterProject !== 'ALL' ? filterProject : null)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <Plus size={15} /> Add Task
              </button>
            )}
          </div>

          {/* Column 3: DONE */}
          <div
            onDragOver={handleDragOverColumn}
            onDrop={(e) => handleDropColumn(e, 'Done')}
            style={{
              backgroundColor: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.92rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent-green)' }} />
                <span>Done</span>
              </div>
              <span className="badge badge-low">{doneTasks.length}</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.2rem' }}>
              {doneTasks.map((t) => (
                <TaskCard key={t.id} task={t} onSelectTask={onSelectTask} />
              ))}
            </div>
          </div>

        </div>

        {/* TEAM CHAT SIDEBAR PANEL — OPENS ONLY WHEN ICON IS CLICKED */}
        {showChatPanel && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '0.85rem 1rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface-hover)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                <span>Team Chat</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="badge badge-status" style={{ fontSize: '0.7rem' }}>
                  {selectedProject ? selectedProject.name : 'Project Chat'}
                </span>
                <button onClick={() => setShowChatPanel(false)} style={{ color: 'var(--text-muted)', padding: '0.1rem' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Stream */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No messages yet. Send a message to start team discussion.
                </div>
              ) : (
                chatMessages.map((msg) => {
                  if (msg.isSystemMessage) {
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: 'center',
                          backgroundColor: 'var(--primary-light)',
                          border: '1px solid var(--primary)',
                          borderRadius: '99px',
                          padding: '0.3rem 0.75rem',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          color: 'var(--primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <CheckCircle2 size={12} /> {msg.text}
                      </div>
                    );
                  }

                  const isMe = msg.userId === user?.id;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '88%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{msg.userName}</span>
                        <span>• {msg.timestamp}</span>
                      </div>

                      <div style={{
                        backgroundColor: isMe ? 'var(--primary)' : 'var(--bg-surface-hover)',
                        color: isMe ? '#ffffff' : 'var(--text-primary)',
                        border: isMe ? 'none' : '1px solid var(--border-color)',
                        borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.82rem',
                        lineHeight: 1.35
                      }}>
                        {msg.text}
                      </div>

                      {/* Manager Only "Turn into Task" Button */}
                      {isManager && (
                        <button
                          onClick={() => handleTurnMessageIntoTask(msg.text)}
                          style={{
                            marginTop: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: 'var(--primary)',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.15rem 0.4rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          title="Manager Action: Turn message into task"
                        >
                          <PlusCircle size={11} /> Turn into Task
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendChat}
              style={{
                padding: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '0.5rem',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <input
                type="text"
                placeholder="Type team message..."
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                style={{ flex: 1, fontSize: '0.82rem', height: '36px', padding: '0 0.65rem' }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0 0.75rem', height: '36px' }}
                title="Send Message"
              >
                <Send size={14} />
              </button>
            </form>

          </div>
        )}

      </div>

    </div>
  );
}
