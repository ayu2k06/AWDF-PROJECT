const { findNotifications, markNotificationsRead } = require('../services/memoryStore');

// @desc    Get notifications for the authenticated user
// @route   GET /api/notifications
// @access  Protected
const getNotifications = async (req, res, next) => {
  try {
    const { page = '1', limit = '20', unreadOnly } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || !Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      return res.status(422).json({ success: false, error: 'page must be a positive integer and limit must be between 1 and 100' });
    }
    const userNotifications = findNotifications(
      (notification) => notification.recipient === req.user._id
    );
    const unreadCount = userNotifications.filter((notification) => !notification.read).length;
    const filteredNotifications =
      unreadOnly === 'true'
        ? userNotifications.filter((notification) => !notification.read)
        : userNotifications;
    const total = filteredNotifications.length;
    const notifications = filteredNotifications
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);

    res.status(200).json({
      success: true,
      data: { notifications, unreadCount, pagination: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) } },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notifications as read
// @route   PATCH /api/notifications/read
// @access  Protected
const markAsRead = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (ids !== undefined && (!Array.isArray(ids) || ids.some((id) => !/^[a-f\d]{24}$/i.test(id)))) {
      return res.status(422).json({ success: false, error: 'ids must be an array of valid notification IDs' });
    }
    const query = { recipient: req.user._id };
    if (ids && ids.length > 0) query._id = { $in: ids };

    markNotificationsRead(req.user._id, ids?.length ? new Set(ids) : null);
    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead };
