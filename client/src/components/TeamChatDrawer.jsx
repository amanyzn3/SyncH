import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { X, MessageSquare, Send, PlusCircle, Info, FolderKanban, CheckCircle2 } from 'lucide-react';

export default function TeamChatDrawer({ isOpen, onClose, onOpenCreateTask }) {
  const { projects, chatMessages, fetchChatMessages, sendChatMessage } = useTasks();
  const { user } = useAuth();

  const isManager = user?.role === 'manager';

  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'proj-1');
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (isOpen && selectedProjectId) {
      fetchChatMessages(selectedProjectId);
    }
  }, [isOpen, selectedProjectId, fetchChatMessages]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await sendChatMessage(selectedProjectId, inputText);
    setInputText('');
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
        width: '400px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
            <span>Team Chat</span>
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
            onChange={(e) => setSelectedProjectId(e.target.value)}
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
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {msg.text}
                  </div>

                  {/* Manager Only "Turn into Task" Button */}
                  {isManager && (
                    <button
                      onClick={() => handleTurnIntoTask(msg.text)}
                      style={{
                        marginTop: '0.3rem',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.2rem 0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      title="Manager Action: Turn message into task"
                    >
                      <PlusCircle size={12} /> Turn into Task
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
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
