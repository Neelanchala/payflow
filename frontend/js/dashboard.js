document.addEventListener('DOMContentLoaded', async () => {
  try {
    const mid = api.getMerchantId();

    const data = await api.get('/dashboard', {
      merchant_id: mid
    });

    console.log("DASHBOARD DATA:", data); // debug once

    // 🔥 SAFE VALUE HANDLING (NO MORE toFixed ERRORS)
    const totalRevenue = Number(data?.totalRevenue || 0);
    const totalTransactions = Number(data?.totalTransactions || 0);
    const avgOrder = Number(data?.avgOrderValue || 0);
    const totalExpenses = Number(data?.totalExpenses || 0);
    const profit = Number(data?.profit || 0);
    const unpaid = Number(data?.unpaidCount || 0);
    const lowStock = Number(data?.lowStockCount || 0);

    // ================= STATS =================
    setText('total-revenue', `₹${totalRevenue.toFixed(2)}`);
    setText('total-transactions', totalTransactions);
    setText('avg-order', `₹${avgOrder.toFixed(2)}`);
    setText('total-expenses', `₹${totalExpenses.toFixed(2)}`);
    setText('profit', `₹${profit.toFixed(2)}`);
    setText('unpaid-count', unpaid);
    setText('low-stock', lowStock);

    const profitEl = document.getElementById('profit');
    if (profitEl) {
      profitEl.className = profit >= 0
        ? 'stat-value green'
        : 'stat-value red';
    }

    // ================= TABLE =================
    const tbody = document.getElementById('recent-txns');

    const txns = Array.isArray(data?.recentTransactions)
      ? data.recentTransactions
      : [];

    if (txns.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:#888">
            No transactions yet
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = txns.map(t => `
        <tr>
          <td>${escHtml(t.reference || '-')}</td>
          <td>${escHtml(t.customer_name || '-')}</td>
          <td>₹${Number(t.amount || 0).toFixed(2)}</td>
          <td>
            <span class="badge ${
              t.status === 'PAID' ? 'badge-success' : 'badge-warning'
            }">
              ${t.status || '-'}
            </span>
          </td>
          <td>${t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</td>
        </tr>
      `).join('');
    }

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    showError('dashboard-error', err.message);
  }
});


/* ================= SAFE TEXT ================= */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}


/* ================= ESCAPE ================= */
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}


/* ================= ERROR ================= */
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}


/* ================= NAV + LOGO ================= */
document.addEventListener('DOMContentLoaded', () => {
  const name = localStorage.getItem('shop_name');
  const logo = localStorage.getItem('shop_logo');

  const nameEl = document.getElementById('nav-shop-name');
  const logoEl = document.getElementById('sidebar-logo');

  if (nameEl && name) {
    nameEl.textContent = name;
  }

  if (logoEl && logo) {
    logoEl.src = logo;
    logoEl.style.display = "block";
  } else if (logoEl) {
    logoEl.style.display = "none";
  }
});