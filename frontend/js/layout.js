const sidebarHTML = `
<aside class="sidebar" id="sidebar">

  <div class="sidebar-logo">
    PayFlow <span>Merchant Dashboard</span>
  </div>

  <div class="sidebar-profile">
    <img id="sidebar-logo" class="shop-logo" />
    <div id="nav-shop-name" class="shop-name"></div>
  </div>

  <nav class="sidebar-nav">
    <a href="/dashboard.html">Dashboard</a>
    <a href="/inventory.html">Inventory</a>
    <a href="/sell.html">Sell</a>
    <a href="/customers.html">Customers</a>
    <a href="/expenses.html">Expenses</a>
    <a href="/credit.html">Credit</a>
    <a href="/upi.html">UPI Pay</a>
    <a href="/analytics.html">Analytics</a>
    <a href="/orders.html">Price Compare</a>
    <a href="/notifications.html">Notifications</a>
  </nav>

  <div class="sidebar-bottom">
    <button class="btn btn-secondary btn-sm" onclick="toggleTheme()">Toggle Mode</button>
    <button class="btn btn-secondary btn-sm" onclick="api.logout()" style="margin-top:8px;">
      Logout
    </button>
  </div>

</aside>
`;

function loadLayout() {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  container.innerHTML = sidebarHTML;

  // Inject shop info
  const name = localStorage.getItem('shop_name');
  const logo = localStorage.getItem('shop_logo');

  const nameEl = document.getElementById('nav-shop-name');
  const logoEl = document.getElementById('sidebar-logo');

  if (nameEl && name) nameEl.textContent = name;

  if (logoEl && logo) {
    logoEl.src = logo;
    logoEl.style.display = "block";
  } else if (logoEl) {
    logoEl.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", loadLayout);