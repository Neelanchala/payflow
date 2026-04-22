const express = require('express');
const router = express.Router();
const db = require('../db');
const { successResponse, errorResponse, generateReference } = require('../utils/helpers');

// ================= GET UPI =================
router.get('/', async (req, res) => {
  try {
    const { merchant_id } = req.query;

    if (!merchant_id) {
      return errorResponse(res, 'merchant_id is required', 400);
    }

    const merchant = await db.getAsync(
      'SELECT upi_id FROM merchants WHERE id = ?',
      [merchant_id]
    );

    if (!merchant) {
      return errorResponse(res, 'Merchant not found', 404);
    }

    return successResponse(res, {
      upi_id: merchant.upi_id || null
    });

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ================= SAVE UPI =================
router.post('/save', async (req, res) => {
  try {
    const { merchant_id, upi_id } = req.body;

    if (!merchant_id) {
      return errorResponse(res, 'merchant_id is required', 400);
    }

    if (!upi_id || !upi_id.trim()) {
      return errorResponse(res, 'upi_id is required', 400);
    }

    // ✅ CHECK MERCHANT EXISTS FIRST
    const merchant = await db.getAsync(
      'SELECT * FROM merchants WHERE id = ?',
      [merchant_id]
    );

    if (!merchant) {
      return errorResponse(res, 'Merchant not found', 404);
    }

    await db.runAsync(
      'UPDATE merchants SET upi_id = ? WHERE id = ?',
      [upi_id.trim(), merchant_id]
    );

    return successResponse(res, {
      message: 'UPI ID saved',
      upi_id: upi_id.trim()
    });

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ================= GENERATE QR =================
router.post('/generate-qr', async (req, res) => {
  try {
    const { merchant_id, amount } = req.body;

    if (!merchant_id) {
      return errorResponse(res, 'merchant_id is required', 400);
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return errorResponse(res, 'Valid amount is required', 400);
    }

    const merchant = await db.getAsync(
      'SELECT upi_id FROM merchants WHERE id = ?',
      [merchant_id]
    );

    if (!merchant) {
      return errorResponse(res, 'Merchant not found', 404);
    }

    if (!merchant.upi_id) {
      return errorResponse(
        res,
        'UPI ID not configured. Please save your UPI ID first.',
        400
      );
    }

    const upiUrl = `upi://pay?pa=${encodeURIComponent(
      merchant.upi_id
    )}&am=${Number(amount).toFixed(2)}&cu=INR`;

    return successResponse(res, {
      upiUrl,
      upi_id: merchant.upi_id,
      amount: Number(amount)
    });

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

// ================= CONFIRM PAYMENT =================
router.post('/confirm', async (req, res) => {
  try {
    const { merchant_id, amount, customer_id } = req.body;

    if (!merchant_id) {
      return errorResponse(res, 'merchant_id is required', 400);
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return errorResponse(res, 'Valid amount is required', 400);
    }

    const reference = generateReference('UPI');

    const result = await db.runAsync(
      `INSERT INTO transactions 
       (merchant_id, amount, reference, status, customer_id) 
       VALUES (?, ?, ?, 'PAID', ?)`,
      [merchant_id, Number(amount), reference, customer_id || null]
    );

    const transaction = await db.getAsync(
      'SELECT * FROM transactions WHERE id = ?',
      [result.lastID]
    );

    return successResponse(res, transaction, 201);

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;