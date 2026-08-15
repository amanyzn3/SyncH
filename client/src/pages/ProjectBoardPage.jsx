import React, { useState, useEffect, useRef } from 'react';
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
  Info,
  Paperclip,
  Reply,
  FileText,
  Download,
  Image as ImageIcon,
  CornerDownRight
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
  const [chatReplyingTo, setChatReplyingTo] = useState(null);
  const [chatAttachment, setChatAttachment] = useState(null);
  const inlineFileInputRef = useRef(null);

  const activeProjectId = filterProject !== 'ALL' ? filterProject : (projects[0]?.id || 'proj-1');

  useEffect(() => {
    if (activeProjectId && showChatPanel) {
      fetchChatMessages(activeProjectId);
    }
  }, [activeProjectId, showChatPanel, fetchChatMessages]);

  const assignedProjectIds = projects.map(p => p.id);
  let filtered = tasks.filter(t => !t.isPersonal && (isManager || assignedProjectIds.includes(t.projectId)));

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

  const handleInlineFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setChatAttachment({
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024) + ' KB',
        url: event.target.result,
        isImage: file.type.startsWith('image/')
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInputText.trim() && !chatAttachment) return;
    await sendChatMessage(activeProjectId, chatInputText, chatReplyingTo, chatAttachment);
    setChatInputText('');
    setChatReplyingTo(null);
    setChatAttachment(null);
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

      {/* Filter Controls Toolbar - Rendered for Managers ONLY */}
      {isManager && (
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
      )}

      {/* Employee Project Switcher Bar (rendered for employees with assigned projects) */}
      {!isManager && projects.length > 0 && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>
            <FolderKanban size={15} style={{ color: 'var(--primary)' }} /> Select Assigned Project:
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {projects.map((p) => {
              const isSelected = filterProject === p.id || (filterProject === 'ALL' && projects[0]?.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => setFilterProject(p.id)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? '700' : '500',
                    backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-surface-hover)',
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#ffffff' : (p.color || 'var(--primary)')
                  }} />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <MessageSquare size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedProject ? selectedProject.name : 'Project Chat'}
                </span>
              </div>
              <button onClick={() => setShowChatPanel(false)} style={{ color: 'var(--text-muted)', padding: '0.1rem' }}>
                <X size={16} />
              </button>
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
                        {/* Quoted Reply Header */}
                        {msg.replyTo && (
                          <div style={{
                            backgroundColor: isMe ? 'rgba(255, 255, 255, 0.15)' : 'var(--bg-surface)',
                            borderLeft: '3px solid var(--primary)',
                            padding: '0.3rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: '0.4rem',
                            fontSize: '0.72rem'
                          }}>
                            <div style={{ fontWeight: '700', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <CornerDownRight size={11} /> Replying to {msg.replyTo.userName}
                            </div>
                            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px', opacity: 0.85 }}>
                              {msg.replyTo.text || (msg.replyTo.hasAttachment ? '[Attachment]' : '')}
                            </div>
                          </div>
                        )}

                        {msg.text && <div>{msg.text}</div>}

                        {/* Attachment Render */}
                        {msg.attachment && (
                          <div style={{ marginTop: msg.text ? '0.4rem' : 0 }}>
                            {msg.attachment.isImage ? (
                              <img
                                src={msg.attachment.url}
                                alt={msg.attachment.name}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '160px',
                                  borderRadius: 'var(--radius-md)',
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                              />
                            ) : (
                              <a
                                href={msg.attachment.url}
                                download={msg.attachment.name}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  padding: '0.4rem 0.6rem',
                                  backgroundColor: isMe ? 'rgba(255, 255, 255, 0.18)' : 'var(--bg-surface)',
                                  borderRadius: 'var(--radius-md)',
                                  color: isMe ? '#ffffff' : 'var(--primary)',
                                  textDecoration: 'none',
                                  fontSize: '0.78rem',
                                  fontWeight: '600'
                                }}
                              >
                                <FileText size={16} />
                                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {msg.attachment.name}
                                </div>
                                <Download size={13} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <button
                          onClick={() => setChatReplyingTo({ id: msg.id, userName: msg.userName, text: msg.text, hasAttachment: Boolean(msg.attachment) })}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                          title="Reply to message"
                        >
                          <Reply size={11} /> Reply
                        </button>

                        {isManager && msg.text && (
                          <button
                            onClick={() => handleTurnMessageIntoTask(msg.text)}
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: '700',
                              color: 'var(--primary)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                            title="Manager Action: Turn message into task"
                          >
                            <PlusCircle size={11} /> Turn into Task
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply & Attachment Context Bar */}
            {(chatReplyingTo || chatAttachment) && (
              <div style={{
                padding: '0.4rem 0.75rem',
                backgroundColor: 'var(--bg-surface-hover)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                {chatReplyingTo && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Reply size={13} />
                      <span>Replying to <strong>{chatReplyingTo.userName}</strong>: "{chatReplyingTo.text || 'Attachment'}"</span>
                    </div>
                    <button onClick={() => setChatReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={13} />
                    </button>
                  </div>
                )}

                {chatAttachment && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chatAttachment.isImage ? <ImageIcon size={13} /> : <FileText size={13} />}
                      <span>Attached: <strong>{chatAttachment.name}</strong></span>
                    </div>
                    <button onClick={() => setChatAttachment(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSendChat}
              style={{
                padding: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <input
                type="file"
                ref={inlineFileInputRef}
                onChange={handleInlineFileSelect}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => inlineFileInputRef.current?.click()}
                style={{
                  padding: '0.4rem',
                  color: chatAttachment ? 'var(--accent-green)' : 'var(--text-muted)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '36px',
                  width: '36px'
                }}
                title="Attach photo or document"
              >
                <Paperclip size={16} />
              </button>

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
