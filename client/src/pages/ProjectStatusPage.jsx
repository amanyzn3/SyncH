import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  FolderKanban, 
  ChevronDown, 
  ChevronUp, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Layers,
  BarChart2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function ProjectStatusPage({ onSelectTask }) {
  const { projects, tasks } = useTasks();
  const { user, allUsers } = useAuth();
  
  const [expandedProjects, setExpandedProjects] = useState({});

  const toggleExpand = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const isManager = user?.role === 'manager';
  const assignedProjectIds = projects.map(p => p.id);

  const allTeamTasks = tasks.filter(t => !t.isPersonal && (isManager || assignedProjectIds.includes(t.projectId)));
  const totalTasks = allTeamTasks.length;
  const totalCompleted = allTeamTasks.filter(t => t.status === 'Done').length;
  const totalOverdue = allTeamTasks.filter(t => t.dueDate < todayStr && t.status !== 'Done').length;
  const totalIssues = allTeamTasks.filter(t => t.hasError).length;
  const globalProgress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div style={{ padding: '1.75rem 2rem', width: '100%' }}>
      
      {/* Top Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Project Status Dashboard
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              High-level milestone tracking, completion statistics, and team deliverables
            </p>
          </div>
        </div>
      </div>

      {/* Global Summary Metric Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Projects</span>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '0.2rem', color: 'var(--text-primary)' }}>{projects.length}</div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Progress</span>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '0.2rem', color: 'var(--primary)' }}>{globalProgress}%</div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Finished Deliverables</span>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '0.2rem', color: 'var(--accent-green)' }}>{totalCompleted}/{totalTasks}</div>
        </div>

        <div style={{
          backgroundColor: totalIssues > 0 ? 'var(--accent-red-bg)' : 'var(--bg-surface)',
          border: `1px solid ${totalIssues > 0 ? 'var(--accent-red)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: totalIssues > 0 ? 'var(--accent-red)' : 'var(--text-muted)', textTransform: 'uppercase' }}>Reported Issues</span>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '0.2rem', color: totalIssues > 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>{totalIssues}</div>
        </div>
      </div>

      {/* Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {projects.map((project) => {
          const projTasks = tasks.filter(t => t.projectId === project.id);
          const total = projTasks.length;
          const done = projTasks.filter(t => t.status === 'Done').length;
          const inProgress = projTasks.filter(t => t.status === 'In Progress').length;
          const toDo = projTasks.filter(t => t.status === 'To Do').length;
          const overdue = projTasks.filter(t => t.dueDate < todayStr && t.status !== 'Done').length;
          const hasErrorCount = projTasks.filter(t => t.hasError).length;
          const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

          const assigneeIds = [...new Set(projTasks.map(t => t.assigneeId).filter(Boolean))];
          const assignees = allUsers.filter(u => assigneeIds.includes(u.id));

          const isExpanded = Boolean(expandedProjects[project.id]);

          return (
            <div
              key={project.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}
            >
              {/* COLLAPSED BAR HEADER */}
              <div
                onClick={() => toggleExpand(project.id)}
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {/* 1. Project Title & Dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '240px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: project.color || 'var(--primary)',
                    flexShrink: 0
                  }} />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                      {project.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{total} Total Deliverable(s)</span>
                  </div>
                </div>

                {/* 2. Progress Bar */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Milestone Progress</span>
                    <span style={{ color: 'var(--primary)' }}>{progressPercent}% ({done}/{total} Finished)</span>
                  </div>
                  <div style={{ height: '7px', backgroundColor: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      backgroundColor: project.color || 'var(--primary)',
                      borderRadius: '99px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* 3. Assignees & Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {assignees.map((emp) => (
                      <img
                        key={emp.id}
                        src={emp.avatar}
                        alt={emp.name}
                        title={`Team Member: ${emp.name}`}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: '2px solid var(--bg-surface)',
                          marginLeft: '-6px'
                        }}
                      />
                    ))}
                  </div>

                  {hasErrorCount > 0 ? (
                    <span className="badge badge-high" style={{ fontSize: '0.7rem' }}>
                      {hasErrorCount} Issue(s)
                    </span>
                  ) : (
                    <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                      On Track
                    </span>
                  )}

                  <button style={{ color: 'var(--text-muted)', padding: '0.2rem' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* EXPANDED CONTENT VIEW */}
              {isExpanded && (
                <div style={{
                  padding: '1.25rem 1.5rem',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {project.description}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                    backgroundColor: 'var(--bg-surface-hover)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', fontWeight: '700' }}>TOTAL DELIVERABLES</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{total}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', fontWeight: '700' }}>IN PROGRESS</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--accent-amber)' }}>{inProgress}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', fontWeight: '700' }}>COMPLETED</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--accent-green)' }}>{done}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', fontWeight: '700' }}>REPORTED BUGS</span>
                      <strong style={{ fontSize: '1.1rem', color: hasErrorCount > 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                        {hasErrorCount} issue(s)
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                      Deliverables Status List:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {projTasks.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No tasks in this project.</div>
                      ) : (
                        projTasks.map(t => (
                          <div
                            key={t.id}
                            onClick={() => onSelectTask(t)}
                            style={{
                              backgroundColor: 'var(--bg-surface-hover)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.6rem 0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{t.title}</span>
                              {t.hasError && (
                                <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>Issue</span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.assigneeName}</span>
                              <span className={`badge ${t.status === 'Done' ? 'badge-low' : 'badge-status'}`} style={{ fontSize: '0.7rem' }}>
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
