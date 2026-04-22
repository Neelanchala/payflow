const db = require('../db');
const { successResponse, errorResponse } = require('../utils/helpers');
const { HIGH_EXPENSE_THRESHOLD } = require('../config/constants');

async function addExpense(req, res) {
  try {
    const { merchant_id, title, amount } = req.body;
    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);
    if (!title || !title.trim()) return errorResponse(res, 'title is required', 400);
    if (amount === undefined || amount === null || isNaN(amount) || Number(amount) <= 0) return errorResponse(res, 'Valid amount is required', 400);
    const amt = Number(amount);
    const result = await db.runAsync('INSERT INTO expenses (merchant_id, title, amount) VALUES (?, ?, ?)', [merchant_id, title.trim(), amt]);
    if (amt > HIGH_EXPENSE_THRESHOLD) {
      await db.runAsync('INSERT INTO notifications (merchant_id, message) VALUES (?, ?)', [merchant_id, `High expense alert: "${title.trim()}" amounting to ₹${amt.toFixed(2)}`]);
    }
    const expense = await db.getAsync('SELECT * FROM expenses WHERE id = ?', [result.lastID]);
    return successResponse(res, expense, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

async function getExpenses(req, res) {
  try {
    const { merchant_id } = req.query;
    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);
    const expenses = await db.allAsync('SELECT * FROM expenses WHERE merchant_id = ? ORDER BY created_at DESC', [merchant_id]);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const revenueRow = await db.getAsync("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE merchant_id = ? AND status = 'PAID'", [merchant_id]);
    const totalRevenue = revenueRow ? revenueRow.total : 0;
    const profit = totalRevenue - totalExpenses;
    return successResponse(res, { expenses, totalExpenses, totalRevenue, profit });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

module.exports = { addExpense, getExpenses };
