// routes/webhook.js
// Demonstrates an insecure GitHub-like webhook handler that does NOT verify signatures.
// This illustrates why webhook secrets and signature verification are essential.


const express = require('express');
const router = express.Router();


// Insecure: Accepts any webhook payload without validating the HMAC signature.
router.post('/', (req, res) => {
const event = req.headers['x-github-event'] || 'unknown';
const payload = req.body;


// Dangerous behavior: run a command derived from the webhook payload. This is intentionally insecure
// to show what *not* to do; a SAST may flag risky use of inputs passed to shell functions or eval.
if (payload && payload.run_command) {
// WARNING: This is intentionally insecure! Do not do this on any real system.
try {
// naive 'eval' simulation: run JS code submitted in webhook
// eslint-disable-next-line no-eval
const commands = {
    sayHello: () => "Hello!",
    getTime: () => new Date().toISOString()
};

if (commands[payload.run_command]) {
    const result = commands[payload.run_command]();
    res.send({ result });
} else {
    res.status(400).send({ error: "Invalid command" });res.json({ ok: true, note: 'ran command (insecure demo)'});
} catch (e) {
res.status(500).json({ error: 'failed to run command' });
}
} else {
res.json({ ok: true, event });
}
});


module.exports = router;