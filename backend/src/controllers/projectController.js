const { validationResult } = require('express-validator');
const { invalidateUserCache } = require('../services/cacheService');
const {
  createProject: addProject,
  findProjectById,
  findProjectsByOwner,
  updateProject: saveProject,
  deleteProject: removeProject,
  findTasks,
  unlinkProjectTasks,
} = require('../services/memoryStore');

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(422).json({ success: false, error: 'Validation failed', details: errors.array() });
  return true;
};

// @desc    Get all projects for the authenticated user
// @route   GET /api/projects
// @access  Protected
const getProjects = async (req, res, next) => {
  try {
    const projects = findProjectsByOwner(req.user._id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((project) => {
        const projectTasks = findTasks(
          (task) => task.createdBy === req.user._id && task.project === project._id
        );
        const completedCount = projectTasks.filter((task) => task.status === 'completed').length;
        return {
          ...project,
          taskCount: projectTasks.length,
          completedCount,
          progress: projectTasks.length ? Math.round((completedCount / projectTasks.length) * 100) : 0,
        };
      });

    res.status(200).json({ success: true, data: { projects } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Protected
const getProject = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;
    const project = findProjectById(req.params.id);
    if (!project || project.owner !== req.user._id) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const tasks = findTasks((task) => task.project === project._id && task.createdBy === req.user._id);

    res.status(200).json({ success: true, data: { project, tasks } });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Protected
const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, error: 'Validation failed', details: errors.array() });
    }

    const { name, description, color, dueDate } = req.body;
    const project = addProject({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#8b5cf6',
      dueDate: dueDate || null,
      owner: req.user._id,
      status: 'active',
    });
    res.status(201).json({ success: true, data: { project } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a project
// @route   PATCH /api/projects/:id
// @access  Protected
const updateProject = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;
    const project = findProjectById(req.params.id);
    if (!project || project.owner !== req.user._id) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const allowedUpdates = ['name', 'description', 'color', 'status', 'dueDate'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = typeof req.body[field] === 'string' &&
          ['name', 'description'].includes(field)
          ? req.body[field].trim()
          : req.body[field];
      }
    });

    saveProject(project._id, project);
    invalidateUserCache(req.user._id.toString());
    res.status(200).json({ success: true, data: { project } });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Protected
const deleteProject = async (req, res, next) => {
  try {
    if (sendValidationErrors(req, res)) return;
    const project = findProjectById(req.params.id);
    if (!project || project.owner !== req.user._id) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    unlinkProjectTasks(project._id, req.user._id);
    removeProject(project._id);
    invalidateUserCache(req.user._id.toString());

    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
