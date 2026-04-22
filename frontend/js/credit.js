document.addEventListener('DOMContentLoaded', loadCredit);

async function loadCredit() {
  try {
    const data = await api.get('/credit', {
      merchant_id: api.getMerchantId()
    });

    console.log("CREDIT DATA:", data);

    const totalCredit = Number(data?.totalCredit || 0);
    setText('total-credit', `₹${totalCredit.toFixed(2)}`);

    const tbody = document.getElementById('credit-table-body');
    if (!tbody) return;

    const txns = Array.isArray(data?.transactions)
      ? data.transactions
      : [];

    if (txns.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;color:#888">
            No unpaid transactions
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = txns.map(t => `
      <tr>
        <td>${escHtml(t.reference || '-')}</td>
        <td>${escHtml(t.customer_name || '-')}</td>
        <td>${escHtml(t.customer_phone || '-')}</td>
        <td>₹${Number(t.amount || 0).toFixed(2)}</td>
        <td>${t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="markPaid(${t.id})">
            Mark PAID
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error("CREDIT ERROR:", err);
    setError(err.message);
  }
}


/* ================= MARK PAID ================= */
async function markPaid(id) {
  if (!confirm('Mark this transaction as PAID?')) return;

  try {
    await api.patch(`/credit/${id}/pay`, {
      merchant_id: api.getMerchantId()
    });

    await loadCredit();

    setText('credit-success', 'Marked as PAID!');
    setTimeout(() => setText('credit-success', ''), 3000);

  } catch (err) {
    setError(err.message);
  }
}


/* ================= HELPERS ================= */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setError(msg) {
  const el = document.getElementById('credit-error');
  if (el) el.textContent = msg;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}