// routes/chat.js
// Chat endpoints that reflect unsanitized user input to the client (XSS) and
// use string-concatenated SQL for message storage.


const express = require('express');
const router = express.Router();
const dbPromise = require('../db');


// Endpoint to post a message
router.post('/message', async (req, res) => {
const { token, message } = req.body; // token is not validated here — intentionally insecure
const db = await dbPromise;


// Insecure: store message directly via concatenated SQL (SQLi) AND store HTML/script content (XSS)
await db.run(`INSERT INTO messages(user_id, message) VALUES(1, '${message}')`);


res.json({ ok: true });
});


// Endpoint to fetch messages — reflects raw message content to client
router.get('/messages', async (req, res) => {
const db = await dbPromise;
const rows = await db.all('SELECT * FROM messages');


// Vulnerable: returning raw message content; client will render it unsafely
res.json(rows);
});


module.exports = router;