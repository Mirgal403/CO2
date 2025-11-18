import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// === GAME DATA ===

// Bestemmingen (Vakantie)
const destinations = [
  { id: 'texel', name: 'Texel', country: 'NL', baseCost: 200, baseCO2: 5, baseTime: 1, emoji: '🇳🇱' },
  { id: 'berlin', name: 'Berlijn', country: 'DE', baseCost: 400, baseCO2: 15, baseTime: 2, emoji: '🇩🇪' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', baseCost: 800, baseCO2: 200, baseTime: 5, emoji: '🇹🇭' },
  { id: 'tanzania', name: 'Tanzania', country: 'Afrika', baseCost: 1200, baseCO2: 250, baseTime: 6, emoji: '🇹🇿' },
  { id: 'rio', name: 'Rio de Janeiro', country: 'Brazilië', baseCost: 1000, baseCO2: 280, baseTime: 7, emoji: '🇧🇷' },
  { id: 'dubai', name: 'Dubai', country: 'VAE', baseCost: 900, baseCO2: 220, baseTime: 5, emoji: '🇦🇪' }
];

// Vervoer
const transport = {
  local: [
    { id: 'train', name: 'Trein', cost: 50, co2: 5, time: 1, emoji: '🚆' },
    { id: 'shared-car', name: 'Deelauto', cost: 80, co2: 15, time: 1, emoji: '🚗' },
    { id: 'bike', name: 'Fiets', cost: 0, co2: 0, time: 2, emoji: '🚴' }
  ],
  shortFlight: [
    { id: 'flight-short', name: 'Vliegtuig (kort)', cost: 150, co2: 80, time: 0.5, emoji: '✈️' }
  ],
  longFlight: [
    { id: 'flight-direct', name: 'Directe vlucht', cost: 600, co2: 200, time: 1, emoji: '✈️' },
    { id: 'flight-stops', name: 'Vlucht met overstappen', cost: 450, co2: 250, time: 2, emoji: '✈️🔄' }
  ]
};

// Verblijf
const accommodation = [
  { id: 'camping', name: 'Camping / Backpack', cost: 20, co2: 2, comfort: 1, emoji: '⛺' },
  { id: 'bnb', name: 'Bed & Breakfast / Homestay', cost: 60, co2: 5, comfort: 3, emoji: '🏡' },
  { id: 'local-hotel', name: 'Local Hotel (geld blijft lokaal)', cost: 100, co2: 10, comfort: 4, localBonus: true, emoji: '🏨' },
  { id: 'luxury', name: 'Luxe Internationaal Hotel (GreenKey)', cost: 200, co2: 8, comfort: 5, sustainable: true, emoji: '🏰' }
];

// Vermaak
const activities = [
  { id: 'adventure', name: 'Avontuur: wandelen/fietsen', cost: 10, co2: 1, fun: 4, emoji: '🥾' },
  { id: 'culture', name: 'Cultuur: musea, erfgoed', cost: 30, co2: 2, fun: 3, emoji: '🏛️' },
  { id: 'relax', name: 'Ontspanning: chillen/shoppen/feesten', cost: 80, co2: 10, fun: 5, emoji: '🎉' }
];

// Gamechangers
const positiveGamechangers = [
  { id: 'green-bonus', text: '🌱 Je koos duurzaam! +€100 bonus van groene sponsor', money: 100, co2: 0 },
  { id: 'early-bird', text: '🐦 Early bird korting! -20% op verblijf', money: 50, co2: 0 },
  { id: 'carbon-offset', text: '🌳 Je CO₂ wordt gecompenseerd door bomenplant!', money: 0, co2: -50 },
  { id: 'lucky-upgrade', text: '⭐ Gratis upgrade naar betere kamer!', money: 0, co2: 0, comfort: 1 },
  { id: 'local-tip', text: '💡 Local tip: gratis activiteit ontdekt!', money: 20, co2: 0 }
];

const negativeGamechangers = [
  { id: 'flight-delay', text: '⏰ Vluchtvertraging! Extra hotel nacht nodig', money: -100, co2: 10, time: 1 },
  { id: 'price-surge', text: '💸 Prijspiek! Alles 30% duurder', money: -150, co2: 0 },
  { id: 'carbon-tax', text: '🏭 CO₂-heffing ingevoerd! Extra kosten', money: -80, co2: 0 },
  { id: 'bad-weather', text: '🌧️ Slecht weer! Activiteiten geannuleerd', money: -50, co2: 0, fun: -1 },
  { id: 'overbooked', text: '🚫 Hotel overboekt! Noodverblijf nodig', money: -120, co2: 5 }
];

// === STYLES ===
const styles = {
  container: { 
    maxWidth: 1400, 
    margin: '0 auto', 
    padding: 20, 
    fontFamily: 'system-ui, sans-serif',
    background: 'linear-gradient(to bottom, #e3f2fd, #ffffff)',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    padding: 20,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: 10,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  doomsClock: {
    fontSize: 48,
    fontWeight: 'bold',
    margin: '10px 0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  teamsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 30,
    marginBottom: 30
  },
  teamCard: {
    background: 'white',
    borderRadius: 15,
    padding: 20,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '3px solid #ddd'
  },
  activeTeam: {
    border: '3px solid #667eea',
    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
  },
  meter: {
    margin: '15px 0'
  },
  meterBar: {
    height: 30,
    background: '#eee',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 5
  },
  meterFill: (percent, color) => ({
    height: '100%',
    width: `${Math.min(100, Math.max(0, percent))}%`,
    background: color,
    transition: 'width 0.5s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10,
    color: 'white',
    fontWeight: 'bold'
  }),
  choiceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 15,
    margin: '20px 0'
  },
  choiceCard: {
    background: 'white',
    border: '2px solid #ddd',
    borderRadius: 10,
    padding: 20,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  },
  choiceCardHover: {
    border: '2px solid #667eea',
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
  },
  button: {
    padding: '12px 24px',
    fontSize: 16,
    fontWeight: 'bold',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    transition: 'transform 0.2s',
    margin: 5
  },
  avatar: {
    fontSize: 60,
    textAlign: 'center',
    margin: '10px 0'
  },
  gamechanger: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: 40,
    borderRadius: 20,
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    zIndex: 1000,
    textAlign: 'center',
    maxWidth: 500,
    animation: 'popup 0.3s ease'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999
  }
};

// === MAIN GAME COMPONENT ===
function TravelGame() {
  const [gameState, setGameState] = useState('start'); // start, team-setup, playing, gamechanger, result
  const [teams, setTeams] = useState([
    { id: 1, name: 'Team 1', players: [], money: 2000, co2: 0, time: 0, hasDog: false, choices: [], avatar: '😊' },
    { id: 2, name: 'Team 2', players: [], money: 2000, co2: 0, time: 0, hasDog: false, choices: [], avatar: '😊' }
  ]);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // 0: dog, 1: destination, 2: transport, 3: accommodation, 4: activities
  const [doomsClockYear, setDoomsClockYear] = useState(2026);
  const [currentGamechanger, setCurrentGamechanger] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);

  // Dooms Clock countdown
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setDoomsClockYear(prev => {
          if (prev <= 2020) return 2020;
          return prev - 0.1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  const startGame = () => {
    setGameState('team-setup');
  };

  const setupTeam = (teamId, playerNames, hasDog) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, players: playerNames, hasDog, money: hasDog ? 1800 : 2000, co2: hasDog ? 10 : 0 }
        : team
    ));
  };

  const startPlaying = () => {
    if (teams[0].players.length > 0 && teams[1].players.length > 0) {
      setGameState('playing');
      setCurrentStep(1); // Start met bestemming keuze
    }
  };

  const makeChoice = (choice, type) => {
    const team = teams[currentTeam];
    let newMoney = team.money;
    let newCO2 = team.co2;
    let newTime = team.time;

    // Apply choice impact
    if (choice.cost) newMoney += choice.cost;
    if (choice.co2) newCO2 += choice.co2;
    if (choice.time) newTime += choice.time;

    // Update team
    const updatedTeams = [...teams];
    updatedTeams[currentTeam] = {
      ...team,
      money: newMoney,
      co2: newCO2,
      time: newTime,
      choices: [...team.choices, { type, choice }],
      avatar: newMoney < 500 ? '😰' : newCO2 > 300 ? '😞' : '😊'
    };
    setTeams(updatedTeams);

    // Random gamechanger (20% kans)
    if (Math.random() < 0.2 && currentStep > 1) {
      const isPositive = Math.random() < 0.5;
      const gamechangers = isPositive ? positiveGamechangers : negativeGamechangers;
      const gamechanger = gamechangers[Math.floor(Math.random() * gamechangers.length)];
      setCurrentGamechanger(gamechanger);
      setGameState('gamechanger');
      return;
    }

    nextStep();
  };

  const applyGamechanger = () => {
    if (!currentGamechanger) return;

    const updatedTeams = [...teams];
    const team = updatedTeams[currentTeam];
    
    if (currentGamechanger.money) team.money += currentGamechanger.money;
    if (currentGamechanger.co2) team.co2 += currentGamechanger.co2;
    if (currentGamechanger.time) team.time += currentGamechanger.time;

    setTeams(updatedTeams);
    setCurrentGamechanger(null);
    setGameState('playing');
    nextStep();
  };

  const nextStep = () => {
    if (currentStep >= 4) {
      // Team is klaar, wissel naar ander team of einde
      if (currentTeam === 0) {
        setCurrentTeam(1);
        setCurrentStep(1);
      } else {
        setGameState('result');
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const getTransportOptions = () => {
    const team = teams[currentTeam];
    const destination = team.choices.find(c => c.type === 'destination')?.choice;
    
    if (!destination) return transport.local;
    
    if (destination.id === 'texel' || destination.id === 'berlin') {
      return [...transport.local, ...transport.shortFlight];
    }
    return transport.longFlight;
  };

  // === RENDER FUNCTIONS ===

  if (gameState === 'start') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>🌍 Reisbureau van de Toekomst</h1>
          <p style={{ fontSize: 20, marginTop: 10 }}>Educatief spel voor MBO-studenten (Gen Z)</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <h2>Welkom bij het Reisbureau van de Toekomst!</h2>
          <p style={{ fontSize: 18, maxWidth: 600, margin: '20px auto' }}>
            Twee teams van 4 studenten gaan tegen elkaar strijden. Maak slimme reiskeuzes 
            en houd je budget, tijd en CO₂-uitstoot in de gaten!
          </p>
          <button style={styles.button} onClick={startGame}>
            🚀 Start het Spel
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'team-setup') {
    return <TeamSetup teams={teams} setupTeam={setupTeam} startPlaying={startPlaying} />;
  }

  if (gameState === 'gamechanger' && currentGamechanger) {
    return (
      <>
        <div style={styles.overlay} onClick={applyGamechanger}></div>
        <div style={styles.gamechanger}>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>
            {currentGamechanger.money > 0 || currentGamechanger.co2 < 0 ? '✨ Gamechanger!' : '⚠️ Gamechanger!'}
          </h2>
          <p style={{ fontSize: 24, margin: '20px 0' }}>{currentGamechanger.text}</p>
          <button style={styles.button} onClick={applyGamechanger}>
            Doorgaan
          </button>
        </div>
      </>
    );
  }

  if (gameState === 'result') {
    return <ResultScreen teams={teams} doomsClockYear={doomsClockYear} />;
  }

  // PLAYING STATE
  const team = teams[currentTeam];
  const otherTeam = teams[currentTeam === 0 ? 1 : 0];

  return (
    <div style={styles.container}>
      {/* Header met Dooms Clock */}
      <div style={styles.header}>
        <div style={styles.doomsClock}>
          ⏰ {Math.floor(doomsClockYear)}
        </div>
        <p>De klok tikt... maak duurzame keuzes!</p>
      </div>

      {/* Teams Dashboard */}
      <div style={styles.teamsContainer}>
        {teams.map((t, idx) => (
          <div key={t.id} style={{...styles.teamCard, ...(idx === currentTeam ? styles.activeTeam : {})}}>
            <h2>{t.name} {idx === currentTeam && '← Aan de beurt'}</h2>
            <div style={styles.avatar}>{t.avatar}{t.hasDog && '🐕'}</div>
            
            {/* Meters */}
            <div style={styles.meter}>
              <div>💰 Budget: €{t.money}</div>
              <div style={styles.meterBar}>
                <div style={styles.meterFill((t.money / 2000) * 100, '#4caf50')}>
                  {t.money > 0 && `€${t.money}`}
                </div>
              </div>
            </div>

            <div style={styles.meter}>
              <div>🌍 CO₂: {Math.round(t.co2)} kg</div>
              <div style={styles.meterBar}>
                <div style={styles.meterFill((t.co2 / 500) * 100, t.co2 > 300 ? '#f44336' : '#ff9800')}>
                  {t.co2 > 0 && `${Math.round(t.co2)}kg`}
                </div>
              </div>
            </div>

            <div style={styles.meter}>
              <div>⏱️ Tijd: {t.time} dagen</div>
              <div style={styles.meterBar}>
                <div style={styles.meterFill((t.time / 10) * 100, '#2196f3')}>
                  {t.time > 0 && `${t.time}d`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Keuze sectie */}
      <div style={{ background: 'white', borderRadius: 15, padding: 30, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
          {team.name}: {getStepTitle(currentStep)}
        </h2>
        
        {currentStep === 1 && <DestinationChoice makeChoice={makeChoice} />}
        {currentStep === 2 && <TransportChoice makeChoice={makeChoice} options={getTransportOptions()} />}
        {currentStep === 3 && <AccommodationChoice makeChoice={makeChoice} />}
        {currentStep === 4 && <ActivityChoice makeChoice={makeChoice} />}
      </div>
    </div>
  );
}

function getStepTitle(step) {
  const titles = {
    1: '✈️ Kies je Vakantiebestemming',
    2: '🚗 Kies je Vervoer',
    3: '🏨 Kies je Verblijf',
    4: '🎉 Kies je Vermaak'
  };
  return titles[step] || '';
}

// === SUB COMPONENTS ===

function TeamSetup({ teams, setupTeam, startPlaying }) {
  const [team1Players, setTeam1Players] = useState(['', '', '', '']);
  const [team2Players, setTeam2Players] = useState(['', '', '', '']);
  const [team1Dog, setTeam1Dog] = useState(false);
  const [team2Dog, setTeam2Dog] = useState(false);

  const handleSetup = () => {
    const t1Names = team1Players.filter(n => n.trim());
    const t2Names = team2Players.filter(n => n.trim());
    
    if (t1Names.length > 0 && t2Names.length > 0) {
      setupTeam(1, t1Names, team1Dog);
      setupTeam(2, t2Names, team2Dog);
      startPlaying();
    } else {
      alert('Vul minimaal 1 speler in per team!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>👥 Team Opstelling</h1>
      </div>

      <div style={styles.teamsContainer}>
        {/* Team 1 */}
        <div style={styles.teamCard}>
          <h2>Team 1</h2>
          {team1Players.map((name, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Speler ${idx + 1}`}
              value={name}
              onChange={(e) => {
                const newPlayers = [...team1Players];
                newPlayers[idx] = e.target.value;
                setTeam1Players(newPlayers);
              }}
              style={{ padding: 10, margin: '5px 0', width: '100%', fontSize: 16, borderRadius: 5, border: '1px solid #ddd' }}
            />
          ))}
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 18, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={team1Dog}
                onChange={(e) => setTeam1Dog(e.target.checked)}
                style={{ marginRight: 10, transform: 'scale(1.5)' }}
              />
              🐕 Neem hondje mee? (-€200, +10kg CO₂, maar gezellig!)
            </label>
          </div>
        </div>

        {/* Team 2 */}
        <div style={styles.teamCard}>
          <h2>Team 2</h2>
          {team2Players.map((name, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Speler ${idx + 1}`}
              value={name}
              onChange={(e) => {
                const newPlayers = [...team2Players];
                newPlayers[idx] = e.target.value;
                setTeam2Players(newPlayers);
              }}
              style={{ padding: 10, margin: '5px 0', width: '100%', fontSize: 16, borderRadius: 5, border: '1px solid #ddd' }}
            />
          ))}
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 18, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={team2Dog}
                onChange={(e) => setTeam2Dog(e.target.checked)}
                style={{ marginRight: 10, transform: 'scale(1.5)' }}
              />
              🐕 Neem hondje mee? (-€200, +10kg CO₂, maar gezellig!)
            </label>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 30 }}>
        <button style={styles.button} onClick={handleSetup}>
          🎮 Start het Spel!
        </button>
      </div>
    </div>
  );
}

function DestinationChoice({ makeChoice }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={styles.choiceGrid}>
      {destinations.map(dest => (
        <div
          key={dest.id}
          style={{
            ...styles.choiceCard,
            ...(hoveredId === dest.id ? styles.choiceCardHover : {})
          }}
          onMouseEnter={() => setHoveredId(dest.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => makeChoice({ ...dest, cost: -dest.baseCost, co2: dest.baseCO2, time: dest.baseTime }, 'destination')}
        >
          <div style={{ fontSize: 40 }}>{dest.emoji}</div>
          <h3>{dest.name}</h3>
          <p style={{ fontSize: 14, color: '#666' }}>{dest.country}</p>
          <div style={{ marginTop: 10, fontSize: 14 }}>
            <div>💰 €{dest.baseCost}</div>
            <div>🌍 {dest.baseCO2}kg CO₂</div>
            <div>⏱️ {dest.baseTime} dagen</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TransportChoice({ makeChoice, options }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={styles.choiceGrid}>
      {options.map(trans => (
        <div
          key={trans.id}
          style={{
            ...styles.choiceCard,
            ...(hoveredId === trans.id ? styles.choiceCardHover : {})
          }}
          onMouseEnter={() => setHoveredId(trans.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => makeChoice({ ...trans, cost: -trans.cost }, 'transport')}
        >
          <div style={{ fontSize: 40 }}>{trans.emoji}</div>
          <h3>{trans.name}</h3>
          <div style={{ marginTop: 10, fontSize: 14 }}>
            <div>💰 €{trans.cost}</div>
            <div>🌍 {trans.co2}kg CO₂</div>
            <div>⏱️ {trans.time} dagen</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccommodationChoice({ makeChoice }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={styles.choiceGrid}>
      {accommodation.map(acc => (
        <div
          key={acc.id}
          style={{
            ...styles.choiceCard,
            ...(hoveredId === acc.id ? styles.choiceCardHover : {})
          }}
          onMouseEnter={() => setHoveredId(acc.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => makeChoice({ ...acc, cost: -acc.cost }, 'accommodation')}
        >
          <div style={{ fontSize: 40 }}>{acc.emoji}</div>
          <h3>{acc.name}</h3>
          {acc.localBonus && <div style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ Steunt lokale economie</div>}
          {acc.sustainable && <div style={{ color: '#4caf50', fontWeight: 'bold' }}>♻️ GreenKey keurmerk</div>}
          <div style={{ marginTop: 10, fontSize: 14 }}>
            <div>💰 €{acc.cost}/nacht</div>
            <div>🌍 {acc.co2}kg CO₂</div>
            <div>⭐ Comfort: {acc.comfort}/5</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityChoice({ makeChoice }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [showGuideOption, setShowGuideOption] = useState(false);

  const handleActivityClick = (activity) => {
    setShowGuideOption(activity);
  };

  const finalizeChoice = (withGuide) => {
    const activity = showGuideOption;
    const finalActivity = {
      ...activity,
      cost: withGuide ? activity.cost - 50 : activity.cost, // Guide kost extra
      fun: withGuide ? activity.fun + 1 : activity.fun
    };
    makeChoice({ ...finalActivity, cost: -finalActivity.cost }, 'activity');
    setShowGuideOption(false);
  };

  if (showGuideOption) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h3>💡 Wil je een local guide inhuren?</h3>
        <p style={{ fontSize: 18, margin: '20px 0' }}>
          Een local guide kost €50 extra, maar geeft je meer kennis en een leukere ervaring!
        </p>
        <button style={styles.button} onClick={() => finalizeChoice(true)}>
          👨‍🏫 Ja, neem guide (+€50, +1 fun)
        </button>
        <button style={{...styles.button, background: '#666'}} onClick={() => finalizeChoice(false)}>
          🚶 Nee, ik doe het zelf
        </button>
      </div>
    );
  }

  return (
    <div style={styles.choiceGrid}>
      {activities.map(act => (
        <div
          key={act.id}
          style={{
            ...styles.choiceCard,
            ...(hoveredId === act.id ? styles.choiceCardHover : {})
          }}
          onMouseEnter={() => setHoveredId(act.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => handleActivityClick(act)}
        >
          <div style={{ fontSize: 40 }}>{act.emoji}</div>
          <h3>{act.name}</h3>
          <div style={{ marginTop: 10, fontSize: 14 }}>
            <div>💰 €{act.cost}</div>
            <div>🌍 {act.co2}kg CO₂</div>
            <div>🎉 Fun: {act.fun}/5</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultScreen({ teams, doomsClockYear }) {
  const calculateScore = (team) => {
    const moneyScore = Math.max(0, team.money);
    const co2Penalty = team.co2 * 2;
    const timePenalty = team.time * 10;
    return Math.max(0, moneyScore - co2Penalty - timePenalty);
  };

  const team1Score = calculateScore(teams[0]);
  const team2Score = calculateScore(teams[1]);
  const winner = team1Score > team2Score ? teams[0] : teams[1];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🏆 Resultaten!</h1>
        <div style={styles.doomsClock}>⏰ {Math.floor(doomsClockYear)}</div>
      </div>

      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <h2 style={{ fontSize: 36, color: '#667eea' }}>
          🎉 {winner.name} Wint! 🎉
        </h2>
      </div>

      <div style={styles.teamsContainer}>
        {teams.map(team => (
          <div key={team.id} style={styles.teamCard}>
            <h2>{team.name}</h2>
            <div style={styles.avatar}>{team.avatar}{team.hasDog && '🐕'}</div>
            
            <div style={{ margin: '20px 0', fontSize: 18 }}>
              <div>💰 Budget over: €{team.money}</div>
              <div>🌍 CO₂ totaal: {Math.round(team.co2)}kg</div>
              <div>⏱️ Tijd gebruikt: {team.time} dagen</div>
              <div style={{ marginTop: 15, fontSize: 24, fontWeight: 'bold', color: '#667eea' }}>
                🎯 Score: {Math.round(calculateScore(team))}
              </div>
            </div>

            <h3>Jouw reis:</h3>
            <ul style={{ textAlign: 'left', fontSize: 14 }}>
              {team.choices.map((c, idx) => (
                <li key={idx}>
                  <strong>{c.type}:</strong> {c.choice.name || c.choice.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 30, background: '#fff3cd', padding: 30, borderRadius: 10 }}>
        <h2>💡 Reflectie</h2>
        <p style={{ fontSize: 18, maxWidth: 800, margin: '0 auto' }}>
          Duurzaam reizen betekent bewuste keuzes maken. Elke euro die je uitgeeft, elk transportmiddel dat je kiest, 
          en elke activiteit die je doet heeft impact op de wereld. Welke keuzes zou je volgende keer anders maken?
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: 30 }}>
        <button style={styles.button} onClick={() => window.location.reload()}>
          🔄 Nieuw Spel
        </button>
      </div>
    </div>
  );
}

// === RENDER APP ===
const root = createRoot(document.getElementById('root'));
root.render(<TravelGame />);
