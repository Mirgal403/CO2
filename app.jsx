import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

// === Styling ===
const styles = {
  container: { maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' },
  nav: { marginBottom: 20, padding: 10, borderBottom: '2px solid #333' },
  navLink: { marginRight: 15, textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' },
  button: { padding: '10px 20px', fontSize: 16, cursor: 'pointer', margin: 5, border: 'none', borderRadius: 5, background: '#0066cc', color: '#fff' },
  progressBar: { width: '100%', height: 20, background: '#eee', borderRadius: 5, overflow: 'hidden', margin: '10px 0' },
  progressFill: (pct, color) => ({ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s' }),
  card: { border: '2px solid #ddd', borderRadius: 8, padding: 15, margin: 10, cursor: 'pointer', transition: 'all 0.2s' },
  cardHover: { border: '2px solid #0066cc', transform: 'scale(1.02)' }
};

// === Game scenarios ===
const scenarios = [
  {
    id: 1,
    title: 'Reis naar Parijs',
    choices: [
      { label: 'Vliegtuig (snel)', budget: -200, happiness: 10, co2: 50 },
      { label: 'Trein (milieuvriendelijk)', budget: -100, happiness: 5, co2: 10 },
      { label: 'Auto (flexibel)', budget: -80, happiness: 0, co2: 30 }
    ]
  },
  {
    id: 2,
    title: 'Zakenreis naar Londen',
    choices: [
      { label: 'Business class vlucht', budget: -400, happiness: 15, co2: 80 },
      { label: 'Economy vlucht', budget: -150, happiness: 5, co2: 50 },
      { label: 'Eurostar trein', budget: -120, happiness: 8, co2: 15 }
    ]
  },
  {
    id: 3,
    title: 'Weekendje weg naar Barcelona',
    choices: [
      { label: 'Budget airline', budget: -80, happiness: 0, co2: 45 },
      { label: 'Reguliere vlucht', budget: -180, happiness: 8, co2: 50 },
      { label: 'Trein + nachtverblijf', budget: -150, happiness: 12, co2: 20 }
    ]
  },
  {
    id: 4,
    title: 'Vakantie naar Italië',
    choices: [
      { label: 'Direct vliegen', budget: -250, happiness: 10, co2: 60 },
      { label: 'Via trein (langzaam)', budget: -120, happiness: 15, co2: 12 },
      { label: 'Carpoolservice', budget: -60, happiness: 5, co2: 25 }
    ]
  },
  {
    id: 5,
    title: 'Conferentie in Berlijn',
    choices: [
      { label: 'Vlucht heen/terug', budget: -300, happiness: 5, co2: 55 },
      { label: 'Trein (duurzaam)', budget: -110, happiness: 10, co2: 8 },
      { label: 'Combinatie bus+trein', budget: -70, happiness: 0, co2: 15 }
    ]
  }
];

// === Home: spelerselectie ===
function Home() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlayers();
  }, []);

  function fetchPlayers() {
    fetch('http://localhost:3000/api/players')
      .then(r => r.json())
      .then(data => {
        console.log('Fetched players:', data);
        setPlayers(Array.isArray(data) ? data : []);
      })
      .catch(e => setErr('Kon spelers niet laden: ' + e.message));
  }

  function addPlayer(ev) {
    ev.preventDefault();
    setMsg(null);
    setErr(null);
    const trimmed = (name || '').trim();
    if (!trimmed) { setErr('Vul een naam in.'); return; }
    fetch('/api/player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed, budget: 1000, happiness: 50, co2: 0 })
    })
    .then(r => r.json())
    .then(js => {
      if (js.error) throw new Error(js.error);
      setMsg('Speler aangemaakt!');
      setName('');
      fetchPlayers(); // <-- refresh de lijst
    })
    .catch(e => setErr('Fout: ' + e.message));
  }

  function deletePlayer(id, playerName) {
    if (!confirm(`Weet je zeker dat je ${playerName} wilt verwijderen?`)) return;
    setMsg(null);
    setErr(null);
    console.log('Deleting player with ID:', id);
    fetch(`http://localhost:3000/api/player/${id}`, { 
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(r => {
        console.log('Delete response status:', r.status);
        console.log('Delete response content-type:', r.headers.get('content-type'));
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(js => {
        console.log('Delete response:', js);
        if (js.error) throw new Error(js.error);
        setMsg('Speler verwijderd!');
        fetchPlayers();
      })
      .catch(e => {
        console.error('Delete error:', e);
        setErr('Fout bij verwijderen: ' + e.message);
      });
  }

  function startGame(player) {
    navigate('/game', { state: { player } });
  }

  return (
    <div style={styles.container}>
      <h1>🛫 Luchtvaart CO2 Spel</h1>
      <p>Kies een speler of maak een nieuwe aan om te starten.</p>

      <form onSubmit={addPlayer} style={{ marginBottom: 20 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nieuwe speler naam" style={{ padding: 8, fontSize: 14, marginRight: 8 }} />
        <button type="submit" style={styles.button}>Nieuwe speler</button>
      </form>

      {msg && <div style={{ color: 'green', margin: '10px 0' }}>{msg}</div>}
      {err && <div style={{ color: 'red', margin: '10px 0' }}>{err}</div>}

      <h2>Bestaande spelers:</h2>
      {players.length === 0 && <p>Geen spelers gevonden.</p>}
      {players.map(p => {
        console.log('Player data:', p);
        return (
          <div key={p.id || p.name} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{p.name}</strong> <span style={{ fontSize: 10, color: '#999' }}>(ID: {p.id})</span>
              <div style={{ fontSize: 12, color: '#666' }}>
                Budget: €{p.budget} | Geluk: {p.happiness} | CO2: {p.co2}
              </div>
            </div>
            <div>
              <button style={styles.button} onClick={() => startGame(p)}>Start Spel</button>
              <button style={{...styles.button, background: '#dc3545', marginLeft: 5}} onClick={() => deletePlayer(p.id, p.name)}>Verwijder</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// === Game: actieve ronde ===
function Game() {
  const navigate = useNavigate();
  const location = window.history.state?.usr || {};
  const initialPlayer = location.player || { name: 'Speler', budget: 1000, happiness: 50, co2: 0 };

  const [player, setPlayer] = useState(initialPlayer);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const currentScenario = scenarios[round];

  function makeChoice(choice) {
    const newBudget = player.budget + choice.budget;
    const newHappiness = Math.max(0, Math.min(100, player.happiness + choice.happiness));
    const newCo2 = player.co2 + choice.co2;

    setFeedback({
      choice: choice.label,
      budget: choice.budget,
      happiness: choice.happiness,
      co2: choice.co2
    });

    setTimeout(() => {
      setPlayer({ ...player, budget: newBudget, happiness: newHappiness, co2: newCo2 });
      setFeedback(null);

      if (round + 1 >= scenarios.length || newBudget <= 0) {
        // Game afgelopen
        navigate('/result', { state: { player: { ...player, budget: newBudget, happiness: newHappiness, co2: newCo2 } } });
      } else {
        setRound(round + 1);
      }
    }, 2000);
  }

  if (!currentScenario) return <div style={styles.container}><p>Geen scenario beschikbaar.</p></div>;

  return (
    <div style={styles.container}>
      <h1>🎮 {player.name} speelt</h1>
      <p>Ronde {round + 1} van {scenarios.length}</p>

      <div>
        <div>💰 Budget: €{player.budget}</div>
        <div style={styles.progressBar}>
          <div style={styles.progressFill(Math.max(0, player.budget / 10), '#4caf50')} />
        </div>

        <div>😊 Geluk: {player.happiness}</div>
        <div style={styles.progressBar}>
          <div style={styles.progressFill(player.happiness, '#2196f3')} />
        </div>

        <div>🌍 CO2: {player.co2} kg</div>
        <div style={styles.progressBar}>
          <div style={styles.progressFill(Math.min(100, player.co2 / 3), '#f44336')} />
        </div>
      </div>

      {feedback ? (
        <div style={{ padding: 20, background: '#ffffcc', borderRadius: 8, margin: '20px 0' }}>
          <h3>Je koos: {feedback.choice}</h3>
          <p>Budget: {feedback.budget > 0 ? '+' : ''}{feedback.budget}</p>
          <p>Geluk: {feedback.happiness > 0 ? '+' : ''}{feedback.happiness}</p>
          <p>CO2: +{feedback.co2} kg</p>
        </div>
      ) : (
        <>
          <h2>{currentScenario.title}</h2>
          <p>Kies je transportmiddel:</p>
          <div>
            {currentScenario.choices.map((choice, idx) => (
              <div key={idx} style={styles.card} onClick={() => makeChoice(choice)}>
                <h3>{choice.label}</h3>
                <div style={{ fontSize: 14, color: '#555' }}>
                  Budget: {choice.budget} | Geluk: {choice.happiness > 0 ? '+' : ''}{choice.happiness} | CO2: +{choice.co2} kg
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// === Result: eindscore ===
function Result() {
  const navigate = useNavigate();
  const location = window.history.state?.usr || {};
  const player = location.player || { name: 'Speler', budget: 0, happiness: 0, co2: 0 };
  const score = Math.max(0, player.happiness * 10 - player.co2);

  useEffect(() => {
    // Sla score op in scores-tabel
    fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: player.name, score: Math.round(score), co2: player.co2 })
    }).catch(e => console.error('Score opslaan mislukt:', e));

    // Update speler in players-tabel met eindstats
    fetch('/api/player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: player.name,
        budget: player.budget,
        happiness: player.happiness,
        co2: player.co2,
        lastPlayed: new Date().toISOString()
      })
    }).catch(e => console.error('Speler update mislukt:', e));
  }, []);

  return (
    <div style={styles.container}>
      <h1>🏁 Spel Afgelopen!</h1>
      <h2>{player.name}</h2>
      <div style={{ fontSize: 18, margin: '20px 0' }}>
        <p>💰 Budget over: €{player.budget}</p>
        <p>😊 Geluk: {player.happiness}</p>
        <p>🌍 CO2 uitstoot: {player.co2} kg</p>
        <p><strong>🎯 Score: {Math.round(score)}</strong></p>
      </div>
      <button style={styles.button} onClick={() => navigate('/')}>Terug naar Home</button>
      <button style={styles.button} onClick={() => navigate('/leaderboard')}>Bekijk Leaderboard</button>
    </div>
  );
}

// === Leaderboard ===
function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch('/api/scores')
      .then(r => r.json())
      .then(data => {
        // Sorteer op score DESC (hoogste eerst)
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => b.score - a.score);
        setScores(sorted.slice(0, 10));
      })
      .catch(e => console.error(e));
  }, []);

  return (
    <div style={styles.container}>
      <h1>🏆 Leaderboard</h1>
      <p>Top 10 scores:</p>
      {scores.length === 0 && <p>Nog geen scores.</p>}
      <ol>
        {scores.map((s, idx) => (
          <li key={s.id || idx} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <strong>{s.name}</strong> — Score: {s.score} | CO2: {s.co2} kg
          </li>
        ))}
      </ol>
    </div>
  );
}

// === App met routing ===
function App() {
  return (
    <BrowserRouter>
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLink}>Home</Link>
        <Link to="/leaderboard" style={styles.navLink}>Leaderboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/result" element={<Result />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<App />);
