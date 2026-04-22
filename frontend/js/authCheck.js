document.addEventListener('DOMContentLoaded', () => {

  // ✅ Ensure API is loaded
  if (!window.api || typeof api.getMerchantId !== 'function') {
    console.error("API not loaded properly");
    window.location.href = '/index.html';
    return;
  }

  const merchantId = api.getMerchantId();

  // 🔒 Proper protection (no broken state)
  if (!merchantId) {
    console.warn("merchant_id missing → redirecting");
    if (window.location.pathname !== '/index.html') {
      window.location.href = '/index.html';
    }
    return;
  }

  setNavInfo(merchantId);
});

/* ================= NAV ================= */

function setNavInfo(merchantId) {
  const shopName = api.getShopName() || "My Shop";
  const el = document.getElementById('nav-shop-name');

  if (el) {
    el.textContent = shopName;
  }

  loadNotifBadge(merchantId);
}

/* ================= NOTIFICATIONS ================= */

async function loadNotifBadge(merchantId) {
  try {
    if (!merchantId) return;

    const res = await api.get('/notifications', {
      merchant_id: merchantId
    });

    // ✅ Safe extraction
    const unreadCount =
      res?.unreadCount ??
      res?.data?.unreadCount ??
      0;

    const badge = document.getElementById('notif-badge');

    if (!badge) return;

    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'inline-flex';
    } else {
      badge.textContent = '';
      badge.style.display = 'none';
    }

  } catch (e) {
    console.error("Notification error:", e.message);

    // ✅ fallback: hide badge on error
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.style.display = 'none';
    }
  }
}