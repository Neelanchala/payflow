const db = require('../db');
const { successResponse, errorResponse } = require('../utils/helpers');
const { LOW_STOCK_THRESHOLD } = require('../config/constants');

/* ================= ADD PRODUCT ================= */
async function addProduct(req, res) {
  try {
    const merchant_id = req.user.merchant_id; // ✅ FIXED
    const { name, price, quantity } = req.body;

    const cleanName = name ? name.trim() : '';
    if (!cleanName) return errorResponse(res, 'name is required', 400);

    const priceNum = Number(price);
    const qty = parseInt(quantity);

    if (isNaN(priceNum) || priceNum < 0) {
      return errorResponse(res, 'Valid price is required', 400);
    }

    if (isNaN(qty) || qty < 0) {
      return errorResponse(res, 'Valid quantity is required', 400);
    }

    await db.runAsync('BEGIN TRANSACTION');

    const result = await db.runAsync(
      'INSERT INTO inventory (merchant_id, name, price, quantity) VALUES (?, ?, ?, ?)',
      [merchant_id, cleanName, priceNum, qty]
    );

    if (qty < LOW_STOCK_THRESHOLD) {
      await db.runAsync(
        'INSERT INTO notifications (merchant_id, message) VALUES (?, ?)',
        [merchant_id, `Low stock alert: "${cleanName}" has only ${qty} unit(s) left`]
      );
    }

    const product = await db.getAsync(
      'SELECT * FROM inventory WHERE id = ?',
      [result.lastID]
    );

    await db.runAsync('COMMIT');

    return successResponse(res, product, 201);

  } catch (err) {
    await db.runAsync('ROLLBACK');
    return errorResponse(res, err.message, 500);
  }
}

/* ================= GET PRODUCTS ================= */
async function getProducts(req, res) {
  try {
    const merchant_id = req.user.merchant_id; // ✅ FIXED

    const products = await db.allAsync(
      'SELECT * FROM inventory WHERE merchant_id = ? ORDER BY name ASC',
      [merchant_id]
    );

    return successResponse(res, products);

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

/* ================= UPDATE PRODUCT ================= */
async function updateProduct(req, res) {
  try {
    const merchant_id = req.user.merchant_id; // ✅ FIXED
    const { id } = req.params;
    const { name, price, quantity } = req.body;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'Invalid product id', 400);
    }

    const product = await db.getAsync(
      'SELECT * FROM inventory WHERE id = ? AND merchant_id = ?',
      [id, merchant_id]
    );

    if (!product) return errorResponse(res, 'Product not found', 404);

    const newName = name !== undefined ? name.trim() : product.name;
    const newPrice = price !== undefined ? Number(price) : product.price;
    const newQty = quantity !== undefined ? parseInt(quantity) : product.quantity;

    if (!newName) return errorResponse(res, 'Invalid name', 400);
    if (isNaN(newPrice) || newPrice < 0) return errorResponse(res, 'Invalid price', 400);
    if (isNaN(newQty) || newQty < 0) return errorResponse(res, 'Quantity cannot be negative', 400);

    await db.runAsync('BEGIN TRANSACTION');

    await db.runAsync(
      'UPDATE inventory SET name = ?, price = ?, quantity = ? WHERE id = ? AND merchant_id = ?',
      [newName, newPrice, newQty, id, merchant_id]
    );

    if (product.quantity >= LOW_STOCK_THRESHOLD && newQty < LOW_STOCK_THRESHOLD) {
      await db.runAsync(
        'INSERT INTO notifications (merchant_id, message) VALUES (?, ?)',
        [merchant_id, `Low stock alert: "${newName}" has only ${newQty} unit(s) left`]
      );
    }

    const updated = await db.getAsync(
      'SELECT * FROM inventory WHERE id = ?',
      [id]
    );

    await db.runAsync('COMMIT');

    return successResponse(res, updated);

  } catch (err) {
    await db.runAsync('ROLLBACK');
    return errorResponse(res, err.message, 500);
  }
}

/* ================= DELETE PRODUCT ================= */
async function deleteProduct(req, res) {
  try {
    const merchant_id = req.user.merchant_id; // ✅ FIXED
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'Invalid product id', 400);
    }

    const product = await db.getAsync(
      'SELECT * FROM inventory WHERE id = ? AND merchant_id = ?',
      [id, merchant_id]
    );

    if (!product) return errorResponse(res, 'Product not found', 404);

    await db.runAsync(
      'DELETE FROM inventory WHERE id = ? AND merchant_id = ?',
      [id, merchant_id]
    );

    return successResponse(res, { message: 'Product deleted' });

  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct
};