const taskEvents = require('../events/taskEvents');
const { getCacheKey, getFromCache, setInCache, invalidateUserCache } = require('../services/cacheService');
const { validationResult } = require('express-validator');
const {
  createTask: addTask,
  findTaskById,
  findTasks,
  updateTask: saveTask,
  deleteTask: removeTask,
  findProjectById,
} = require('../services/memoryStore');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(422).json({
    success: false,
    error: 'Validation failed',
    details: errors.array().map((error) => ({ field: error.path, message: error.msg })),
  });
  return true;
};

const withProject = (task) => {
  if (!task.project) return task;
  const project = findProjectById(task.project);
  return {
    ...task,
    project: project ? { _id: project._id, name: project.name, color: project.color } : null,
  };
};

const getTasks = async (req, res, next) => {
  const startTime = Date.now();
  try {
    if (sendValidationErrors(req, res)) return;
    const {
      status,
      priority,
      category,
      dueDate: dueDateFilter,
      project,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;
    const now = new Date();
    const nextThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const searchPattern = search ? new RegExp(escapeRegex(String(search).trim()), 'i') : null;

    const matches = (task) => {
      if (task.createdBy !== req.user._id) return false;
      if (status && task.status !== status) return false;
      if (priority && task.priority !== priority) return false;
      if (category && task.category !== category) return false;
      if (project && task.project !== project) return false;
      if (dueDateFilter === 'no-date' && task.dueDate) return false;
      if (dueDateFilter === 'overdue' &&
          (!task.dueDate || new Date(task.dueDate) >= now || task.status === 'completed')) return false;
      if (dueDateFilter === 'due-soon' &&
          (!task.dueDate || new Date(task.dueDate) < now ||
            new Date(task.dueDate) > nextThreeDays || task.status === 'completed')) return false;
      if (dueDateFilter === 'upcoming' && (!task.dueDate || new Date(task.dueDate) < now)) return false;
      if (searchPattern &&
          ![task.title, task.description, ...(task.tags || [])].some((value) => searchPattern.test(value || ''))) {
        return false;
      }
      return true;
    };

    const cacheKey = getCacheKey(req.user._id, JSON.stringify(req.query));
    const cached = getFromCache(cacheKey);
    if (cached) {
      const elapsed = Date.now() - startTime;
      console.log(`⚡ [Cache] HIT for user ${req.user._id} | ${elapsed}ms`);
      return res.status(200).json({ ...cached, cached: true, responseTimeMs: elapsed });
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const allMatchingTasks = findTasks(matches).sort((a, b) => {
      const left = a[sortBy];
      const right = b[sortBy];
      const comparison =
        left == null ? (right == null ? 0 : -1) :
          right == null ? 1 :
            left instanceof Date || right instanceof Date
              ? new Date(left) - new Date(right)
              : String(left).localeCompare(String(right), undefined, { numeric: true });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    const total = allMatchingTasks.length;
    const tasks = allMatchingTasks
      .slice((pageNum - 1) * limitNum, pageNum * limitNum)
      .map(withProject);
    const result = {
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      cached: false,
    };
    setInCache(cacheKey, result);
    const elapsed = Date.now() - startTime;
    console.log(`🔄 [Cache] MISS for user ${req.user._id} | ${elapsed}ms`);
    res.status(200).json({ ...result, responseTimeMs: elapsed });
  } catch (err) {
    next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;
    const task = findTaskById(req.params.id);
    if (!task || task.createdBy !== req.user._id) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.status(200).json({ success: true, data: { task: withProject(task) } });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map((error) => ({ field: error.path, message: error.msg })),
      });
    }
    const { title, description, status, priority, dueDate, category, project, tags, aiSuggestions } = req.body;

    if (project) {
      const selectedProject = findProjectById(project);
      if (!selectedProject || selectedProject.owner !== req.user._id) {
        return res.status(422).json({ success: false, error: 'Selected project is not available to this user' });
      }
    }

    const task = addTask({
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      category: category || 'General',
      project: project || null,
      tags: tags || [],
      aiSuggestions: aiSuggestions || null,
      aiGenerated: !!aiSuggestions,
      createdBy: req.user._id,
      assignedTo: null,
    });
    invalidateUserCache(req.user._id);
    const apiResponseTime = new Date().toISOString();
    res.once('finish', () => {
      setImmediate(() => taskEvents.emit('task-created', { task, userId: req.user._id, apiResponseTime }));
    });
    res.status(201).json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;
    const task = findTaskById(req.params.id);
    if (!task || task.createdBy !== req.user._id) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    const allowedUpdates = ['title', 'description', 'status', 'priority', 'dueDate', 'category', 'project', 'tags', 'aiSuggestions'];
    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (updates.project) {
      const selectedProject = findProjectById(updates.project);
      if (!selectedProject || selectedProject.owner !== req.user._id) {
        return res.status(422).json({ success: false, error: 'Selected project is not available to this user' });
      }
    }

    const changedFields = Object.keys(updates);
    const wasCompleted = task.status !== 'completed' && updates.status === 'completed';
    if (updates.title !== undefined) updates.title = updates.title.trim();
    if (updates.description !== undefined) updates.description = updates.description.trim();
    saveTask(task._id, updates);
    invalidateUserCache(req.user._id);
    res.status(200).json({ success: true, data: { task } });
    setImmediate(() => {
      if (wasCompleted) {
        taskEvents.emit('task-completed', { task, userId: req.user._id });
      } else {
        taskEvents.emit('task-updated', { task, userId: req.user._id, changes: changedFields });
      }
    });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;
    const task = findTaskById(req.params.id);
    if (!task || task.createdBy !== req.user._id) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    removeTask(task._id);
    invalidateUserCache(req.user._id);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
    setImmediate(() => taskEvents.emit('task-deleted', { taskTitle: task.title, userId: req.user._id }));
  } catch (err) {
    next(err);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const userTasks = findTasks((task) => task.createdBy === userId);
    const countBy = (field) =>
      userTasks.reduce((counts, task) => {
        counts[task[field]] = (counts[task[field]] || 0) + 1;
        return counts;
      }, {});
    const statusMap = countBy('status');
    const priorityMap = countBy('priority');
    const overdue = userTasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    ).length;
    const dueSoon = userTasks
      .filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate) >= now &&
          new Date(task.dueDate) <= threeDaysFromNow &&
          task.status !== 'completed'
      )
      .slice(0, 5)
      .map(({ title, dueDate, priority }) => ({ title, dueDate, priority }));
    const recentActivity = [...userTasks]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10)
      .map(({ title, status, priority, updatedAt }) => ({ title, status, priority, updatedAt }));
    const weeklyMap = new Map();
    for (const task of userTasks) {
      if (new Date(task.createdAt) < weekAgo) continue;
      const date = new Date(task.createdAt).toISOString().slice(0, 10);
      const day = weeklyMap.get(date) || { _id: date, created: 0, completed: 0 };
      day.created++;
      if (task.status === 'completed') day.completed++;
      weeklyMap.set(date, day);
    }
    const total = userTasks.length;
    const completed = statusMap.completed || 0;
    res.status(200).json({
      success: true,
      data: {
        total,
        todo: statusMap.todo || 0,
        inProgress: statusMap['in-progress'] || 0,
        completed,
        overdue,
        completionRate: total ? Math.round((completed / total) * 100) : 0,
        dueSoon,
        recentActivity,
        weeklyData: [...weeklyMap.values()].sort((a, b) => a._id.localeCompare(b._id)),
        priorityDistribution: priorityMap,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats, escapeRegex };
