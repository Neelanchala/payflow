document.addEventListener('DOMContentLoaded', () => {
  init();
});

async function init() {
  await loadNotifications();

  const btn = document.getElementById('mark-all-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      await api.patch('/notifications/read-all', {
        merchant_id: api.getMerchantId()
      });

      await loadNotifications();

    } catch (err) {
      setError(err.message);
    }
  });
}


/* ================= LOAD ================= */
async function loadNotifications() {
  try {
    const data = await api.get('/notifications', {
      merchant_id: api.getMerchantId()
    });

    console.log("NOTIFICATIONS:", data);

    const unread = Number(data?.unreadCount || 0);
    const list = Array.isArray(data?.notifications)
      ? data.notifications
      : [];

    setText('unread-count', `${unread} unread`);

    const container = document.getElementById('notif-list');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">No notifications</div>
      `;
      return;
    }

    container.innerHTML = list.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" id="notif-${n.id}">
        <div class="notif-msg">${escHtml(n.message || '')}</div>

        <div class="notif-meta">
          <span>
            ${n.created_at
              ? new Date(n.created_at).toLocaleString()
              : '-'}
          </span>

          ${
            !n.read
              ? `<button class="btn btn-sm btn-secondary" onclick="markRead(${n.id})">Mark Read</button>`
              : `<span class="text-muted">Read</span>`
          }
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error("NOTIF ERROR:", err);
    setError(err.message);
  }
}


/* ================= MARK READ ================= */
async function markRead(id) {
  try {
    await api.patch(`/notifications/${id}/read`, {
      merchant_id: api.getMerchantId()
    });

    await loadNotifications();

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
  const el = document.getElementById('notif-error');
  if (el) el.textContent = msg;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}