const express = require('express');
const router = express.Router();

const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const verifyToken = require('../middleware/auth');

// 🔒 PROTECT EVERYTHING
router.use(verifyToken);

router.get('/', getProducts);
router.post('/', addProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;