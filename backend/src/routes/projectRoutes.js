const express = require('express');
const { body, param } = require('express-validator');
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
const projectIdValidation = [param('id').matches(/^[a-f\d]{24}$/i).withMessage('Invalid project ID')];
const projectBodyValidation = [
	body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Project name required'),
	body('description').optional().isString().isLength({ max: 500 }),
	body('color').optional().matches(/^#[0-9a-f]{6}$/i),
	body('status').optional().isIn(['active', 'completed', 'archived']),
	body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
];
const projectPatchValidation = [
	body('name').optional().trim().isLength({ min: 1, max: 100 }),
	body('description').optional().isString().isLength({ max: 500 }),
	body('color').optional().matches(/^#[0-9a-f]{6}$/i),
	body('status').optional().isIn(['active', 'completed', 'archived']),
	body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
];

router.get('/', getProjects);
router.get('/:id', projectIdValidation, getProject);
router.post('/', projectBodyValidation, createProject);
router.patch('/:id', projectIdValidation, projectPatchValidation, updateProject);
router.delete('/:id', projectIdValidation, deleteProject);

module.exports = router;
