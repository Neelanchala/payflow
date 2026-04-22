const db = require('../db');
const { successResponse, errorResponse } = require('../utils/helpers');

/* ================= ADD CUSTOMER ================= */
async function addCustomer(req, res) {
  try {
    const { merchant_id, name, phone } = req.body;

    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);

    const cleanName = name ? name.trim() : '';
    if (!cleanName) return errorResponse(res, 'name is required', 400);

    // 🔥 sanitize phone (digits only)
    const cleanPhone = phone ? phone.replace(/\D/g, '') : null;

    await db.runAsync('BEGIN TRANSACTION');

    // 🔥 prevent duplicates (same name + phone)
    const existing = await db.getAsync(
      'SELECT * FROM customers WHERE merchant_id = ? AND name = ? AND phone IS ?',
      [merchant_id, cleanName, cleanPhone]
    );

    if (existing) {
      await db.runAsync('ROLLBACK');
      return errorResponse(res, 'Customer already exists', 400);
    }

    const result = await db.runAsync(
      'INSERT INTO customers (merchant_id, name, phone) VALUES (?, ?, ?)',
      [merchant_id, cleanName, cleanPhone]
    );

    const customer = await db.getAsync(
      'SELECT * FROM customers WHERE id = ?',
      [result.lastID]
    );

    await db.runAsync('COMMIT');

    return successResponse(res, customer, 201);

  } catch (err) {
    await db.runAsync('ROLLBACK');
    return errorResponse(res, err.message, 500);
  }
}

/* ================= GET CUSTOMERS ================= */
async function getCustomers(req, res) {
  try {
    const { merchant_id } = req.query;

    if (!merchant_id) {
      return errorResponse(res, 'merchant_id is required', 400);
    }

    const customers = await db.allAsync(
      'SELECT * FROM customers WHERE merchant_id = ? ORDER BY name ASC',
      [merchant_id]
    );

    // ✅ FIX: RETURN ARRAY DIRECTLY
    return successResponse(res, customers);

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

/* ================= CUSTOMER HISTORY ================= */
async function getCustomerHistory(req, res) {
  try {
    const { customer_id } = req.params;
    const { merchant_id } = req.query;

    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);

    const customer = await db.getAsync(
      'SELECT * FROM customers WHERE id = ? AND merchant_id = ?',
      [customer_id, merchant_id]
    );

    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }

    const transactions = await db.allAsync(
      'SELECT * FROM transactions WHERE customer_id = ? AND merchant_id = ? ORDER BY created_at DESC',
      [customer_id, merchant_id]
    );

    // 🔥 optimized total (only PAID, using SQL instead of JS loop)
    const totalRow = await db.getAsync(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE customer_id = ? AND merchant_id = ? AND status = 'PAID'`,
      [customer_id, merchant_id]
    );

    const totalSpent = totalRow.total || 0;

    return successResponse(res, {
      customer,
      transactions,
      totalSpent
    });

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

module.exports = {
  addCustomer,
  getCustomers,
  getCustomerHistory
};