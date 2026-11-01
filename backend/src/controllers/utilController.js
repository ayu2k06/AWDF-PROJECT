const { generateTaskSuggestions } = require('../services/aiService');
const { getCacheStats } = require('../services/cacheService');
// @desc    AI task suggestions
// @route   POST /api/ai/suggest
// @access  Protected
const suggestTask = async (req, res, next) => {
  try {
    const { title, context = '' } = req.body;
    if (typeof title !== 'string' || title.trim().length < 3 || title.length > 200) {
      return res.status(400).json({ success: false, error: 'Title must contain between 3 and 200 characters' });
    }
    if (typeof context !== 'string' || context.length > 500) {
      return res.status(400).json({ success: false, error: 'Context must be text with a maximum of 500 characters' });
    }

    const suggestions = await generateTaskSuggestions(title, context);
    res.status(200).json({ success: true, data: { suggestions } });
  } catch (err) {
    if (err.message.includes('rate limit') || err.message.includes('configuration')) {
      return res.status(503).json({ success: false, error: err.message });
    }
    next(err);
  }
};

// @desc    System health and performance metrics
// @route   GET /api/health
// @access  Public
const getHealth = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      },
      node: process.version,
      environment: process.env.NODE_ENV || 'development',
    },
  });
};

const getReadiness = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ready',
      timestamp: new Date().toISOString(),
    },
  });
};

// @desc    Cache and performance statistics
// @route   GET /api/performance
// @access  Protected
const getPerformanceStats = async (req, res) => {
  const stats = getCacheStats();
  res.status(200).json({
    success: true,
    data: {
      cache: stats,
      server: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    },
  });
};

module.exports = { suggestTask, getHealth, getReadiness, getPerformanceStats };
