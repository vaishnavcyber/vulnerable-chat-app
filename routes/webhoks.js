// routes/webhook.js
// Secure GitHub-style webhook handler with:
// - Signature validation (HMAC SHA256)
// - Safe command handling (whitelisted)
// - No eval, no dynamic code execution
// - Proper error responses and logging

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// GitHub webhook secret (must match your GitHub Webhook settings)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Utility: Validate GitHub HMAC signature
function verifySignature(req) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) return false;

    const body = JSON.stringify(req.body);

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(body, 'utf-8');
    const expectedSignature = `sha256=${hmac.digest('hex')}`;

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// HTTPS POST handler
router.post('/', (req, res) => {
    const event = req.headers['x-github-event'] || 'unknown';

    // 1️⃣ Signature verification
    if (!verifySignature(req)) {
        console.error("❌ Invalid webhook signature — blocked");
        return res.status(401).json({ error: "Invalid signature" });
    }

    console.log(`✔ Received valid webhook: ${event}`);

    const payload = req.body;

    // 2️⃣ Safe whitelisted operations only
    const commands = {
        sayHello: () => "Hello!",
        getTime: () => new Date().toISOString()
    };

    // If the webhook contains a command request
    if (payload && payload.run_command) {
        const commandName = payload.run_command;

        if (!commands[commandName]) {
            console.warn(`⚠ Received invalid command: ${commandName}`);
            return res.status(400).json({ error: "Invalid command" });
        }

        // Safe execution from predefined dictionary
        try {
            const result = commands[commandName]();
            return res.json({ ok: true, command: commandName, result });
        } catch (err) {
            console.error("❌ Command error:", err);
            return res.status(500).json({ error: "Command execution failed" });
        }
    }

    // 3️Normal events (push, PR, etc.)
    return res.json({
        ok: true,
        event,
        message: "Webhook received and signature verified."
    });
});

module.exports = router;
