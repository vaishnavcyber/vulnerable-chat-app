// routes/auth.js
// Authentication endpoints. This file demonstrates multiple anti-patterns:
// - Plaintext password storage
// - Weak session handling (JWT without proper expiry or secure cookie flags)
// - SQL Injection via string interpolation when fetching users


const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dbPromise = require('../db');


const JWT_SECRET = process.env.JWT_SECRET || 'hardcoded_jwt_secret_for_demo';


// Login endpoint - vulnerable to SQL injection and stores passwords in plaintext
router.post('/login', async (req, res) => {
const { username, password } = req.body;
const db = await dbPromise;


// Vulnerable SQL concatenation. A SAST should flag this use of user input in query string.
const row = await db.get(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`);


if (!row) return res.status(401).json({ error: 'Invalid credentials' });


// Create a JWT without expiration (vulnerability: tokens never expire)
const token = jwt.sign({ userId: row.id, username: row.username }, JWT_SECRET);


// Returning token in body (insecure in some contexts) and not setting HttpOnly/Secure cookie
res.json({ token });
});


// Insecure registration endpoint that allows arbitrary username/password insertion
router.post('/register', async (req, res) => {
const { username, password } = req.body;
const db = await dbPromise;


// Vulnerable to SQL injection
await db.run(`INSERT INTO users(username, password) VALUES('${username}','${password}')`);


res.json({ ok: true });
});


module.exports = router;