const express = require('express');
const router = express.Router();
const db = require('../db');

/* ================= ADD CUSTOMER ================= */
router.post('/add', async (req, res) => {
  try {
    const { merchant_id, name, phone } = req.body;

    if (!merchant_id || !name) {
      return res.status(400).json({
        success: false,
        error: "merchant_id and name are required"
      });
    }

    await db.runAsync(
      `INSERT INTO customers (merchant_id, name, phone, total_due)
       VALUES (?, ?, ?, 0)`,
      [merchant_id, name, phone || null]
    );

    return res.json({ success: true });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


/* ================= GET CUSTOMERS ================= */
router.get('/', async (req, res) => {
  try {
    const { merchant_id } = req.query;

    if (!merchant_id) {
      return res.status(400).json({
        success: false,
        error: "merchant_id is required"
      });
    }

    const customers = await db.allAsync(
      "SELECT * FROM customers WHERE merchant_id = ? ORDER BY id DESC",
      [merchant_id]
    );

    return res.json({
      success: true,
      customers: customers || []   // ✅ ALWAYS ARRAY
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


/* ================= UPDATE DUE ================= */
router.post('/update-due', async (req, res) => {
  try {
    const { customer_id, amount } = req.body;

    if (!customer_id || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: "customer_id and amount required"
      });
    }

    await db.runAsync(
      `UPDATE customers 
       SET total_due = total_due + ?
       WHERE id = ?`,
      [Number(amount), customer_id]
    );

    return res.json({ success: true });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


/* ================= WHATSAPP ================= */
router.get('/send-whatsapp', async (req, res) => {
  try {
    const { customer_id } = req.query;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        error: "customer_id required"
      });
    }

    const customer = await db.getAsync(
      `SELECT * FROM customers WHERE id = ?`,
      [customer_id]
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }

    if (!customer.phone) {
      return res.status(400).json({
        success: false,
        error: "Customer has no phone number"
      });
    }

    const message = `Hello ${customer.name}, your total due is ₹${customer.total_due}. Please clear it soon.`;

    const phone = customer.phone.replace(/\D/g, "");
    const encoded = encodeURIComponent(message);

    const url = `https://wa.me/${phone}?text=${encoded}`;

    return res.json({
      success: true,
      url
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


/* ================= DELETE CUSTOMER ================= */
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.runAsync(
      "DELETE FROM customers WHERE id = ?",
      [id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



module.exports = router;