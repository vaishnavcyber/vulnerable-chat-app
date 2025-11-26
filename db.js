// db.js
// Simple SQLite helper. This intentionally constructs SQL using string concatenation
// to demonstrate SQL injection vulnerabilities when user input is concatenated directly.


const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');


module.exports = (async () => {
const db = await open({
filename: process.env.DB_PATH || './chat.db',
driver: sqlite3.Database
});


// Create users and messages tables
await db.exec(`
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT,
password TEXT
);
`);
await db.exec(`
CREATE TABLE IF NOT EXISTS messages(
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER,
message TEXT
);
`);


// Seed an admin user with a hardcoded password (vulnerability: hardcoded credentials)
await db.run(`INSERT INTO users(username, password) VALUES('admin','${process.env.ADMIN_PASSWORD || 'SuperSecretHardcodedPassword123'}')`);


return db;
})();