document.addEventListener('DOMContentLoaded', async () => {
  const merchantId = api.getMerchantId();
  if (!merchantId) return;

  await loadItems(merchantId);
  await loadCustomers(merchantId);

  const form = document.getElementById('sell-form');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      const errEl = document.getElementById('sell-error');
      const successEl = document.getElementById('sell-success');

      errEl.textContent = '';
      successEl.textContent = '';

      try {
        const item_id = document.getElementById('sell-item').value;
        const quantity = document.getElementById('sell-qty').value;
        const status = document.getElementById('sell-status').value;
        const customer_id =
          document.getElementById('sell-customer').value || null;

        if (!item_id || !quantity) {
          throw new Error("Select product and quantity");
        }

        const result = await api.post('/transactions/sell', {
          merchant_id: merchantId,
          item_id,
          quantity,
          status,
          customer_id
        });
        // 👉 redirect to UPI page with customer info
        if (status === "UNPAID (Credit)" && customer_id) {
          const customer = customersData.find(c => c.id == customer_id);

          const total = result.total;

          window.location.href =
            `/upi.html?amount=${total}` +
            `&phone=${customer?.phone || ''}` +
            `&name=${encodeURIComponent(customer?.name || '')}`;

          return; // stop further execution
        }
        successEl.textContent =
          `Sale recorded! ${result.product_name} x${result.quantity} = ₹${result.total.toFixed(2)} (${result.transaction.status})`;

        form.reset();
        await loadItems(merchantId);

      } catch (err) {
        errEl.textContent = err.message;
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  const itemSelect = document.getElementById('sell-item');
  const qtyInput = document.getElementById('sell-qty');

  if (itemSelect) itemSelect.addEventListener('change', updateTotal);
  if (qtyInput) qtyInput.addEventListener('input', updateTotal);
});

let itemsData = [];
let customersData = [];

/* ================= LOAD ITEMS ================= */
async function loadItems(merchantId) {
  try {
    if (!merchantId) return;

    const items = await api.get('/inventory', {
      merchant_id: merchantId
    });

    if (!Array.isArray(items)) {
      throw new Error("Invalid inventory data");
    }

    itemsData = items;

    const select = document.getElementById('sell-item');
    if (!select) return;

    if (!items.length) {
      select.innerHTML = `<option value="">No products available</option>`;
      return;
    }

    select.innerHTML =
      '<option value="">Select Product</option>' +
      items.map(i => `
        <option value="${i.id}" 
          data-price="${i.price}" 
          data-qty="${i.quantity}">
          ${escHtml(i.name)} (Stock: ${i.quantity}) - ₹${i.price}
        </option>
      `).join('');

  } catch (err) {
    const el = document.getElementById('sell-error');
    if (el) el.textContent = err.message;
  }
}

/* ================= LOAD CUSTOMERS ================= */
async function loadCustomers() {
  try {
    const customers = await api.get('/customers', {
      merchant_id: api.getMerchantId()
    });

    // ✅ STRICT CHECK
    if (!Array.isArray(customers)) {
      throw new Error("Invalid customer data");
    }

    const select = document.getElementById('sell-customer');

    if (!customers.length) {
      select.innerHTML = `<option value="">No customers</option>`;
      return;
    }

    select.innerHTML =
      '<option value="">No Customer (Walk-in)</option>' +
      customers.map(c => `
        <option value="${c.id}">
          ${escHtml(c.name)}${c.phone ? ' - ' + c.phone : ''}
        </option>
      `).join('');

  } catch (err) {
    console.error("CUSTOMER LOAD ERROR:", err);
    document.getElementById('sell-error').textContent = err.message;
  }
}

/* ================= UPDATE TOTAL ================= */
function updateTotal() {
  const select = document.getElementById('sell-item');
  if (!select) return;

  const option = select.options[select.selectedIndex];
  if (!option || !option.dataset.price) return;

  const qty = parseInt(document.getElementById('sell-qty').value) || 0;

  const price = parseFloat(option.dataset.price);
  const stock = parseInt(option.dataset.qty);

  const total = price * qty;

  const totalEl = document.getElementById('sell-total');
  if (totalEl) {
    totalEl.textContent =
      `Total: ₹${total.toFixed(2)} (Stock available: ${stock})`;
  }

  const errEl = document.getElementById('sell-error');
  if (!errEl) return;

  if (qty > stock) {
    errEl.textContent = `Only ${stock} in stock!`;
  } else {
    errEl.textContent = '';
  }
}

/* ================= ESCAPE ================= */
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}