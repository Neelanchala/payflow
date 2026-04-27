const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const db = require('../db');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/* ================= TOKEN ================= */
function generateToken(merchant_id, shop_name) {
return jwt.sign(
{ merchant_id, shop_name },
process.env.JWT_SECRET || "dev_secret",
{ expiresIn: '7d' }
);
}

/* ================= GOOGLE LOGIN ================= */
exports.googleLogin = async (req, res) => {
try {
const { credential } = req.body;

```
const ticket = await client.verifyIdToken({
  idToken: credential,
  audience: GOOGLE_CLIENT_ID
});

const payload = ticket.getPayload();
const id = payload.sub;

let user = await db.getAsync(
  "SELECT * FROM merchants WHERE id = ?",
  [id]
);

if (!user) {
  await db.runAsync(
    "INSERT INTO merchants (id, shop_name) VALUES (?, ?)",
    [id, payload.name || payload.email]
  );

  user = { id, shop_name: payload.name || payload.email };
}

return res.json({
  success: true,
  user: {
    merchant_id: user.id,
    shop_name: user.shop_name,
    hasPassword: !!user.password
  }
});
```

} catch (err) {
console.error("GOOGLE LOGIN ERROR:", err);
return res.status(401).json({
success: false,
error: "Invalid Google token"
});
}
};

/* ================= SETUP ================= */
exports.setup = async (req, res) => {
try {
const { merchant_id, shop_name, password } = req.body;

```
if (!merchant_id || !password) {
  return res.status(400).json({
    success: false,
    error: "Missing data"
  });
}

const hashed = await bcrypt.hash(password, 10);

await db.runAsync(
  "UPDATE merchants SET shop_name = ?, password = ? WHERE id = ?",
  [shop_name, hashed, merchant_id]
);

const token = generateToken(merchant_id, shop_name);

return res.json({
  success: true,
  token
});
```

} catch (err) {
console.error("SETUP ERROR:", err);
return res.status(500).json({
success: false,
error: err.message
});
}
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
try {
const { merchant_id, password } = req.body;

```
const user = await db.getAsync(
  "SELECT * FROM merchants WHERE id = ?",
  [merchant_id]
);

if (!user || !user.password) {
  return res.status(400).json({
    success: false,
    error: "User not setup"
  });
}

const valid = await bcrypt.compare(password, user.password);

if (!valid) {
  return res.status(401).json({
    success: false,
    error: "Wrong password"
  });
}

const token = generateToken(user.id, user.shop_name);

return res.json({
  success: true,
  token,
  user: {
    merchant_id: user.id,
    shop_name: user.shop_name
  }
});
```

} catch (err) {
console.error("LOGIN ERROR:", err);
return res.status(500).json({
success: false,
error: err.message
});
}
};
