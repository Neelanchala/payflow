const db = require('../db');
const { successResponse, errorResponse, generateReference } = require('../utils/helpers');
const { LOW_STOCK_THRESHOLD } = require('../config/constants');

/* ================= SELL ================= */
async function sell(req, res) {
  let transactionStarted = false;

  try {
    const { merchant_id, item_id, quantity, customer_id, status } = req.body;

    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);
    if (!item_id) return errorResponse(res, 'item_id is required', 400);

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      return errorResponse(res, 'Valid quantity is required', 400);
    }

    const product = await db.getAsync(
      'SELECT * FROM inventory WHERE id = ? AND merchant_id = ?',
      [item_id, merchant_id]
    );

    if (!product) return errorResponse(res, 'Product not found', 404);
    if (product.quantity < qty) {
      return errorResponse(res, `Only ${product.quantity} in stock`, 400);
    }

    // ✅ START TRANSACTION
    await db.runAsync('BEGIN TRANSACTION');
    transactionStarted = true;

    const total = product.price * qty;
    const newQty = product.quantity - qty;

    await db.runAsync(
      'UPDATE inventory SET quantity = ? WHERE id = ?',
      [newQty, item_id]
    );

    if (newQty < LOW_STOCK_THRESHOLD) {
      await db.runAsync(
        'INSERT INTO notifications (merchant_id, message) VALUES (?, ?)',
        [merchant_id, `Low stock: ${product.name} (${newQty} left)`]
      );
    }

    const txnStatus = status === 'UNPAID' ? 'UNPAID' : 'PAID';
    const reference = generateReference('SALE');

    const result = await db.runAsync(
      'INSERT INTO transactions (merchant_id, amount, reference, status, customer_id) VALUES (?, ?, ?, ?, ?)',
      [merchant_id, total, reference, txnStatus, customer_id || null]
    );

    const transaction = await db.getAsync(
      'SELECT * FROM transactions WHERE id = ?',
      [result.lastID]
    );

    // ✅ COMMIT
    await db.runAsync('COMMIT');

    return successResponse(res, {
      transaction,
      product_name: product.name,
      quantity: qty,
      total
    }, 201);

  } catch (err) {
    console.error("SELL ERROR:", err);

    // ✅ SAFE ROLLBACK (ONLY IF STARTED)
    try {
      if (transactionStarted) {
        await db.runAsync('ROLLBACK');
      }
    } catch (rollbackErr) {
      console.error("ROLLBACK FAILED:", rollbackErr);
    }

    return errorResponse(res, err.message, 500);
  }
}

/* ================= GET TRANSACTIONS ================= */
async function getTransactions(req, res) {
  try {
    const { merchant_id, status, limit } = req.query;

    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);

    let query = `
      SELECT t.*, c.name as customer_name 
      FROM transactions t 
      LEFT JOIN customers c ON t.customer_id = c.id 
      WHERE t.merchant_id = ?
    `;

    const params = [merchant_id];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC';

    if (limit && !isNaN(limit)) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    const transactions = await db.allAsync(query, params);

    return successResponse(res, transactions);

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

/* ================= MARK AS PAID ================= */
async function markAsPaid(req, res) {
  try {
    const { id } = req.params;
    const { merchant_id } = req.body;

    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);

    const txn = await db.getAsync(
      'SELECT * FROM transactions WHERE id = ? AND merchant_id = ?',
      [id, merchant_id]
    );

    if (!txn) return errorResponse(res, 'Transaction not found', 404);

    if (txn.status === 'PAID') {
      return errorResponse(res, 'Transaction already marked as PAID', 400);
    }

    await db.runAsync(
      "UPDATE transactions SET status = 'PAID' WHERE id = ? AND merchant_id = ?",
      [id, merchant_id]
    );

    const updated = await db.getAsync(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    return successResponse(res, updated);

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

/* ================= ADD TRANSACTION ================= */
async function addTransaction(req, res) {
  try {
    const { merchant_id, amount, reference, status, customer_id } = req.body;

    if (!merchant_id) return errorResponse(res, 'merchant_id is required', 400);

    const amt = Number(amount);
    if (!amt || isNaN(amt) || amt <= 0) {
      return errorResponse(res, 'Valid amount is required', 400);
    }

    const ref = reference || generateReference('TXN');
    const txnStatus = status === 'UNPAID' ? 'UNPAID' : 'PAID';

    const result = await db.runAsync(
      'INSERT INTO transactions (merchant_id, amount, reference, status, customer_id) VALUES (?, ?, ?, ?, ?)',
      [merchant_id, amt, ref, txnStatus, customer_id || null]
    );

    const transaction = await db.getAsync(
      'SELECT * FROM transactions WHERE id = ?',
      [result.lastID]
    );

    return successResponse(res, transaction, 201);

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

module.exports = {
  sell,
  getTransactions,
  markAsPaid,
  addTransaction
};