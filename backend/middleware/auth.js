const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔴 No header
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "No token provided"
      });
    }

    // 🔴 Invalid format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: "Invalid authorization format"
      });
    }

    const token = authHeader.split(' ')[1];

    // 🔴 Missing token
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token missing"
      });
    }

    const secret = process.env.JWT_SECRET || 'dev_secret';

    const decoded = jwt.verify(token, secret);

    // 🔴 Ensure merchant exists in token
    if (!decoded || !decoded.merchant_id) {
      return res.status(401).json({
        success: false,
        error: "Invalid token payload"
      });
    }

    // ✅ Attach user
    req.user = decoded;

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token"
    });
  }
};