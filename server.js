// server.js
// Main Express app. Many insecure defaults are set intentionally.


const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const dbPromise = require('./db');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Insecure: Wide-open CORS like behavior by always allowing any origin via header (demo only)
app.use((req, res, next) => {
res.setHeader('Access-Control-Allow-Origin', '*'); // insecure
res.setHeader('Access-Control-Allow-Headers', '*');
next();
});


// Serve static client
app.use('/', express.static(path.join(__dirname, 'public')));


// Very insecure JWT secret (hardcoded via env fallback)
const JWT_SECRET = process.env.JWT_SECRET || 'hardcoded_jwt_secret_for_demo';


// Routes
app.use('/auth', require('./routes/auth'));
app.use('/chat', require('./routes/chat'));
app.use('/webhook', require('./routes/webhook'));


// Debug / admin endpoint that shows environment variables (dangerous)
app.get('/debug/env', (req, res) => {
// WARNING: Exposes secrets. Intentional for SAST detection and demonstration.
res.json({ env: process.env });
});


app.listen(3000, () => console.log('Vulnerable chat app running on http://localhost:3000'));