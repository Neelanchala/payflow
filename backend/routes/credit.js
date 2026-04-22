const express = require('express');
const router = express.Router();
const db = require('../db');
const { successResponse, errorResponse } = require('../utils/helpers');

router.get('/', async (req, res) => {
  try {
    const { merchant_id } = req.query;
    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);
    const unpaid = await db.allAsync("SELECT t.*, c.name as customer_name, c.phone as customer_phone FROM transactions t LEFT JOIN customers c ON t.customer_id = c.id WHERE t.merchant_id = ? AND t.status = 'UNPAID' ORDER BY t.created_at DESC", [merchant_id]);
    const totalCredit = unpaid.reduce((sum, t) => sum + t.amount, 0);
    return successResponse(res, { transactions: unpaid, totalCredit });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

router.patch('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { merchant_id } = req.body;
    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);
    const txn = await db.getAsync("SELECT * FROM transactions WHERE id = ? AND merchant_id = ? AND status = 'UNPAID'", [id, merchant_id]);
    if (!txn) return errorResponse(res, 'Unpaid transaction not found', 404);
    await db.runAsync("UPDATE transactions SET status = 'PAID' WHERE id = ?", [id]);
    return successResponse(res, { message: 'Marked as PAID' });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
