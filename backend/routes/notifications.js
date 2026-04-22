const express = require('express');
const router = express.Router();
const db = require('../db');
const { successResponse, errorResponse } = require('../utils/helpers');

/* ================= GET NOTIFICATIONS ================= */
router.get('/', async (req, res) => {
  try {
    const { merchant_id } = req.query;

    if (!merchant_id) {
      return errorResponse(res, 'merchant_id is required', 400);
    }

    const notifications = await db.allAsync(
      'SELECT * FROM notifications WHERE merchant_id = ? ORDER BY created_at DESC',
      [merchant_id]
    );

    // 🔥 FIX: count in DB instead of JS
    const unreadRow = await db.getAsync(
      'SELECT COUNT(*) as count FROM notifications WHERE merchant_id = ? AND read = 0',
      [merchant_id]
    );

    return successResponse(res, {
      notifications,
      unreadCount: unreadRow.count
    });

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

/* ================= MARK ALL AS READ ================= */
router.patch('/read-all', async (req, res) => {
  try {
    const { merchant_id } = req.body;

    if (!merchant_id) {
      return errorResponse(res, 'merchant_id is required', 400);
    }

    await db.runAsync(
      'UPDATE notifications SET read = 1 WHERE merchant_id = ? AND read = 0',
      [merchant_id]
    );

    return successResponse(res, {
      message: 'All notifications marked as read'
    });

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

/* ================= MARK ONE AS READ ================= */
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { merchant_id } = req.body;

    if (!merchant_id) {
      return errorResponse(res, 'merchant_id is required', 400);
    }

    if (!id || isNaN(id)) {
      return errorResponse(res, 'Invalid notification id', 400);
    }

    const notif = await db.getAsync(
      'SELECT * FROM notifications WHERE id = ? AND merchant_id = ?',
      [id, merchant_id]
    );

    if (!notif) {
      return errorResponse(res, 'Notification not found', 404);
    }

    // 🔥 prevent unnecessary update
    if (notif.read === 1) {
      return successResponse(res, {
        message: 'Already marked as read'
      });
    }

    await db.runAsync(
      'UPDATE notifications SET read = 1 WHERE id = ? AND merchant_id = ?',
      [id, merchant_id]
    );

    return successResponse(res, {
      message: 'Marked as read'
    });

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;