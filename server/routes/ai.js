import express from 'express';
import { loadData, saveData, getTodayString } from '../db.js';
import { generateGeminiContent } from '../geminiService.js';

const router = express.Router();

function parseDueDateString(dateStr) {
  const s = dateStr.toLowerCase().trim();
  const today = new Date();
  
  if (s.includes('today')) return getTodayString(0);
  if (s.includes('tomorrow')) return getTodayString(1);
  if (s.includes('yesterday')) return getTodayString(-1);
  if (s.includes('in ') && s.includes(' day')) {
    const num = parseInt(s.replace(/[^0-9]/g, '')) || 1;
    return getTodayString(num);
  }
  
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDayIndex = daysOfWeek.findIndex(d => s.includes(d));
  if (targetDayIndex !== -1) {
    const currentDayIndex = today.getDay();
    let diff = targetDayIndex - currentDayIndex;
    if (diff <= 0) diff += 7;
    return getTodayString(diff);
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return getTodayString(2);
}

function findMatchingTask(tasks, searchTitle) {
  const cleanSearch = searchTitle.toLowerCase().trim().replace(/['"]/g, '');
  let found = tasks.find(t => t.title.toLowerCase().trim() === cleanSearch);
  if (found) return found;

  found = tasks.find(t => t.title.toLowerCase().includes(cleanSearch) || cleanSearch.includes(t.title.toLowerCase()));
  if (found) return found;

  const tokens = cleanSearch.split(/\s+/).filter(w => w.length > 3);
  if (tokens.length > 0) {
    found = tasks.find(t => tokens.some(tok => t.title.toLowerCase().includes(tok)));
  }

  return found || null;
}

router.post('/chat', async (req, res) => {
  try {
    const { message, userId, role = 'employee', attachment = null } = req.body;
    if (!message && !attachment) return res.status(400).json({ error: 'Message or attachment is required' });

    const db = loadData();
    const lowerMsg = (message || '').toLowerCase().trim();
    const todayStr = getTodayString(0);

    const currentUser = db.users.find(u => u.id === userId) || db.users[1];
    const myTasks = db.tasks.filter(t => t.assigneeId === currentUser.id);
    const allTasks = db.tasks;

    let reply = '';
    let actionExecuted = null;

    // Prepare Rich System Context for Gemini
    const systemContext = `App: Synhub Enterprise Platform
Current User: ${currentUser.name} (Role: ${role})
Today Date: ${todayStr}
Active Projects: ${db.projects.map(p => p.name).join(', ')}
Total Tasks: ${allTasks.length} (${allTasks.filter(t => t.status === 'Done').length} Finished)
Assigned Tasks for ${currentUser.name}:
${myTasks.map(t => `- "${t.title}" (Status: ${t.status}, Priority: ${t.priority}, Due: ${t.dueDate || 'N/A'})`).join('\n')}`;

    // If user attached a file or photo, immediately invoke Gemini Multimodal Vision/Document solver
    const requestKey = req.headers['x-gemini-key'] || req.body.geminiApiKey;

    if (attachment) {
      const geminiMultimodalReply = await generateGeminiContent(message, systemContext, requestKey, attachment);
      if (geminiMultimodalReply) {
        return res.json({ reply: geminiMultimodalReply, provider: 'Google Gemini Multimodal AI' });
      }
    }

    // 1. ACTION: Mark Task Status
    const statusMatch = lowerMsg.match(/(?:mark|set|finish|complete)\s+(?:task\s+)?['"]?([^'"]+?)['"]?\s+as\s+(done|completed|in progress|to do)/i)
      || lowerMsg.match(/(?:mark|complete)\s+['"]?([^'"]+?)['"]?\s+(done|complete)/i);

    if (statusMatch) {
      const taskNameQuery = statusMatch[1];
      let newStatus = statusMatch[2].toLowerCase();
      if (newStatus === 'completed' || newStatus === 'complete' || newStatus === 'done') newStatus = 'Done';
      if (newStatus === 'in progress') newStatus = 'In Progress';
      if (newStatus === 'to do') newStatus = 'To Do';

      const targetTask = findMatchingTask(allTasks, taskNameQuery);
      if (targetTask) {
        if (role !== 'manager' && targetTask.assigneeId !== currentUser.id && !targetTask.isPersonal) {
          reply = `Access Denied: As an employee, you can only edit tasks assigned to yourself. Task "${targetTask.title}" is assigned to ${targetTask.assigneeName}.`;
          return res.json({ reply });
        }

        targetTask.status = newStatus;
        saveData(db);
        actionExecuted = { type: 'UPDATE_STATUS', taskId: targetTask.id, newStatus };
        
        reply = `Status Updated: Task "${targetTask.title}" set to ${newStatus}.`;
        return res.json({ reply, actionExecuted, refreshedTasks: db.tasks });
      } else {
        reply = `Could not locate task matching "${taskNameQuery}". Active assigned tasks: ${myTasks.slice(0, 3).map(t => `"${t.title}"`).join(', ')}.`;
        return res.json({ reply });
      }
    }

    // 2. ACTION: Change Due Date
    const dueDateMatch = lowerMsg.match(/(?:change|set|update)\s+(?:the\s+)?due\s+date\s+of\s+['"]?([^'"]+?)['"]?\s+to\s+(.+)/i)
      || lowerMsg.match(/(?:set|change)\s+['"]?([^'"]+?)['"]?\s+due\s+date\s+to\s+(.+)/i);

    if (dueDateMatch) {
      const taskNameQuery = dueDateMatch[1];
      const rawDateStr = dueDateMatch[2];
      const newDueDate = parseDueDateString(rawDateStr);

      const targetTask = findMatchingTask(allTasks, taskNameQuery);
      if (targetTask) {
        if (role !== 'manager' && targetTask.assigneeId !== currentUser.id && !targetTask.isPersonal) {
          reply = `Access Denied: As an employee, you can only update tasks assigned to yourself. Task "${targetTask.title}" is assigned to ${targetTask.assigneeName}.`;
          return res.json({ reply });
        }

        targetTask.dueDate = newDueDate;
        saveData(db);
        actionExecuted = { type: 'UPDATE_DUE_DATE', taskId: targetTask.id, newDueDate };

        reply = `Due Date Updated: Task "${targetTask.title}" scheduled for ${newDueDate}.`;
        return res.json({ reply, actionExecuted, refreshedTasks: db.tasks });
      } else {
        reply = `Could not locate task matching "${taskNameQuery}". Please check the task title.`;
        return res.json({ reply });
      }
    }

    // 3. ACTION: Create Task
    const createMatch = lowerMsg.match(/(?:create|add|new)\s+task\s+['"]?([^'"]+?)['"]?(?:\s+assigned\s+to\s+([a-zA-Z\s]+))?(?:\s+due\s+(.+))?$/i);
    if (createMatch && !lowerMsg.includes('what') && !lowerMsg.includes('how')) {
      const title = createMatch[1].trim();
      const assigneeQuery = createMatch[2] ? createMatch[2].trim() : '';
      const dateQuery = createMatch[3] ? createMatch[3].trim() : 'today';

      let assignee = currentUser;
      if (assigneeQuery && role === 'manager') {
        const matchUser = db.users.find(u => u.name.toLowerCase().includes(assigneeQuery.toLowerCase()));
        if (matchUser) assignee = matchUser;
      }

      const dueDate = parseDueDateString(dateQuery);

      const newTask = {
        id: `tsk-${Date.now()}`,
        title,
        description: 'Created via AI Assistant command.',
        projectId: db.projects[0].id,
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        priority: 'Medium',
        status: 'To Do',
        dueDate,
        tags: ['AI-Created'],
        inMyDay: dueDate === todayStr,
        isImportant: false,
        isPersonal: false,
        recurring: 'none',
        hasError: false,
        errorDetails: '',
        createdAt: todayStr,
        subtasks: [],
        comments: []
      };

      db.tasks.unshift(newTask);
      saveData(db);

      reply = `Task Created: "${newTask.title}" assigned to ${assignee.name} with due date ${dueDate}.`;
      return res.json({ reply, actionExecuted: { type: 'CREATE_TASK', task: newTask }, refreshedTasks: db.tasks });
    }

    // Primary: Google Gemini AI Response
    const geminiReply = await generateGeminiContent(message, systemContext, requestKey, attachment);

    if (geminiReply) {
      return res.json({ reply: geminiReply, provider: 'Google Gemini AI' });
    }

    // Smart Fallback Queries
    if (lowerMsg.includes('active') || lowerMsg.includes('assigned') || lowerMsg.includes('all task') || lowerMsg.includes('show task')) {
      const activeTasks = (role === 'manager' ? allTasks : myTasks).filter(t => t.status !== 'Done');
      if (activeTasks.length === 0) {
        return res.json({ reply: 'All assigned deliverables are complete!' });
      }
      const listStr = activeTasks
        .map(t => `- "${t.title}" | Status: ${t.status} | Assigned: ${t.assigneeName} (${t.priority} Priority)`)
        .join('\n');
      return res.json({ reply: `Active deliverables across projects:\n\n${listStr}` });
    }

    if (lowerMsg.includes('due today') || lowerMsg.includes('tasks today') || lowerMsg.includes('what is due')) {
      const tasksDueToday = (role === 'manager' ? allTasks : myTasks).filter(
        t => t.dueDate === todayStr && t.status !== 'Done'
      );

      if (tasksDueToday.length === 0) {
        reply = `All tasks due today (${todayStr}) are complete.`;
      } else {
        const listStr = tasksDueToday
          .map(t => `- "${t.title}" (Priority: ${t.priority}, Status: ${t.status}, Assigned: ${t.assigneeName})`)
          .join('\n');
        reply = `Pending tasks due today (${todayStr}):\n\n${listStr}`;
      }
      return res.json({ reply });
    }

    if (lowerMsg.includes('next task') || lowerMsg.includes('what should i work on') || lowerMsg.includes('suggest')) {
      const pendingTasks = myTasks.filter(t => t.status !== 'Done');

      if (pendingTasks.length === 0) {
        reply = `All assigned tasks are complete. Review the Project Board or request new assignments.`;
      } else {
        const priorityScore = { High: 3, Medium: 2, Low: 1 };
        pendingTasks.sort((a, b) => {
          const dateA = a.dueDate || '';
          const dateB = b.dueDate || '';
          if (dateA !== dateB) return dateA.localeCompare(dateB);
          return (priorityScore[b.priority] || 1) - (priorityScore[a.priority] || 1);
        });

        const topTask = pendingTasks[0];
        const isOverdue = topTask.dueDate && topTask.dueDate < todayStr;
        
        reply = `Recommended Next Task:\n\nTask: "${topTask.title}"\n` +
          `- Priority: ${topTask.priority}\n` +
          `- Status: ${topTask.status}\n` +
          `- Due Date: ${topTask.dueDate || 'N/A'} ${isOverdue ? '(Overdue)' : ''}\n` +
          `- Description: ${topTask.description || 'N/A'}`;
      }
      return res.json({ reply });
    }

    if (lowerMsg.includes('team update') || lowerMsg.includes('team summary') || lowerMsg.includes('team progress') || lowerMsg.includes('manager summary')) {
      const totalCount = allTasks.length;
      const doneTasks = allTasks.filter(t => t.status === 'Done');
      const inProgressTasks = allTasks.filter(t => t.status === 'In Progress');
      const overdueTasks = allTasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'Done');
      const errorTasks = allTasks.filter(t => t.hasError);

      const userBreakdown = db.users.filter(u => u.role === 'employee').map(u => {
        const userAssigned = allTasks.filter(t => t.assigneeId === u.id);
        const userDone = userAssigned.filter(t => t.status === 'Done').length;
        const userPending = userAssigned.filter(t => t.status !== 'Done').length;
        const userOverdue = userAssigned.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'Done').length;
        return { name: u.name, done: userDone, pending: userPending, overdue: userOverdue };
      });

      const completionRate = totalCount > 0 ? Math.round((doneTasks.length / totalCount) * 100) : 0;

      let summaryText = `Synhub Team Status Report (${todayStr})\n\n`;
      summaryText += `• Overall Completion: ${completionRate}% (${doneTasks.length}/${totalCount} tasks completed)\n`;
      summaryText += `• Active In Progress: ${inProgressTasks.length} tasks\n`;
      summaryText += `• Overdue Items: ${overdueTasks.length} tasks\n`;
      summaryText += `• Reported Errors/Blockers: ${errorTasks.length} tasks\n\n`;

      if (errorTasks.length > 0) {
        summaryText += `Reported Errors Needing Review:\n`;
        errorTasks.forEach(t => {
          summaryText += `- "${t.title}" (Assigned: ${t.assigneeName}, Details: ${t.errorDetails || 'N/A'})\n`;
        });
        summaryText += `\n`;
      }

      summaryText += `Team Workload Summary:\n`;
      userBreakdown.forEach(ub => {
        summaryText += `- ${ub.name}: ${ub.done} Completed, ${ub.pending} Active ${ub.overdue > 0 ? `(${ub.overdue} overdue)` : ''}\n`;
      });

      return res.json({ reply: summaryText });
    }

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('help')) {
      reply = `Synhub AI Assistant connected. Standard commands:\n- "What's due today?"\n- "What's my next task?"\n- "Mark [Task Title] as done"\n- "Change due date of [Task Title] to Friday"\n- "Give me today's team update"`;
    } else {
      reply = `Command received. Supported queries:\n- "What's due today?"\n- "What's my next task?"\n- "Mark [Task Title] as done"\n- "Change due date of [Task Title] to [Date]"\n- "Give me today's team update"`;
    }

    return res.json({ reply });
  } catch (err) {
    console.error('AI chat endpoint error:', err);
    return res.json({ reply: `AI Assistant query response:\nCould not complete query processing (${err.message}). Please try again or rephrase.` });
  }
});

export default router;
