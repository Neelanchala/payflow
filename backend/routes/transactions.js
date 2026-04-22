const express = require('express');
const router = express.Router();

const {
  getTransactions,
  markAsPaid,
  addTransaction,
  sell
} = require('../controllers/transactionController');

/* ================= VALIDATION MIDDLEWARE ================= */

function requireMerchant(req, res, next) {
  const merchant_id = req.body.merchant_id || req.query.merchant_id;

  if (!merchant_id) {
    return res.status(400).json({
      success: false,
      error: "merchant_id is required"
    });
  }

  next();
}

function validateSell(req, res, next) {
  const { item_id, quantity, status } = req.body;

  if (!item_id) {
    return res.status(400).json({
      success: false,
      error: "item_id is required"
    });
  }

  if (!quantity || Number(quantity) <= 0) {
    return res.status(400).json({
      success: false,
      error: "valid quantity is required"
    });
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      error: "status is required"
    });
  }

  next();
}

/* ================= ROUTES ================= */

// Get all transactions
router.get('/', requireMerchant, getTransactions);

// Manual transaction add (optional use)
router.post('/', requireMerchant, addTransaction);

// 🔥 SELL ROUTE (MAIN)
router.post('/sell', requireMerchant, validateSell, sell);

// Mark as paid
router.patch('/:id/pay', requireMerchant, markAsPaid);

module.exports = router;