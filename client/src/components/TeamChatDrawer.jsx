import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  X, 
  MessageSquare, 
  Send, 
  PlusCircle, 
  FolderKanban, 
  CheckCircle2, 
  Paperclip, 
  Reply, 
  FileText, 
  Download, 
  Image as ImageIcon,
  CornerDownRight
} from 'lucide-react';

export default function TeamChatDrawer({ isOpen, onClose, onOpenCreateTask }) {
  const { projects, chatMessages, fetchChatMessages, sendChatMessage } = useTasks();
  const { user } = useAuth();

  const isManager = user?.role === 'manager';

  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'proj-1');
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachment, setAttachment] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (projects.length > 0 && !projects.some(p => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (isOpen && selectedProjectId) {
      fetchChatMessages(selectedProjectId);
    }
  }, [isOpen, selectedProjectId, fetchChatMessages]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    await sendChatMessage(selectedProjectId, inputText, replyingTo, attachment);

    setInputText('');
    setReplyingTo(null);
    setAttachment(null);
  };

  const handleTurnIntoTask = (msgText) => {
    if (!isManager) return;
    onClose();
    setTimeout(() => {
      onOpenCreateTask(selectedProjectId, false, msgText);
    }, 50);
  };

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 15, 23, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1500,
      display: 'flex',
      justifyContent: 'flex-end'
    }} onClick={onClose}>
      
      <div style={{
        width: '420px',
        maxWidth: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface-hover)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <MessageSquare size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentProject ? currentProject.name : 'Team Chat'}
            </span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.2rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Project Selector Bar */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FolderKanban size={16} style={{ color: 'var(--primary)' }} />
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setReplyingTo(null);
              setAttachment(null);
            }}
            style={{ flex: 1, fontSize: '0.85rem', padding: '0.35rem 0.65rem' }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Message Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          {chatMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No chat messages in this project yet.
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
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      margin: '0.25rem 0'
                    }}
                  >
                    <CheckCircle2 size={13} /> {msg.text}
                  </div>
                );
              }

              const isMe = msg.userId === user?.id;

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{msg.userName}</span>
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div style={{
                    backgroundColor: isMe ? 'var(--primary)' : 'var(--bg-surface-hover)',
                    color: isMe ? '#ffffff' : 'var(--text-primary)',
                    border: isMe ? 'none' : '1px solid var(--border-color)',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '0.75rem 0.95rem',
                    fontSize: '0.88rem',
                    lineHeight: 1.4,
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                  }}>

                    {/* Quoted Reply Header */}
                    {msg.replyTo && (
                      <div style={{
                        backgroundColor: isMe ? 'rgba(255, 255, 255, 0.15)' : 'var(--bg-surface)',
                        borderLeft: '3px solid var(--primary)',
                        padding: '0.35rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '0.45rem',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ fontWeight: '700', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CornerDownRight size={12} /> Replying to {msg.replyTo.userName}
                        </div>
                        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '220px', opacity: 0.85 }}>
                          {msg.replyTo.text || (msg.replyTo.hasAttachment ? '[Attachment]' : '')}
                        </div>
                      </div>
                    )}

                    {msg.text && <div>{msg.text}</div>}

                    {/* Attachment Render */}
                    {msg.attachment && (
                      <div style={{ marginTop: msg.text ? '0.5rem' : 0 }}>
                        {msg.attachment.isImage ? (
                          <img
                            src={msg.attachment.url}
                            alt={msg.attachment.name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
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
                              gap: '0.5rem',
                              padding: '0.5rem 0.75rem',
                              backgroundColor: isMe ? 'rgba(255, 255, 255, 0.18)' : 'var(--bg-surface)',
                              borderRadius: 'var(--radius-md)',
                              color: isMe ? '#ffffff' : 'var(--primary)',
                              textDecoration: 'none',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}
                          >
                            <FileText size={18} />
                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {msg.attachment.name}
                              {msg.attachment.size && <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>{msg.attachment.size}</div>}
                            </div>
                            <Download size={15} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar (Reply & Manager turn into task) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <button
                      onClick={() => setReplyingTo({ id: msg.id, userName: msg.userName, text: msg.text, hasAttachment: Boolean(msg.attachment) })}
                      style={{
                        fontSize: '0.7rem',
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
                      <Reply size={12} /> Reply
                    </button>

                    {isManager && msg.text && (
                      <button
                        onClick={() => handleTurnIntoTask(msg.text)}
                        style={{
                          fontSize: '0.7rem',
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
                        <PlusCircle size={12} /> Turn into Task
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply & Attachment Context Bar */}
        {(replyingTo || attachment) && (
          <div style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: 'var(--bg-surface-hover)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            {replyingTo && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Reply size={14} />
                  <span>Replying to <strong>{replyingTo.userName}</strong>: "{replyingTo.text || 'Attachment'}"</span>
                </div>
                <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {attachment && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--accent-green)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attachment.isImage ? <ImageIcon size={14} /> : <FileText size={14} />}
                  <span>Attached: <strong>{attachment.name}</strong> ({attachment.size})</span>
                </div>
                <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.5rem',
              color: attachment ? 'var(--accent-green)' : 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Attach photo or document"
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            placeholder={`Message ${currentProject ? currentProject.name : 'team'}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ flex: 1, fontSize: '0.85rem', height: '40px', padding: '0 0.85rem' }}
          />

          <button type="submit" className="btn-primary" style={{ padding: '0 0.95rem', height: '40px' }}>
            <Send size={15} />
          </button>
        </form>

      </div>
    </div>
  );
}
