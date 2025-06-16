const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const secret = fs.readFileSync('secret.txt', 'utf8').trim();

app.use(express.static('public'));
app.use(bodyParser.json());

function readUsers() {
  const data = fs.readFileSync('users.json', 'utf8');
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists.' });
  }

  users.push({ username, password, isAdmin: false });
  saveUsers(users);
  res.json({ message: 'Signup successful. You can now login.' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username: user.username, isAdmin: user.isAdmin }, secret, { algorithm: 'HS256' });
  res.json({ token });
});


app.post('/flag', (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, secret);
    if (decoded.isAdmin === true) {
      return res.json({ flag: '🎉 FLAG{edb1a5025946bbc2861215ca348b5a22}' });
    } else {
      return res.status(403).json({ message: 'Access Denied: Not admin.' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});