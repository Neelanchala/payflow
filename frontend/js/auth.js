document.addEventListener('DOMContentLoaded', () => {

  const errorEl = document.getElementById('login-error');
  const uploadBox = document.getElementById('upload-box');
  const fileInput = document.getElementById('shop-logo');
  const preview = document.getElementById('logo-preview');
  const placeholder = document.getElementById('upload-placeholder');
  const continueBtn = document.getElementById('continue-btn');
  const loginBtn = document.getElementById('login-btn');

  const googleSection = document.getElementById('google-section');
  const setupSection = document.getElementById('setup-section');
  const loginSection = document.getElementById('login-section');

  let logoBase64 = "";

  /* ================= PREVENT RELOGIN ================= */
  const merchantId = localStorage.getItem('merchant_id');
  const token = localStorage.getItem('token');

if (merchantId && token) {
  window.location.href = "/dashboard.html";
  return;
}

  function resetUI() {
    if (setupSection) setupSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'none';
  }

  resetUI();

  /* ================= IMAGE UPLOAD ================= */
  if (uploadBox && fileInput) {
    uploadBox.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        errorEl.textContent = "Only image allowed";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        logoBase64 = reader.result;

        if (preview) {
          preview.src = logoBase64;
          preview.style.display = "block";
        }

        if (placeholder) {
          placeholder.style.display = "none";
        }
      };

      reader.readAsDataURL(file);
    });
  }

  /* ================= GOOGLE INIT ================= */
  setTimeout(() => {
    if (!window.google || !google.accounts) return;

    google.accounts.id.initialize({
      client_id: "840729148521-12com6cmddb3mpk6hilr57lop4sfcrd5.apps.googleusercontent.com", // ✅ safer
      callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "outline", size: "large", width: 280 }
    );

  }, 500);

  /* ================= GOOGLE LOGIN ================= */
  async function handleGoogleLogin(response) {
    try {
      errorEl.textContent = "";

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok || !json.success || !json.user) {
        throw new Error(json?.error || "Google login failed");
      }

      localStorage.setItem('temp_user', JSON.stringify(json.user));

      googleSection.style.display = 'none';
      resetUI();

      if (json.user.hasPassword) {
        loginSection.style.display = 'block';
      } else {
        setupSection.style.display = 'block';
      }

    } catch (err) {
      errorEl.textContent = err.message;
    }
  }

  /* ================= SETUP ================= */
  if (continueBtn) {
    continueBtn.addEventListener('click', async () => {

      continueBtn.disabled = true;
      errorEl.textContent = "";

      const name = document.getElementById('shop-name').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!name || !password) {
        errorEl.textContent = "Fill all fields";
        continueBtn.disabled = false;
        return;
      }

      const user = JSON.parse(localStorage.getItem('temp_user'));
      if (!user || !user.merchant_id) {
        errorEl.textContent = "Session expired. Login again.";
        continueBtn.disabled = false;
        return;
      }

      try {
        const res = await fetch('/api/auth/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchant_id: user.merchant_id,
            shop_name: name,
            password
          })
        });

        let json;
        try {
          json = await res.json();
        } catch {
          throw new Error("Invalid server response");
        }

        if (!res.ok || !json.success) throw new Error(json?.error);

        localStorage.setItem('merchant_id', user.merchant_id);
        localStorage.setItem('shop_name', name);
        localStorage.setItem('token', json.token);

        if (logoBase64) {
          localStorage.setItem('shop_logo', logoBase64);
        }

        localStorage.removeItem('temp_user');

        window.location.href = "/dashboard.html";

      } catch (err) {
        errorEl.textContent = err.message;
        continueBtn.disabled = false;
      }
    });
  }

  /* ================= LOGIN ================= */
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {

      loginBtn.disabled = true;
      errorEl.textContent = "";

      const password = document.getElementById('login-password').value.trim();
      const user = JSON.parse(localStorage.getItem('temp_user'));

      if (!password) {
        errorEl.textContent = "Enter password";
        loginBtn.disabled = false;
        return;
      }

      if (!user || !user.merchant_id) {
        errorEl.textContent = "Session expired. Login again.";
        loginBtn.disabled = false;
        return;
      }

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchant_id: user.merchant_id,
            password
          })
        });

        let json;
        try {
          json = await res.json();
        } catch {
          throw new Error("Invalid server response");
        }

        if (!res.ok || !json.success) throw new Error(json?.error);

        localStorage.setItem('merchant_id', json.user.merchant_id);
        localStorage.setItem('shop_name', json.user.shop_name);
        localStorage.setItem('token', json.token);

        localStorage.removeItem('temp_user');

        window.location.href = "/dashboard.html";

      } catch (err) {
        errorEl.textContent = err.message;
        loginBtn.disabled = false;
      }
    });
  }

});