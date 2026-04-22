const express = require('express');
const router = express.Router();
const db = require('../db');
const { successResponse, errorResponse } = require('../utils/helpers');

router.get('/', async (req, res) => {
  try {
    const { merchant_id } = req.query;
    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);

    const [todayRow, weeklyRows, monthlyRows, monthRow, weekRow] = await Promise.all([
      db.getAsync("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE merchant_id = ? AND status = 'PAID' AND DATE(created_at) = DATE('now', 'localtime')", [merchant_id]),
      db.allAsync("SELECT DATE(created_at, 'localtime') as day, COALESCE(SUM(amount), 0) as revenue FROM transactions WHERE merchant_id = ? AND status = 'PAID' AND created_at >= DATE('now', '-6 days', 'localtime') GROUP BY day ORDER BY day ASC", [merchant_id]),
      db.allAsync("SELECT strftime('%Y-%m', created_at, 'localtime') as month, COALESCE(SUM(amount), 0) as revenue FROM transactions WHERE merchant_id = ? AND status = 'PAID' AND created_at >= DATE('now', '-11 months', 'localtime') GROUP BY month ORDER BY month ASC", [merchant_id]),
      db.getAsync("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE merchant_id = ? AND status = 'PAID' AND strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')", [merchant_id]),
      db.getAsync("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE merchant_id = ? AND status = 'PAID' AND created_at >= DATE('now', '-6 days', 'localtime')", [merchant_id])
    ]);

    return successResponse(res, {
      todayRevenue: todayRow ? todayRow.total : 0,
      weeklyRevenue: weekRow ? weekRow.total : 0,
      monthlyRevenue: monthRow ? monthRow.total : 0,
      weeklyRows,
      monthlyRows
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
