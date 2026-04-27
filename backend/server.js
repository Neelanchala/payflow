require('dotenv').config();
console.log("SERVER CLIENT:", process.env.GOOGLE_CLIENT_ID);
console.log("GEMINI KEY =", process.env.GEMINI_API_KEY);
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

const aiRoutes = require('./routes/aiRoutes');
/* ================= PORT FIX ================= */
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */

// Enable CORS (safe for now)
app.use(cors());

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (keep it, useful)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* ================= DATABASE ================= */

require('./db'); // initialize DB

/* ================= ROUTES ================= */

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const inventoryRoutes = require('./routes/inventory');
const customersRoutes = require('./routes/customers');
const transactionsRoutes = require('./routes/transactions');
const expensesRoutes = require('./routes/expenses');
const notificationsRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const creditRoutes = require('./routes/credit');
const upiRoutes = require('./routes/upi');
const ordersRoutes = require('./routes/orders');
const exportRoutes = require('./routes/export');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/upi', upiRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/ai', aiRoutes);

/* ================= STATIC FRONTEND ================= */

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

/* ================= HEALTH CHECK (IMPORTANT) ================= */

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

/* ================= SPA FALLBACK ================= */

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    return res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err.stack);

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

/* ================= SERVER START ================= */

app.listen(PORT, () => {
  console.log(`🚀 PayFlow running on port ${PORT}`);
});

module.exports = app;