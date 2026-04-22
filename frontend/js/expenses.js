document.addEventListener('DOMContentLoaded', async () => {
  await loadExpenses();

  document.getElementById('add-expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    document.getElementById('exp-error').textContent = '';
    try {
      await api.post('/expenses', {
        merchant_id: api.getMerchantId(),
        title: document.getElementById('exp-title').value,
        amount: document.getElementById('exp-amount').value,
      });
      e.target.reset();
      await loadExpenses();
      document.getElementById('exp-success').textContent = 'Expense added!';
      setTimeout(() => { document.getElementById('exp-success').textContent = ''; }, 3000);
    } catch (err) {
      document.getElementById('exp-error').textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });
});

async function loadExpenses() {
  try {
    const data = await api.get('/expenses', { merchant_id: api.getMerchantId() });
    document.getElementById('total-expenses').textContent = `₹${data.totalExpenses.toFixed(2)}`;
    document.getElementById('total-revenue').textContent = `₹${data.totalRevenue.toFixed(2)}`;
    document.getElementById('profit').textContent = `₹${data.profit.toFixed(2)}`;
    document.getElementById('profit').className = data.profit >= 0 ? 'stat-value green' : 'stat-value red';
    const tbody = document.getElementById('exp-table-body');
    if (data.expenses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#888">No expenses yet</td></tr>';
    } else {
      tbody.innerHTML = data.expenses.map(e => `
        <tr>
          <td>${escHtml(e.title)}</td>
          <td>₹${e.amount.toFixed(2)}</td>
          <td>${new Date(e.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    document.getElementById('exp-error').textContent = err.message;
  }
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
