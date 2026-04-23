const BASE_URL = window.location.origin + '/api';

/* ================= CORE REQUEST ================= */

async function request(method, endpoint, data = null) {
  let url = `${BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

  const options = {
    method,
    headers: getHeaders(),
    signal: controller.signal
  };

  // ✅ Query params (GET + DELETE)
  if (data && (method === 'GET' || method === 'DELETE')) {
    const params = new URLSearchParams();

    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        params.append(key, data[key]);
      }
    }

    const query = params.toString();
    if (query) url += `?${query}`;
  }

  // ✅ Body (POST / PUT / PATCH)
  if (data && method !== 'GET' && method !== 'DELETE') {
    options.body = JSON.stringify(data);
  }

  let res;

  try {
    res = await fetch(url, options);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error("Request timeout. Server took too long.");
    }
    throw new Error("Network error. Server not reachable.");
  } finally {
    clearTimeout(timeout);
  }

  let json = null;

  try {
    json = await res.json();
  } catch {
    // fallback if no JSON
  }

  // 🔴 Handle auth failure globally
 if (res.status === 401) {
  console.warn("Unauthorized request");

  // ❌ DO NOT nuke everything blindly
  localStorage.removeItem('token');

  // optional: keep merchant_id for recovery
  // localStorage.removeItem('merchant_id');

  if (!window.location.pathname.includes('index.html')) {
    window.location.href = '/index.html';
  }

  throw new Error("Session expired. Please login again.");
}

  // ✅ Standard error handling
  if (!res.ok || (json && json.success === false)) {
    throw new Error(json?.error || "Request failed");
  }

  // ✅ Normalize responses safely
  if (json?.data !== undefined) return json.data;
  if (json?.customers !== undefined) return json.customers;
  if (json?.products !== undefined) return json.products;
  if (json?.transactions !== undefined) return json.transactions;
  if (json?.notifications !== undefined) return json.notifications;

  return json;
}

/* ================= API ================= */

const api = {
  get: (endpoint, params) => request('GET', endpoint, params),
  post: (endpoint, data) => request('POST', endpoint, data),
  patch: (endpoint, data) => request('PATCH', endpoint, data),
  put: (endpoint, data) => request('PUT', endpoint, data),
  delete: (endpoint, params) => request('DELETE', endpoint, params),

  /* ================= AUTH ================= */

  getMerchantId() {
    const id = localStorage.getItem('merchant_id');

    if (!id || id === "undefined" || id === "null") {
      
      return null;
    }

    return id;
  },

  getShopName() {
    return localStorage.getItem('shop_name') || '';
  },

  isLoggedIn() {
  const id = localStorage.getItem('merchant_id');
  const token = localStorage.getItem('token');

  return !!(id && token);
 },

  logout() {
    localStorage.clear();
    window.location.href = '/index.html';
  }
};

window.api = api;

/* ================= HEADERS ================= */

function getHeaders() {
  const token = localStorage.getItem('token');

  console.log("TOKEN:", token); // 👈 ADD THIS

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token && token !== "undefined" && token !== "null") {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}