import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { fetchApi } from '../utils/api.js';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles,
  ArrowUpRight,
  UserCheck,
  Wrench,
  FolderKanban,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';

export default function ManagerDashboardPage({ onSelectTask, onOpenAIChat }) {
  const { tasks, projects, resolveTaskError, refreshTasks } = useTasks();
  const { allUsers } = useAuth();

  const [aiSummary, setAiSummary] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  // Expand all project status cards by default for Manager Executive view
  const [expandedProjects, setExpandedProjects] = useState(() => {
    const init = {};
    projects.forEach(p => { init[p.id] = true; });
    return init;
  });

  const toggleProjectExpand = (projId) => {
    setExpandedProjects(prev => ({ ...prev, [projId]: !prev[projId] }));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const teamTasks = tasks.filter(t => !t.isPersonal);
  const totalCount = teamTasks.length;
  const doneCount = teamTasks.filter(t => t.status === 'Done').length;
  const inProgressCount = teamTasks.filter(t => t.status === 'In Progress').length;
  const overdueCount = teamTasks.filter(t => t.dueDate < todayStr && t.status !== 'Done').length;
  const errorTasks = teamTasks.filter(t => t.hasError);

  const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const employees = allUsers.filter(u => u.role === 'employee');

  const handleGenerateAiSummary = async () => {
    setLoadingAi(true);
    try {
      const res = await fetchApi('/ai/chat', {
        method: 'POST',
        body: { message: 'Give me today team update', role: 'manager' }
      });
      setAiSummary(res.reply);
    } catch (err) {
      console.error('Error fetching AI team summary:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleResolveError = async (taskId) => {
    setResolvingId(taskId);
    try {
      await resolveTaskError(taskId);
    } catch (err) {
      console.error('Error resolving error:', err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div style={{ padding: '1.75rem 2rem', width: '100%' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BarChart3 size={28} style={{ color: 'var(--accent-purple)' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Manager Executive Command Center
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Real-time project tracking, team deliverable statuses, and quality control
          </p>
        </div>

        <button onClick={handleGenerateAiSummary} className="btn-primary" disabled={loadingAi} style={{ fontSize: '0.85rem' }}>
          <Sparkles size={16} />
          <span>{loadingAi ? 'Generating Briefing...' : 'Generate AI Executive Summary'}</span>
        </button>
      </div>

      {/* AI Summary Banner */}
      {aiSummary && (
        <div style={{
          backgroundColor: 'var(--accent-purple-bg)',
          border: '1px solid var(--accent-purple)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
          whiteSpace: 'pre-wrap',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          color: 'var(--text-primary)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ fontWeight: '700', color: 'var(--accent-purple)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={18} /> Synhub AI Executive Briefing
          </div>
          {aiSummary}
        </div>
      )}

      {/* Executive Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Completion</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.2rem', color: 'var(--primary)' }}>{completionRate}%</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{doneCount} of {totalCount} completed</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active In-Progress</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.2rem', color: 'var(--accent-amber)' }}>{inProgressCount}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ongoing team tasks</span>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overdue Tasks</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.2rem', color: overdueCount > 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>{overdueCount}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Past due date</span>
        </div>

        <div style={{ backgroundColor: errorTasks.length > 0 ? 'var(--accent-red-bg)' : 'var(--bg-surface)', border: `1px solid ${errorTasks.length > 0 ? 'var(--accent-red)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: errorTasks.length > 0 ? 'var(--accent-red)' : 'var(--text-muted)', textTransform: 'uppercase' }}>Reported Blockers</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.2rem', color: errorTasks.length > 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>{errorTasks.length}</div>
          <span style={{ fontSize: '0.78rem', color: errorTasks.length > 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>Require Manager QA</span>
        </div>
      </div>

      {/* FEATURE: PROJECTS & TEAM WORKLOAD STATUS INSPECTOR MODULE */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderKanban size={20} style={{ color: 'var(--primary)' }} /> Projects & Team Workload Status Inspector
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Inspect who is working on each project and the real-time status of their deliverables
            </p>
          </div>
          <span className="badge badge-status" style={{ fontSize: '0.75rem' }}>
            {projects.length} Active Projects
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {projects.map((proj) => {
            const projTasks = teamTasks.filter(t => t.projectId === proj.id);
            const total = projTasks.length;
            const done = projTasks.filter(t => t.status === 'Done').length;
            const inProgress = projTasks.filter(t => t.status === 'In Progress').length;
            const toDo = projTasks.filter(t => t.status === 'To Do').length;
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;
            const hasError = projTasks.filter(t => t.hasError).length;

            const assignedUserIds = [...new Set(projTasks.map(t => t.assigneeId).filter(Boolean))];
            const projectTeam = allUsers.filter(u => assignedUserIds.includes(u.id));

            // Default to expanded if not set otherwise
            const isExpanded = expandedProjects[proj.id] !== false;

            return (
              <div
                key={proj.id}
                style={{
                  backgroundColor: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}
              >
                {/* Project Header Row */}
                <div
                  onClick={() => toggleProjectExpand(proj.id)}
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '220px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: proj.color || 'var(--primary)' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{proj.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{projectTeam.length} Team Members • {total} Deliverables</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, maxWidth: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Completion</span>
                      <span style={{ color: 'var(--primary)' }}>{percent}% ({done}/{total})</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percent}%`, backgroundColor: proj.color || 'var(--primary)', borderRadius: '99px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {projectTeam.map(emp => (
                        <img
                          key={emp.id}
                          src={emp.avatar}
                          alt={emp.name}
                          title={`Assigned: ${emp.name}`}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--bg-surface)', marginLeft: '-6px' }}
                        />
                      ))}
                    </div>

                    {hasError > 0 && (
                      <span className="badge badge-high" style={{ fontSize: '0.68rem' }}>
                        {hasError} Issue
                      </span>
                    )}

                    <button style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Team Breakdown */}
                {isExpanded && (
                  <div style={{
                    padding: '1.25rem',
                    borderTop: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Team Members & Workload Breakdown for {proj.name}:
                    </span>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      {projectTeam.map(emp => {
                        const empProjTasks = projTasks.filter(t => t.assigneeId === emp.id);

                        return (
                          <div
                            key={emp.id}
                            style={{
                              backgroundColor: 'var(--bg-surface-hover)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.85rem 1rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                              <img src={emp.avatar} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                              <div>
                                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{emp.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.title}</div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {empProjTasks.map(t => (
                                <div
                                  key={t.id}
                                  onClick={() => onSelectTask(t)}
                                  style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.45rem 0.65rem',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <span style={{ fontWeight: '600', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                                    {t.title}
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    {t.hasError && <span className="badge badge-high" style={{ fontSize: '0.6rem' }}>Issue</span>}
                                    <span className={`badge ${t.status === 'Done' ? 'badge-low' : 'badge-status'}`} style={{ fontSize: '0.68rem' }}>
                                      {t.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Quality Control & Workload Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
        
        {/* Task Errors & Quality Control Panel */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
              <ShieldAlert size={20} style={{ color: 'var(--accent-red)' }} /> Task Errors & Quality Control
            </h3>
            <span className="badge badge-high">{errorTasks.length} Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {errorTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }} />
                <div>No active task errors or technical blockers reported.</div>
              </div>
            ) : (
              errorTasks.map((t) => (
                <div key={t.id} style={{ backgroundColor: 'var(--accent-red-bg)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => onSelectTask(t)}>
                      {t.title}
                    </h4>
                    <span className="badge badge-high">{t.errorSeverity || 'Medium'}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', marginBottom: '0.75rem', fontWeight: '500' }}>
                    <strong>Details:</strong> {t.errorDetails || 'No details specified.'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Assigned to: <strong>{t.assigneeName}</strong></span>
                    <button onClick={() => handleResolveError(t.id)} disabled={resolvingId === t.id} className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                      <Wrench size={14} /> Resolve Blocker
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Employee Workload Distribution */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            <Users size={20} style={{ color: 'var(--primary)' }} /> Overall Employee Performance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {employees.map((emp) => {
              const empTasks = teamTasks.filter(t => t.assigneeId === emp.id);
              const empDone = empTasks.filter(t => t.status === 'Done').length;
              const empTotal = empTasks.length;
              const empPercent = empTotal > 0 ? Math.round((empDone / empTotal) * 100) : 0;
              const empErrors = empTasks.filter(t => t.hasError).length;

              return (
                <div key={emp.id} style={{ backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img src={emp.avatar} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.title}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--primary)' }}>{empDone}/{empTotal} Done ({empPercent}%)</div>
                      {empErrors > 0 && <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>{empErrors} Blocker</span>}
                    </div>
                  </div>

                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${empPercent}%`, backgroundColor: 'var(--primary)', borderRadius: '99px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
