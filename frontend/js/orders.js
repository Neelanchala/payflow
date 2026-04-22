document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  loadCatalog();
});


/* ================= SEARCH ================= */
function initSearch() {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const resultDiv = document.getElementById('search-result');

  if (!form || !input || !resultDiv) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const query = input.value.trim();
    if (!query) return;

    resultDiv.innerHTML = `
      <div class="empty-state">🔍 Searching...</div>
    `;

    try {
      const data = await api.get('/orders/search', { product: query });

      console.log("SEARCH DATA:", data);

      if (!data || data.found === false) {
        resultDiv.innerHTML = `
          <div class="empty-state">
            ${data?.message || "No result"}
            ${
              data?.suggestions?.length
                ? `<br><small>Suggestions: ${data.suggestions.join(', ')}</small>`
                : ''
            }
          </div>
        `;
        return;
      }

      resultDiv.innerHTML = renderCard(data);

    } catch (err) {
      document.getElementById('order-error').textContent = err.message;
    }
  });
}


/* ================= CATALOG ================= */
async function loadCatalog() {
  try {
    console.log("🚀 Loading catalog...");

    const catalog = await api.get('/orders/catalog');

    console.log("CATALOG:", catalog);

    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    // 🔥 FIX: ALWAYS VALIDATE ARRAY
    if (!Array.isArray(catalog) || catalog.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">No products found</div>
      `;
      return;
    }

    grid.innerHTML = catalog.map(item => renderCard(item)).join('');

  } catch (err) {
    console.error("CATALOG ERROR:", err);
    document.getElementById('catalog-grid').innerHTML =
      `<div class="error-msg">${err.message}</div>`;
  }
}


/* ================= CARD ================= */
function renderCard(item) {
  if (!item) return '';

  const name = item.product || item.product_name || item.name || "Product";
  const unit = item.unit || "";

  const flipkartPrice = Number(item?.prices?.flipkart || 0);
  const amazonPrice = Number(item?.prices?.amazon || 0);

  const cheaper = item.cheaper || "Equal";
  const savings = Number(item?.savings || 0);

  const fClass = cheaper === 'Flipkart' ? 'cheaper' : '';
  const aClass = cheaper === 'Amazon' ? 'cheaper' : '';

  return `
    <div class="order-card">
      <h3>
        ${escHtml(name)}
        ${unit ? `<small>(${escHtml(unit)})</small>` : ''}
      </h3>

      <div class="price-comparison">

        <div class="price-box ${fClass}">
          <div class="platform">Flipkart</div>
          <div class="price">₹${flipkartPrice}</div>
          ${cheaper === 'Flipkart' ? '<div class="cheaper-badge">Cheaper!</div>' : ''}
          <a href="${item.flipkartUrl || '#'}" target="_blank" class="btn btn-primary btn-sm">
            Buy on Flipkart
          </a>
        </div>

        <div class="price-box ${aClass}">
          <div class="platform">Amazon</div>
          <div class="price">₹${amazonPrice}</div>
          ${cheaper === 'Amazon' ? '<div class="cheaper-badge">Cheaper!</div>' : ''}
          <a href="${item.amazonUrl || '#'}" target="_blank" class="btn btn-warning btn-sm">
            Buy on Amazon
          </a>
        </div>

      </div>

      ${
        savings > 0
          ? `<p class="savings-note">Save ₹${savings} by choosing ${cheaper}</p>`
          : `<p class="savings-note">Same price on both platforms</p>`
      }
    </div>
  `;
}


/* ================= ESCAPE ================= */
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}