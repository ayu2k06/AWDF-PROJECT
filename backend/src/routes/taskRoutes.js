const express = require('express');
const { body, param, query } = require('express-validator');
const { getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All task routes require authentication

const taskCreateValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be under 200 characters'),
  body('description').optional().isString().isLength({ max: 2000 }),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  body('category').optional().isString().isLength({ max: 50 }),
  body('project').optional({ nullable: true }).custom((value) => value === null || /^[a-f\d]{24}$/i.test(value)).withMessage('Invalid project ID'),
  body('tags').optional().isArray({ max: 20 }),
  body('tags.*').optional().isString().isLength({ max: 30 }),
  body('aiSuggestions').optional().isObject().custom((value) => JSON.stringify(value).length <= 5000).withMessage('AI suggestions are too large'),
];

const taskPatchValidation = [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be under 200 characters'),
  body('description').optional().isString().isLength({ max: 2000 }),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  body('category').optional().isString().isLength({ max: 50 }),
  body('project').optional({ nullable: true }).custom((value) => value === null || /^[a-f\d]{24}$/i.test(value)).withMessage('Invalid project ID'),
  body('tags').optional().isArray({ max: 20 }),
  body('tags.*').optional().isString().isLength({ max: 30 }),
  body('aiSuggestions').optional().isObject().custom((value) => JSON.stringify(value).length <= 5000).withMessage('AI suggestions are too large'),
];

const taskIdValidation = [param('id').matches(/^[a-f\d]{24}$/i).withMessage('Invalid task ID')];
const taskListValidation = [
  query('status').optional().isIn(['todo', 'in-progress', 'completed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('category').optional().isLength({ max: 50 }),
  query('dueDate').optional().isIn(['overdue', 'due-soon', 'upcoming', 'no-date']),
  query('project').optional().matches(/^[a-f\d]{24}$/i),
  query('search').optional().isLength({ max: 100 }),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'dueDate', 'title', 'priority', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1, max: 100000 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

router.get('/stats', getTaskStats);
router.get('/', taskListValidation, getTasks);
router.get('/:id', taskIdValidation, getTask);
router.post('/', taskCreateValidation, createTask);
router.patch('/:id', taskIdValidation, taskPatchValidation, updateTask);
router.delete('/:id', taskIdValidation, deleteTask);

module.exports = router;
