import React, { useState } from 'react';
import { Sparkles, Sun, Kanban, BarChart3, ChevronRight, X, Check, ShieldCheck } from 'lucide-react';

export default function OnboardingTour({ isOpen, onClose }) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "TaskFlow System Architecture",
      icon: <Sparkles size={32} style={{ color: 'var(--primary)' }} />,
      description: "TaskFlow combines enterprise project tracking, individual daily focus management, and AI copilot task execution.",
      highlight: "Designed for intuitive workflow management without administrative complexity."
    },
    {
      title: "1. Employee Dashboard & My Day Focus",
      icon: <Sun size={32} style={{ color: 'var(--accent-amber)' }} />,
      description: "Manage your assigned deliverables and personal to-do lists. Track daily task completion rates and recurring schedules.",
      highlight: "Role Permission: Employees can create and edit tasks assigned to themselves."
    },
    {
      title: "2. Interactive Project Board",
      icon: <Kanban size={32} style={{ color: 'var(--primary)' }} />,
      description: "Track project pipelines across To Do, In Progress, and Done columns. Tasks assigned to teammates appear in read-only mode.",
      highlight: "Subtask checklists and discussion comments are embedded inside task details."
    },
    {
      title: "3. Task Error & Quality Control",
      icon: <ShieldCheck size={32} style={{ color: 'var(--accent-red)' }} />,
      description: "Report technical issues or blockers directly on tasks. Managers review reported errors on the Manager Overview panel.",
      highlight: "Helps managers identify bottleneck risks early."
    },
    {
      title: "4. AI Copilot Integration",
      icon: <Sparkles size={32} style={{ color: 'var(--accent-purple)' }} />,
      description: "Execute task modifications or request status summaries in plain text using the AI Assistant panel.",
      highlight: "Connected live to the backend database state."
    }
  ];

  const current = steps[step];

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '2rem' }}>
        
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          {current.icon}
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.65rem' }}>
          {current.title}
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
          {current.description}
        </p>

        <div style={{
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.82rem',
          fontWeight: '600',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem'
        }}>
          {current.highlight}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {steps.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === step ? '20px' : '8px',
                height: '8px',
                borderRadius: '99px',
                backgroundColor: i === step ? 'var(--primary)' : 'var(--border-color)',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Close Guide
          </button>

          <button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
              } else {
                onClose();
              }
            }}
            className="btn-primary"
          >
            {step < steps.length - 1 ? (
              <>Next <ChevronRight size={16} /></>
            ) : (
              <>Finish <Check size={16} /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
