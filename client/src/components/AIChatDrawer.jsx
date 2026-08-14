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
  ListTodo
} from 'lucide-react';

export default function AIChatDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const { syncRefreshedTasks } = useTasks();

  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `Hello ${user?.name || 'user'}. I am your TaskFlow AI Assistant.\n\nYou can query task statuses, request next task recommendations, or issue commands in natural text.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || input.trim();
    if (!queryText || loading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetchApi('/ai/chat', {
        method: 'POST',
        body: {
          message: queryText,
          userId: user?.id,
          role: user?.role
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
      width: '400px',
      maxWidth: '100vw',
      backgroundColor: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideLeft 0.25s ease-out forwards'
    }}>
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
              • Active Database Sync
            </span>
          </div>
        </div>

        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
      </div>

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
              Processing database query...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        style={{
          padding: '0.85rem 1rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '0.5rem'
        }}
      >
        <input
          type="text"
          placeholder="Type question or task command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, height: '40px' }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={!input.trim() || loading}
          style={{ height: '40px', padding: '0 0.85rem' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
