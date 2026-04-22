const express = require('express');
const router = express.Router();
const db = require('../db');
const { successResponse, errorResponse } = require('../utils/helpers');

router.get('/', async (req, res) => {
  try {
    const { merchant_id } = req.query;
    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);

    const [revRow, txnCountRow, paidCountRow, expRow, unpaidRow, lowRow, recentTxns] = await Promise.all([
      db.getAsync("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE merchant_id = ? AND status = 'PAID'", [merchant_id]),
      db.getAsync("SELECT COUNT(*) as count FROM transactions WHERE merchant_id = ?", [merchant_id]),
      db.getAsync("SELECT COUNT(*) as count FROM transactions WHERE merchant_id = ? AND status = 'PAID'", [merchant_id]),
      db.getAsync("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE merchant_id = ?", [merchant_id]),
      db.getAsync("SELECT COUNT(*) as count FROM transactions WHERE merchant_id = ? AND status = 'UNPAID'", [merchant_id]),
      db.getAsync("SELECT COUNT(*) as count FROM inventory WHERE merchant_id = ? AND quantity < 5", [merchant_id]),
      db.allAsync("SELECT t.*, c.name as customer_name FROM transactions t LEFT JOIN customers c ON t.customer_id = c.id WHERE t.merchant_id = ? ORDER BY t.created_at DESC LIMIT 10", [merchant_id])
    ]);

    const totalRevenue = revRow ? revRow.total : 0;
    const totalTransactions = txnCountRow ? txnCountRow.count : 0;
    const paidCount = paidCountRow ? paidCountRow.count : 0;
    const avgOrderValue = paidCount > 0 ? totalRevenue / paidCount : 0;
    const totalExpenses = expRow ? expRow.total : 0;
    const profit = totalRevenue - totalExpenses;
    const unpaidCount = unpaidRow ? unpaidRow.count : 0;
    const lowStockCount = lowRow ? lowRow.count : 0;

    return successResponse(res, { totalRevenue, totalTransactions, avgOrderValue, recentTransactions: recentTxns, totalExpenses, profit, unpaidCount, lowStockCount });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
