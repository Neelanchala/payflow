const express = require('express');
const router = express.Router();
const { addExpense, getExpenses } = require('../controllers/expenseController');

router.get('/', getExpenses);
router.post('/', addExpense);

module.exports = router;
