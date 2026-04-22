const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController'); // ✅ ADD THIS

router.post('/google', authController.googleLogin);
router.post('/setup', authController.setup);
router.post('/login', authController.login);

module.exports = router;