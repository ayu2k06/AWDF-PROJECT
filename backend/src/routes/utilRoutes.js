const express = require('express');
const { suggestTask, getHealth, getReadiness, getPerformanceStats } = require('../controllers/utilController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/health', getHealth);
router.get('/ready', getReadiness);
router.post('/ai/suggest', protect, suggestTask);
router.get('/performance', protect, getPerformanceStats);

module.exports = router;
