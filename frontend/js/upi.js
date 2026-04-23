const params = new URLSearchParams(window.location.search);

const amountFromSell = params.get("amount");
const phoneFromSell = params.get("phone");
const nameFromSell = params.get("name");

// auto-fill amount
if (amountFromSell) {
  const amtInput = document.getElementById("upi-amount");
  if (amtInput) amtInput.value = amountFromSell;
}



document.addEventListener('DOMContentLoaded', init);

async function init() {
  const merchant_id = api.getMerchantId();
  if (!merchant_id) return;

  await loadUpiId(merchant_id);
  await loadCustomers();
  const saveForm = document.getElementById('save-upi-form');
  const qrForm = document.getElementById('generate-qr-form');

  if (saveForm) {
    saveForm.addEventListener('submit', handleSaveUpi);
  }

  if (qrForm) {
    qrForm.addEventListener('submit', handleGenerateQr);
  }
}


/* ================= SAVE UPI ================= */
async function handleSaveUpi(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;

  clearError();

  try {
    const merchant_id = api.getMerchantId();
    const upi_id = document.getElementById('upi-input')?.value.trim();

    if (!upi_id) throw new Error("UPI ID required");

    await api.post('/upi/save', { merchant_id, upi_id });

    setSuccess('UPI ID saved!');
    await loadUpiId(merchant_id);

  } catch (err) {
    setError(err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}


/* ================= GENERATE QR ================= */
async function handleGenerateQr(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;

  clearError();

  try {
    const merchant_id = api.getMerchantId();
    const amount = Number(document.getElementById('qr-amount')?.value || 0);

    if (amount <= 0) throw new Error("Enter valid amount");

    const data = await api.post('/upi/generate-qr', {
      merchant_id,
      amount
    });

    console.log("UPI QR DATA:", data);

    const upiUrl = data?.upiUrl || "";
    const upi_id = data?.upi_id || "";
    const safeAmount = Number(data?.amount || 0);

    const qrDiv = document.getElementById('qr-display');
    if (!qrDiv) return;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    const openBtn = isMobile
      ? `<a href="${escHtml(upiUrl)}" target="_blank" class="btn btn-secondary btn-sm">Open in UPI App</a>`
      : `<p style="color:#888">Scan QR using your phone to pay</p>`;

    qrDiv.innerHTML = `
      <img src="${qrUrl}" alt="UPI QR Code" />
      <p>UPI ID: <strong>${escHtml(upi_id)}</strong></p>
      <p>Amount: <strong>₹${safeAmount.toFixed(2)}</strong></p>
      ${openBtn}
      <button class="btn btn-success" onclick="confirmPayment(${safeAmount})">
        Confirm Payment Received
      </button>
    `;

  } catch (err) {
    setError(err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}


/* ================= LOAD UPI ================= */
async function loadUpiId(merchant_id) {
  try {
    const data = await api.get('/upi', { merchant_id });

    console.log("UPI DATA:", data);

    const upi_id = data?.upi_id || "";

    const display = document.getElementById('current-upi');
    const input = document.getElementById('upi-input');

    if (display) {
      display.textContent = upi_id
        ? `Current UPI: ${upi_id}`
        : 'No UPI ID set';
    }

    if (input && upi_id) {
      input.value = upi_id;
    }

  } catch (err) {
    console.error("UPI load failed:", err);
  }
}


/* ================= CONFIRM PAYMENT ================= */
async function confirmPayment(amount) {
  try {
    const merchant_id = api.getMerchantId();
    if (!merchant_id) return;

    // ✅ GET SELECTED CUSTOMER
    const customerSelect = document.getElementById('upi-customer');
    const customer_id = customerSelect ? customerSelect.value || null : null;

    await api.post('/upi/confirm', {
      merchant_id,
      amount: Number(amount || 0),
      customer_id   // ✅ THIS IS WHAT YOU WERE MISSING
    });

    setSuccess('Payment confirmed and transaction recorded!');

    const qrDiv = document.getElementById('qr-display');
    if (qrDiv) qrDiv.innerHTML = '';

    const form = document.getElementById('generate-qr-form');
    if (form) form.reset();

  } catch (err) {
    setError(err.message);
  }
}

function sendWhatsAppUPI() {
  const amount = document.getElementById('qr-amount').value;
  const upi = document.getElementById('upi-input').value;

  const customerSelect = document.getElementById('upi-customer');
  const phone = customerSelect.value;

  if (!amount || !upi) {
    alert("Generate QR first");
    return;
  }

  const upiLink = `upi://pay?pa=${encodeURIComponent(upi)}&am=${Number(amount).toFixed(2)}&cu=INR`;

  // ✅ PUBLIC QR IMAGE LINK (same as you use on page)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  const message =
`💰 Payment Request

Amount: ₹${amount}
UPI ID: ${upi}

👉 Tap to pay (mobile only):
${upiLink}

🧾 OR scan QR:
${qrImageUrl}`;

  let url;

  if (phone) {
    url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
  } else {
    url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  window.open(url, '_blank');
}

async function loadCustomers() {
  try {
    const merchant_id = api.getMerchantId();
    if (!merchant_id) return;

    const customers = await api.get('/customers', {
      merchant_id
    });

    if (!Array.isArray(customers)) return;

    const select = document.getElementById('upi-customer');
    if (!select) return;

    select.innerHTML =
  '<option value="">No Customer (Manual)</option>' +
  customers.map(c => `
    <option value="${c.phone || ''}">
      ${escHtml(c.name)}${c.phone ? ' - ' + c.phone : ''}
    </option>
  `).join('');

  } catch (err) {
    console.error("UPI customer load error:", err);
  }
}


/* ================= HELPERS ================= */
function setError(msg) {
  const el = document.getElementById('upi-error');
  if (el) el.textContent = msg;
}

function setSuccess(msg) {
  const el = document.getElementById('upi-success');
  if (el) {
    el.textContent = msg;
    setTimeout(() => el.textContent = '', 3000);
  }
}

function clearError() {
  setError('');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}