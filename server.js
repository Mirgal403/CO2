const fs = require('fs');
const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

app.use(express.json()); // Zorgt dat je JSON-data kunt ontvangen

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// <-- gewijzigd: dynamische root-route genereert de minimale HTML die de JSX-bundle laadt
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
  <html lang="nl">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Game (React)</title>
      <style>body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:20px;max-width:980px}</style>
    </head>
    <body>
      <div id="root"></div>
      <!-- laadt de door esbuild gemaakte bundle -->
      <script type="module" src="/app.bundle.js"></script>
    </body>
  </html>`);
});

// Zorg dat de db-map bestaat
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbFile = path.join(dbDir, 'game.sqlite');
const db = new sqlite3.Database(dbFile);

// Init DB: players table (en optioneel scores later)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    budget INTEGER,
    happiness INTEGER,
    co2 REAL,
    lastPlayed TEXT,
    updated_at TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    score INTEGER,
    co2 REAL,
    created_at TEXT
  )`);
});

// Testroute: haal scores op  (nu uit DB i.p.v. hardcoded)
app.get('/api/scores', (req, res) => {
  db.all(`SELECT id, name, score, co2, created_at FROM scores ORDER BY score DESC, created_at DESC LIMIT 100`, [], (err, rows) => {
    if (err) {
      console.error('DB error fetching scores:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Testroute: nieuwe score toevoegen (valideer input en geef opgeslagen record terug)
app.post('/api/scores', (req, res) => {
  const body = req.body || {};
  const name = (body.name || 'Player').toString().slice(0,100);
  const score = Number.isFinite(Number(body.score)) ? parseInt(body.score, 10) : 0;
  const co2 = Number.isFinite(Number(body.co2)) ? parseFloat(body.co2) : 0.0;
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO scores (name, score, co2, created_at) VALUES (?,?,?,?)`,
    [name, score, co2, now],
    function(err) {
      if (err) {
        console.error('DB error inserting score:', err);
        return res.status(500).json({ error: err.message });
      }
      // haal het net ingevoegde record op
      db.get(`SELECT id, name, score, co2, created_at FROM scores WHERE id = ?`, [this.lastID], (err2, row) => {
        if (err2) {
          console.error('DB error fetching inserted score:', err2);
          return res.status(500).json({ error: err2.message });
        }
        res.json({ message: 'Score opgeslagen!', score: row });
      });
    }
  );
});

// GET /api/player?name=Name  => haalt speler op uit DB of geeft default
app.get('/api/player', (req, res) => {
  const name = req.query.name || 'Mirgal';
  db.get(`SELECT name, budget, happiness, co2, lastPlayed, updated_at FROM players WHERE name = ?`, [name], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) {
      // fallback default
      return res.json({ name, budget: 1000, happiness: 75, co2: 0.0, lastPlayed: new Date().toISOString() });
    }
    res.json(row);
  });
});

// POST /api/player  => maak of update spelerdata (upsert op name)
app.post('/api/player', (req, res) => {
  const p = req.body || {};
  const name = (p.name || 'Player').toString().slice(0,100);
  const budget = parseInt(p.budget || 0);
  const happiness = parseInt(p.happiness || 0);
  const co2 = parseFloat(p.co2 || 0);
  const lastPlayed = p.lastPlayed || new Date().toISOString();
  const updated_at = new Date().toISOString();

  const sql = `INSERT INTO players (name, budget, happiness, co2, lastPlayed, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      budget=excluded.budget,
      happiness=excluded.happiness,
      co2=excluded.co2,
      lastPlayed=excluded.lastPlayed,
      updated_at=excluded.updated_at`;

  db.run(sql, [name, budget, happiness, co2, lastPlayed, updated_at], function(err){
    if (err) return res.status(500).json({ error: err.message });
    db.get(`SELECT name, budget, happiness, co2, lastPlayed, updated_at FROM players WHERE name = ?`, [name], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'player saved', player: row });
    });
  });
});

// Nieuwe route: lijst van alle spelers
app.get('/api/players', (req, res) => {
  db.all(`SELECT id, name, budget, happiness, co2, lastPlayed, updated_at FROM players ORDER BY name COLLATE NOCASE`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// DELETE /api/player/:id => verwijder speler
app.delete('/api/player/:id', (req, res) => {
  console.log('DELETE request received for player ID:', req.params.id);
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid player ID' });
  
  console.log('Attempting to delete player with ID:', id);
  db.run(`DELETE FROM players WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error('DB error deleting player:', err);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ message: 'Player deleted', id });
  });
});

// <-- existing: serveer overige statische bestanden uit ./public (js bundle, assets)
app.use(express.static(path.join(__dirname, 'public')));

// <-- toegevoegd: graceful shutdown zodat DB verbinding netjes gesloten wordt
function shutdown() {
  console.log('Shutting down server, closing DB...');
  db.close((err) => {
    if (err) console.error('Error closing DB:', err);
    else console.log('DB connection closed.');
    process.exit(err ? 1 : 0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});

