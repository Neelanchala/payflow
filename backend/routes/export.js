const express = require('express');
const router = express.Router();
const db = require('../db');
const { arrayToCsv } = require('../utils/csv');
const { errorResponse } = require('../utils/helpers');

router.get('/transactions', async (req, res) => {
  try {
    const { merchant_id } = req.query;
    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);
    const rows = await db.allAsync("SELECT t.id, t.reference, t.amount, t.status, c.name as customer_name, t.created_at FROM transactions t LEFT JOIN customers c ON t.customer_id = c.id WHERE t.merchant_id = ? ORDER BY t.created_at DESC", [merchant_id]);
    const headers = ['id', 'reference', 'amount', 'status', 'customer_name', 'created_at'];
    const csv = arrayToCsv(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

router.get('/expenses', async (req, res) => {
  try {
    const { merchant_id } = req.query;
    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);
    const rows = await db.allAsync('SELECT id, title, amount, created_at FROM expenses WHERE merchant_id = ? ORDER BY created_at DESC', [merchant_id]);
    const headers = ['id', 'title', 'amount', 'created_at'];
    const csv = arrayToCsv(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
