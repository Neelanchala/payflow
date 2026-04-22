const express = require('express');
const router = express.Router();
const { successResponse, errorResponse } = require('../utils/helpers');

/* ================= MOCK DATA ================= */
const MOCK_PRICES = {
  rice: { flipkart: 90, amazon: 95, unit: '1kg bag' },
  oil: { flipkart: 150, amazon: 145, unit: '1L bottle' },
  sugar: { flipkart: 45, amazon: 48, unit: '1kg pack' },
  flour: { flipkart: 55, amazon: 52, unit: '1kg bag' },
  salt: { flipkart: 20, amazon: 22, unit: '1kg pack' },
  dal: { flipkart: 120, amazon: 115, unit: '1kg pack' },
  milk: { flipkart: 60, amazon: 58, unit: '1L' },
  butter: { flipkart: 55, amazon: 58, unit: '100g' },
  tea: { flipkart: 95, amazon: 90, unit: '250g pack' },
  coffee: { flipkart: 200, amazon: 195, unit: '100g jar' },
  soap: { flipkart: 35, amazon: 32, unit: 'per bar' },
  shampoo: { flipkart: 180, amazon: 175, unit: '200ml bottle' },
  toothpaste: { flipkart: 75, amazon: 72, unit: '150g tube' },
  pencil: { flipkart: 10, amazon: 12, unit: 'per piece' },
  notebook: { flipkart: 40, amazon: 38, unit: 'per piece' }
};

/* ================= HELPER ================= */
function buildResponse(productName, data) {
  const cheaper =
    data.flipkart < data.amazon
      ? 'Flipkart'
      : data.flipkart > data.amazon
      ? 'Amazon'
      : 'Equal';

  return {
    product: productName,
    unit: data.unit,
    prices: {
      flipkart: data.flipkart,
      amazon: data.amazon
    },
    cheaper,
    savings: Math.abs(data.flipkart - data.amazon),
    flipkartUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`,
    amazonUrl: `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`
  };
}

/* ================= SEARCH ================= */
router.get('/search', async (req, res) => {
  try {
    const query = (req.query.product || '').trim().toLowerCase();

    if (!query) {
      return errorResponse(res, 'product query is required', 400);
    }

    // 🔍 partial match (important improvement)
    const matchedKey = Object.keys(MOCK_PRICES).find(k =>
      k.includes(query)
    );

    if (!matchedKey) {
      const suggestions = Object.keys(MOCK_PRICES).filter(k =>
        k.includes(query)
      );

      return successResponse(res, {
        found: false,
        product: query,
        suggestions,
        message: `No price data for "${query}". Try: ${
          suggestions.join(', ') || 'rice, oil, sugar'
        }`
      });
    }

    const data = MOCK_PRICES[matchedKey];

    return successResponse(res, {
      found: true,
      ...buildResponse(matchedKey, data)
    });

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    return errorResponse(res, 'Search failed', 500);
  }
});

/* ================= CATALOG ================= */
router.get('/catalog', async (req, res) => {
  try {
    const catalog = Object.entries(MOCK_PRICES).map(([name, data]) =>
      buildResponse(name, data)
    );

    // ✅ IMPORTANT: return ARRAY (not object)
    return successResponse(res, catalog);

  } catch (err) {
    console.error("CATALOG ERROR:", err);
    return errorResponse(res, 'Catalog fetch failed', 500);
  }
});

module.exports = router;