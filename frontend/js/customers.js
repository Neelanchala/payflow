document.addEventListener('DOMContentLoaded', async () => {
  const merchantId = api.getMerchantId();
  if (!merchantId) return;

  await loadCustomers(merchantId);

  const form = document.getElementById('add-customer-form');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      const errorEl = document.getElementById('cust-error');
      const successEl = document.getElementById('cust-success');

      errorEl.textContent = '';
      successEl.textContent = '';

      try {
        const name = document.getElementById('cust-name').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();

        if (!name) throw new Error("Name is required");

        await api.post('/customers/add', {
          merchant_id: merchantId,
          name,
          phone
        });

        form.reset();
        await loadCustomers(merchantId);

        successEl.textContent = 'Customer added!';
        setTimeout(() => successEl.textContent = '', 3000);

      } catch (err) {
        errorEl.textContent = err.message;
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }
});

/* ================= LOAD CUSTOMERS ================= */
async function loadCustomers(merchantId) {
  try {
    if (!merchantId) return;

    const data = await api.get('/customers', {
      merchant_id: merchantId
    });

    const customers = Array.isArray(data)
      ? data
      : data.customers || [];

    const tbody = document.getElementById('cust-table-body');
    if (!tbody) return;

    if (!customers.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:#888">
            No customers yet
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = customers.map(c => `
      <tr>
        <td>${escHtml(c.name)}</td>
        <td>${c.phone || '-'}</td>
        <td>₹${c.total_due || 0}</td>
        <td>${c.id}</td>
        <td>
          <input id="due-${c.id}" type="number" placeholder="₹" style="width:80px;">

          <button class="btn btn-sm btn-primary" onclick="addDue(${c.id})">Add</button>
          <button class="btn btn-sm btn-success" onclick="sendWhatsApp(${c.id})">WhatsApp</button>
          <button class="btn btn-sm btn-secondary" onclick="viewHistory(${c.id})">History</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${c.id})">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error("LOAD CUSTOMER ERROR:", err);
    document.getElementById('cust-error').textContent = err.message;
  }
}

/* ================= ADD DUE ================= */
async function addDue(customerId) {
  try {
    const amount = document.getElementById(`due-${customerId}`).value;

    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    await api.post('/customers/update-due', {
      customer_id: customerId,
      amount: Number(amount)
    });

    const merchantId = api.getMerchantId();
    if (!merchantId) return;

    await loadCustomers(merchantId);

  } catch (err) {
    alert(err.message);
  }
}

/* ================= WHATSAPP ================= */
async function sendWhatsApp(customerId) {
  try {
    const data = await api.get('/customers/send-whatsapp', {
      customer_id: customerId
    });

    if (!data.url) throw new Error("Invalid WhatsApp response");

    window.open(data.url, '_blank');

  } catch (err) {
    alert(err.message);
  }
}

/* ================= HISTORY ================= */
async function viewHistory(customer_id) {
  const merchantId = api.getMerchantId();
  if (!merchantId) return;

  const modal = document.getElementById('history-modal');
  const content = document.getElementById('history-content');

  content.innerHTML = 'Loading...';
  modal.style.display = 'flex';

  try {
    const data = await api.get(`/customers/${customer_id}/history`, {
      merchant_id: merchantId
    });

    const { customer, transactions, totalSpent } = data;

    let html = `<h3>${escHtml(customer.name)}</h3>`;

    if (customer.phone) {
      html += `<p>Phone: ${customer.phone}</p>`;
    }

    html += `<p><strong>Total Spent: ₹${totalSpent.toFixed(2)}</strong></p>`;

    if (!transactions.length) {
      html += '<p style="color:#888">No transactions</p>';
    } else {
      html += `
        <table class="table">
          <thead>
            <tr><th>Ref</th><th>Amount</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${t.reference}</td>
                <td>₹${t.amount.toFixed(2)}</td>
                <td>${t.status}</td>
                <td>${new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    content.innerHTML = html;

  } catch (err) {
    content.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

/* ================= DELETE ================= */
async function deleteCustomer(customerId) {
  if (!confirm("Delete this customer permanently?")) return;

  try {
    await api.delete(`/customers/delete/${customerId}`);
    
    const merchantId = api.getMerchantId();
    if (!merchantId) return;

    await loadCustomers(merchantId);

  } catch (err) {
    alert(err.message);
  }
}

/* ================= CLOSE MODAL ================= */
function closeModal() {
  document.getElementById('history-modal').style.display = 'none';
}

/* ================= ESCAPE ================= */
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}