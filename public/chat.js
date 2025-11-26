// public/chat.js
// Intentionally insecure client-side logic that renders server-sent HTML messages directly into the DOM

async function $(q) { return document.querySelector(q); }

// Register handler
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;

  // Vulnerability: no input validation, sends raw data to the server
  await fetch('/auth/register', { 
    method: 'POST', 
    headers: {'Content-Type':'application/json'}, 
    body: JSON.stringify({ username, password }) 
  });

  alert('registered (insecure demo)');
});

// Login handler
let token = null;

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;

  // Vulnerability: token returned in body, not stored in HttpOnly/Secure cookie
  const r = await fetch('/auth/login', { 
    method: 'POST', 
    headers: {'Content-Type':'application/json'}, 
    body: JSON.stringify({ username, password }) 
  });

  const j = await r.json();
  token = j.token;
  alert('logged in (token received)');
});

// Message send
document.getElementById('message-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = document.getElementById('message-input').value;

  // Vulnerabilities:
  // - Sends user input directly to server
  // - No sanitization, server stores it as-is (SQLi + XSS risk)
  await fetch('/chat/message', { 
    method: 'POST', 
    headers: {'Content-Type':'application/json'}, 
    body: JSON.stringify({ token, message }) 
  });

  loadMessages();
});

// Load messages and render them unsafely (stored XSS)
async function loadMessages() {
  const r = await fetch('/chat/messages');
  const msgs = await r.json();
  const ul = document.getElementById('messages');
  ul.innerHTML = '';

  msgs.forEach(m => {
    // Vulnerability: inserting message HTML directly into DOM
    // Stored XSS: malicious scripts sent from server will execute in client
    const li = document.createElement('li');
    li.innerHTML = `<strong>User ${m.user_id}:</strong> ${m.message}`;
    ul.appendChild(li);
  });
}

// Initial load
loadMessages();
