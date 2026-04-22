document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupAddProduct();
});

/* ================= LOAD PRODUCTS ================= */
async function loadProducts() {
  try {
    const merchantId = api.getMerchantId();
    if (!merchantId) return;

    const products = await api.get('/inventory', {
      merchant_id: merchantId
    });

    console.log("PRODUCTS:", products);

    const grid = document.getElementById('inv-table-body');
    if (!grid) return;

    if (!Array.isArray(products)) {
      throw new Error("Invalid product data");
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:#888">
            No products found
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

    const grid = document.getElementById('inv-table-body');
    if (grid) {
      grid.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:red">
            ${err.message}
          </td>
        </tr>
      `;
    }
  }
}

/* ================= ADD PRODUCT ================= */
function setupAddProduct() {
  const form = document.getElementById('add-product-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const merchantId = api.getMerchantId();
    if (!merchantId) return;

    const name = document.getElementById('item-name').value.trim();
    const price = document.getElementById('item-price').value;
    const quantity = document.getElementById('item-qty').value;

    const errorEl = document.getElementById('inv-error');
    const successEl = document.getElementById('inv-success');

    errorEl.textContent = '';
    successEl.textContent = '';

    if (!name || price === '' || quantity === '') {
      errorEl.textContent = "All fields are required";
      return;
    }

    try {
      await api.post('/inventory', {
        merchant_id: merchantId,
        name,
        price: Number(price),
        quantity: Number(quantity)
      });

      successEl.textContent = "Product added successfully";

      form.reset();
      loadProducts();

      setTimeout(() => {
        successEl.textContent = '';
      }, 3000);

    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

/* ================= DELETE PRODUCT ================= */
async function deleteProduct(id) {
  const merchantId = api.getMerchantId();
  if (!merchantId) return;

  if (!confirm("Delete this product?")) return;

  try {
    await api.delete(`/inventory/${id}`, {
      merchant_id: merchantId
    });

    loadProducts();

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