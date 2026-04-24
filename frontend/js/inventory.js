document.addEventListener('DOMContentLoaded', () => {
  const merchantId = localStorage.getItem('merchant_id');
  const token = localStorage.getItem('token');

  if (!merchantId || !token) {
    window.location.href = '/index.html';
    return;
  }

  loadProducts(merchantId);
  setupAddProduct(merchantId);
});


/* ================= LOAD PRODUCTS ================= */
async function loadProducts(merchantId) {
  const grid = document.getElementById('inv-table-body');
  if (!grid) return;

  grid.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center;color:#888">
        Loading...
      </td>
    </tr>
  `;

  try {
    const products = await api.get('/inventory', {
      merchant_id: merchantId
    });

    if (!Array.isArray(products)) {
      throw new Error("Invalid product data");
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:#888;padding:20px;">
            <div>No products yet</div>
            <div style="margin:10px 0;">Start by adding your first product</div>
            <button class="btn btn-primary" onclick="document.getElementById('item-name').focus()">
              Add Product
            </button>
          </td>
        </tr>
      `;
      return;
    }

    grid.innerHTML = products.map(p => `
      <tr>
        <td>${escHtml(p.name)}</td>
        <td>₹${Number(p.price || 0).toFixed(2)}</td>
        <td>${p.quantity}</td>
        <td>${p.id}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">
            Delete
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error("INVENTORY ERROR:", err);

    grid.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:red">
          ${err.message}
        </td>
      </tr>
    `;
  }
}


/* ================= ADD PRODUCT ================= */
function setupAddProduct(merchantId) {
  const form = document.getElementById('add-product-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    const name = document.getElementById('item-name').value.trim();
    const price = document.getElementById('item-price').value;
    const quantity = document.getElementById('item-qty').value;

    const errorEl = document.getElementById('inv-error');
    const successEl = document.getElementById('inv-success');

    errorEl.textContent = '';
    successEl.textContent = '';

    if (!name || price === '' || quantity === '') {
      errorEl.textContent = "All fields are required";
      if (btn) btn.disabled = false;
      return;
    }

    const priceNum = Number(price);
    const qtyNum = Number(quantity);

    if (isNaN(priceNum) || isNaN(qtyNum)) {
      errorEl.textContent = "Invalid number input";
      if (btn) btn.disabled = false;
      return;
    }

    try {
      successEl.textContent = "Adding...";

      await api.post('/inventory', {
        merchant_id: merchantId,
        name,
        price: priceNum,
        quantity: qtyNum
      });

      form.reset();
      loadProducts(merchantId);

      successEl.textContent = "Product added successfully";

      setTimeout(() => {
        successEl.textContent = '';
      }, 3000);

    } catch (err) {
      errorEl.textContent = err.message;
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}


/* ================= DELETE PRODUCT ================= */
async function deleteProduct(id) {
  const merchantId = localStorage.getItem('merchant_id');

  if (!merchantId) {
    window.location.href = '/index.html';
    return;
  }

  if (!confirm("Delete this product?")) return;

  try {
    await api.delete(`/inventory/${id}`, {
      merchant_id: merchantId
    });

    loadProducts(merchantId);

  } catch (err) {
    alert(err.message);
  }
}


/* ================= ESCAPE HTML ================= */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}