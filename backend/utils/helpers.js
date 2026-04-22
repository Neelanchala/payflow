const { v4: uuidv4 } = require('uuid');

function generateMerchantId() {
  return uuidv4();
}

function generateReference(prefix = 'TXN') {
  return `${prefix}-${Date.now()}`;
}

function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function errorResponse(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: message });
}

module.exports = {
  generateMerchantId,
  generateReference,
  successResponse,
  errorResponse,
};
