import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';
import { fetchApi } from '../utils/api.js';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  Calendar, 
  HelpCircle,
  BarChart2,
  ListTodo,
  Paperclip,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

export default function AIChatDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const { syncRefreshedTasks } = useTasks();

  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `Hello ${user?.name || 'user'}. I am your TaskFlow AI Assistant.\n\nYou can query task statuses, request next task recommendations, or attach photos/documents for me to analyze and solve!`
    }
  ]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const isManager = user?.role === 'manager';

  const suggestionPills = [
    { label: "What's due today?", query: "What's due today?" },
    { label: "Suggest next task", query: "What's my next task?" },
    ...(isManager ? [{ label: "Give team update", query: "Give me today's team update" }] : []),
    { label: "Mark 'Fix login bug' as done", query: "Mark 'Fix login bug' as done" },
    { label: "Change due date of 'Update slides' to Friday", query: "Change due date of 'Update client pitch deck slides' to Friday" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fullDataUrl = event.target.result;
      const base64Data = fullDataUrl.split(',')[1] || '';
      
      setAttachment({
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024) + ' KB',
        url: fullDataUrl,
        mimeType: file.type || 'image/png',
        base64Data,
        isImage: file.type.startsWith('image/')
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendMessage = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if ((!queryText && !attachment) || loading) return;

    const currentAttachment = attachment;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText,
      attachment: currentAttachment
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setAttachment(null);
    setLoading(true);

    try {
      const res = await fetchApi('/ai/chat', {
        method: 'POST',
        body: {
          message: queryText,
          userId: user?.id,
          role: user?.role,
          attachment: currentAttachment ? {
            name: currentAttachment.name,
            mimeType: currentAttachment.mimeType,
            base64Data: currentAttachment.base64Data
          } : null
        }
      });

      const aiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: res.reply
      };

      setMessages(prev => [...prev, aiMsg]);

      if (res.refreshedTasks) {
        syncRefreshedTasks(res.refreshedTasks);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: `Error connecting to AI service: ${err.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '420px',
      maxWidth: '100vw',
      backgroundColor: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideLeft 0.25s ease-out forwards'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface-hover)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: '700' }}>TaskFlow AI Assistant</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: '600' }}>
              • Gemini Multimodal Active
            </span>
          </div>
        </div>

        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
      </div>

      {/* Suggestion Pills */}
      <div style={{
        padding: '0.6rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '0.4rem',
        overflowX: 'auto'
      }}>
        {suggestionPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(pill.query)}
            style={{
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.25rem 0.65rem',
              fontWeight: '500',
              color: 'var(--text-secondary)'
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              gap: '0.65rem',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%'
            }}
          >
            {m.sender === 'ai' && (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={15} />
              </div>
            )}

            <div style={{
              backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface-hover)',
              color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
              padding: '0.75rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap'
            }}>
              {m.text}

              {/* User Attachment Render */}
              {m.attachment && (
                <div style={{ marginTop: '0.5rem' }}>
                  {m.attachment.isImage ? (
                    <img
                      src={m.attachment.url}
                      alt={m.attachment.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '180px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.78rem',
                      padding: '0.35rem 0.65rem',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <FileText size={15} />
                      <span>{m.attachment.name} ({m.attachment.size})</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={15} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Analyzing data and resolving query...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Banner */}
      {attachment && (
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--bg-surface-hover)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--accent-green)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {attachment.isImage ? <ImageIcon size={15} /> : <FileText size={15} />}
            <span>Attached for AI analysis: <strong>{attachment.name}</strong> ({attachment.size})</span>
          </div>
          <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Form Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        style={{
          padding: '0.85rem 1rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.txt,.doc,.docx"
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '0.4rem',
            color: attachment ? 'var(--accent-green)' : 'var(--text-muted)',
            backgroundColor: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px',
            width: '40px'
          }}
          title="Attach photo or document for AI to solve"
        >
          <Paperclip size={18} />
        </button>

        <input
          type="text"
          placeholder="Ask AI or solve attached file/photo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, height: '40px' }}
        />

        <button
          type="submit"
          className="btn-primary"
          disabled={(!input.trim() && !attachment) || loading}
          style={{ height: '40px', padding: '0 0.85rem' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
