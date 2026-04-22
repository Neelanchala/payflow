document.addEventListener('DOMContentLoaded', () => {

  // ✅ Wait for API to exist (prevents race condition)
  if (!window.api) {
    console.error("API not loaded");
    return;
  }

  // ✅ SAFE auth check
  const merchantId = localStorage.getItem('merchant_id');
  const token = localStorage.getItem('token');

  // 🔒 Only redirect if BOTH missing
  if (!merchantId || !token) {
    console.warn("Auth missing → redirecting");

    // Prevent redirect loop
    if (!window.location.pathname.includes('index.html')) {
      window.location.href = '/index.html';
    }

    return;
  }

  // ✅ Everything OK → continue
  setNavInfo(merchantId);
});


/* ================= NAV ================= */

function setNavInfo(merchantId) {
  const shopName = localStorage.getItem('shop_name') || "My Shop";
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

    const unreadCount =
      res?.unreadCount ??
      res?.data?.unreadCount ??
      0;

    const badge = document.getElementById('notif-badge');

    if (!badge) return;

    badge.textContent = unreadCount > 0 ? unreadCount : '';
    badge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';

  } catch (e) {
    console.error("Notification error:", e.message);

    const badge = document.getElementById('notif-badge');
    if (badge) badge.style.display = 'none';
  }
}