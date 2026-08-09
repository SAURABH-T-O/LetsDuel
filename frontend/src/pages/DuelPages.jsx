import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { duelRoomModes, demoPlayers } from '../data/appData';
import { duelApi } from '../api/placeholders';
import { isAuthenticated } from '../utils/session';
import { completeTournamentMatch, generateSingleEliminationTournament, isValidSingleEliminationCount } from '../utils/tournament';
import { Modal, PageTransition, PrimaryButton, SecondaryButton } from '../components/common';

export function DuelPageShell({ eyebrow, title, subtitle, children }) {
  return (
    <PageTransition>
      <section className="duel-room-page">
        <div className="duel-page-heading">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{subtitle}</span>
        </div>
        {children}
      </section>
    </PageTransition>
  );
}

export function ChoicePill({ active, children, onClick }) {
  return (
    <button className={`choice-pill ${active ? 'active' : ''}`} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

export function CreateDuelRoomPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState({
    questionCount: 5,
    difficultyMin: 800,
    difficultyMax: 1400,
    bracketSize: 8,
    onlyUnsolved: true,
    duration: '30',
    customDuration: '',
  });
  const [mode, setMode] = useState('battle-royale');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true, state: { returnTo: '/create-duel' } });
  }, [navigate]);

  const duration = settings.duration === 'custom' ? settings.customDuration : settings.duration;

  const createRoom = async () => {
    if (!duration || Number(duration) <= 0) {
      setError('Choose a valid contest duration.');
      return;
    }

    setLoading(true);
    setError('');
    const difficultyMin = Number(settings.difficultyMin);
    const difficultyMax = Number(settings.difficultyMax);
    const questionCount = Number(settings.questionCount);

    if (!questionCount || questionCount < 1) {
      setLoading(false);
      setError('Enter at least 1 question.');
      return;
    }

    if (!difficultyMin || !difficultyMax || difficultyMin > difficultyMax) {
      setLoading(false);
      setError('Enter a valid difficulty range.');
      return;
    }

    const normalizedSettings = {
      ...settings,
      questionCount,
      difficultyMin,
      difficultyMax,
      duration,
    };

    const result = await duelApi.createRoom({ settings: normalizedSettings, mode });
    const room = {
      roomCode: result.roomCode,
      creator: result.creator,
      mode,
      settings: normalizedSettings,
    };
    setCreatedRoom(room);
    setLoading(false);
  };

  const enterRoom = () => {
    navigate(`/room/${createdRoom.roomCode}`, { state: createdRoom });
  };

  const selectedMode = duelRoomModes.find((item) => item.id === mode);

  return (
    <DuelPageShell
      eyebrow="CREATE DUEL"
      title="Create Duel Room"
      subtitle="Configure the contest, choose a battle format, then share the room code with your challengers."
    >
      <div className="duel-builder">
        <div className="duel-steps">
          <button className={step === 1 ? 'active' : ''} type="button" onClick={() => setStep(1)}>
            <span>01</span> Contest Settings
          </button>
          <button className={step === 2 ? 'active' : ''} type="button" onClick={() => setStep(2)}>
            <span>02</span> Game Mode
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              className="duel-config-card"
              key="settings"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
            >
              <div className="config-group">
                <h3>Number of Questions</h3>
                <input
                  className="duel-custom-input"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.questionCount}
                  onChange={(event) => setSettings({ ...settings, questionCount: event.target.value })}
                  placeholder="Enter number of questions"
                />
              </div>

              <div className="config-group">
                <h3>Difficulty Range</h3>
                <div className="duel-range-grid">
                  <input
                    className="duel-custom-input"
                    type="number"
                    min="800"
                    step="100"
                    value={settings.difficultyMin}
                    onChange={(event) => setSettings({ ...settings, difficultyMin: event.target.value })}
                    placeholder="Min rating"
                  />
                  <input
                    className="duel-custom-input"
                    type="number"
                    min="800"
                    step="100"
                    value={settings.difficultyMax}
                    onChange={(event) => setSettings({ ...settings, difficultyMax: event.target.value })}
                    placeholder="Max rating"
                  />
                </div>
                <p className="config-hint">LetsDuel will select questions whose ratings stay inside this range.</p>
              </div>

              <label className="duel-checkbox">
                <input
                  type="checkbox"
                  checked={settings.onlyUnsolved}
                  onChange={(event) => setSettings({ ...settings, onlyUnsolved: event.target.checked })}
                />
                <span>Include only questions that participating users have NOT solved before</span>
              </label>

              <div className="config-group">
                <h3>Contest Duration</h3>
                <div className="choice-grid difficulty-grid">
                  {['15', '30', '45', '60', '90', 'custom'].map((item) => (
                    <ChoicePill
                      key={item}
                      active={settings.duration === item}
                      onClick={() => setSettings({ ...settings, duration: item })}
                    >
                      {item === 'custom' ? 'Custom' : `${item} min`}
                    </ChoicePill>
                  ))}
                </div>
                {settings.duration === 'custom' && (
                  <input
                    className="duel-custom-input"
                    type="number"
                    min="5"
                    placeholder="Custom minutes"
                    value={settings.customDuration}
                    onChange={(event) => setSettings({ ...settings, customDuration: event.target.value })}
                  />
                )}
              </div>

              <PrimaryButton type="button" onClick={() => setStep(2)}>
                Continue to Game Mode
              </PrimaryButton>
            </motion.div>
          ) : (
            <motion.div
              className="duel-config-card"
              key="modes"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
            >
              <div className="room-mode-grid">
                {duelRoomModes.map((item) => (
                  <button
                    className={`room-mode-card ${mode === item.id ? 'active' : ''}`}
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                  >
                    <span>{item.tag}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <ul>
                      {item.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              {mode === 'single-elimination' && (
                <div className="config-group">
                  <h3>Bracket Mode</h3>
                  <div className="choice-grid">
                    {[4, 8, 16, 32].map((size) => (
                      <ChoicePill
                        key={size}
                        active={Number(settings.bracketSize) === size}
                        onClick={() => setSettings({ ...settings, bracketSize: size })}
                      >
                        {size} Players
                      </ChoicePill>
                    ))}
                  </div>
                  <p className="config-hint">
                    {settings.bracketSize}-player brackets can start only with {Number(settings.bracketSize) - 1} or {settings.bracketSize} players.
                  </p>
                </div>
              )}

              {error && <div className="backend-error">{error}</div>}

              {createdRoom ? (
                <div className="created-room-card">
                  <span>Room Created</span>
                  <strong>{createdRoom.roomCode}</strong>
                  <p>{selectedMode.title} is ready. Share this code and wait in the lobby.</p>
                  <div className="room-action-row">
                    <SecondaryButton onClick={() => navigator.clipboard.writeText(createdRoom.roomCode)}>
                      Copy Room Code
                    </SecondaryButton>
                    <PrimaryButton type="button" onClick={enterRoom}>
                      Enter Lobby
                    </PrimaryButton>
                  </div>
                </div>
              ) : (
                <div className="room-action-row">
                  <SecondaryButton onClick={() => setStep(1)}>Back</SecondaryButton>
                  <PrimaryButton type="button" loading={loading} onClick={createRoom}>
                    Create Room
                  </PrimaryButton>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DuelPageShell>
  );
}

export function JoinDuelRoomPage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [creator, setCreator] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true, state: { returnTo: '/join-duel' } });
  }, [navigate]);

  const normalizedCode = roomCode.toUpperCase();
  const validCode = /^[A-Z0-9]{5}$/.test(normalizedCode);

  const handleCodeChange = async (value) => {
    const nextCode = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    setRoomCode(nextCode);
    setError('');
    setCreator('');
    if (nextCode.length === 5) {
      const room = await duelApi.fetchRoom(nextCode);
      setCreator(room.creator);
    }
  };

  const joinRoom = async (event) => {
    event.preventDefault();
    if (!validCode) {
      setError('Enter a valid 5-character alphanumeric duel code.');
      return;
    }

    setLoading(true);
    await duelApi.joinRoom({ roomCode: normalizedCode });
    setLoading(false);
    navigate(`/room/${normalizedCode}`, {
      state: {
        roomCode: normalizedCode,
        creator: creator || 'CodeMaster_21',
        mode: 'battle-royale',
        settings: { questionCount: 5, difficultyMin: 900, difficultyMax: 1300, duration: '45', onlyUnsolved: true, bracketSize: 8 },
        joined: true,
      },
    });
  };

  return (
    <DuelPageShell
      eyebrow="JOIN DUEL"
      title="Join Duel Room"
      subtitle="Enter the shared duel code to join the correct lobby for its selected game mode."
    >
      <form className="join-room-card" onSubmit={joinRoom}>
        <div className="creator-preview">
          <span>Creator</span>
          <strong>{creator || 'Enter a room code to fetch creator'}</strong>
        </div>
        <label className="duel-code-field">
          <span>Enter 5-character Duel Code</span>
          <input
            value={roomCode}
            onChange={(event) => handleCodeChange(event.target.value)}
            placeholder="A7X2P"
            maxLength="5"
          />
        </label>
        {error && <div className="backend-error">{error}</div>}
        <PrimaryButton type="submit" loading={loading}>
          Join
        </PrimaryButton>
      </form>
    </DuelPageShell>
  );
}

export function RoomMetaCard({ label, value }) {
  return (
    <article className="room-meta-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export function TeamLobby() {
  const [teamA, setTeamA] = useState(['You', 'dp_knight', '', '', '', '', '', '']);
  const [teamB, setTeamB] = useState(['bit_coder', '', '', '', '', '', '', '']);

  const moveToSlot = (team, index) => {
    const nextA = teamA.map((player) => (player === 'You' ? '' : player));
    const nextB = teamB.map((player) => (player === 'You' ? '' : player));
    if (team === 'A' && !nextA[index]) nextA[index] = 'You';
    if (team === 'B' && !nextB[index]) nextB[index] = 'You';
    setTeamA(nextA);
    setTeamB(nextB);
  };

  const renderSlot = (player, index, team) => (
    <button className={`team-slot ${player ? 'filled' : ''}`} key={`${team}-${index}`} type="button" onClick={() => !player && moveToSlot(team, index)}>
      {player || 'Empty Slot'}
    </button>
  );

  return (
    <div className="team-lobby">
      <div className="room-tip">Tip: You can change your team by clicking any empty slot before the contest starts.</div>
      <div className="team-columns">
        <section>
          <h3>Team A</h3>
          {teamA.map((player, index) => renderSlot(player, index, 'A'))}
        </section>
        <section>
          <h3>Team B</h3>
          {teamB.map((player, index) => renderSlot(player, index, 'B'))}
        </section>
      </div>
    </div>
  );
}

export function BattleRoyaleLobby() {
  return (
    <div className="leaderboard-panel">
      <div className="leaderboard-head">
        <span>Rank</span>
        <span>Username</span>
        <span>Solved</span>
        <span>Score</span>
        <span>Penalty</span>
        <span>Last AC</span>
      </div>
      {demoPlayers.map((player, index) => (
        <div className="leaderboard-row" key={player}>
          <span>#{index + 1}</span>
          <strong>{index === 0 ? 'You' : player}</strong>
          <span>{Math.max(0, 3 - index)}</span>
          <span>{Math.max(0, 300 - index * 40)}</span>
          <span>{index * 12}</span>
          <span>{index === 0 ? '08:42' : '--'}</span>
        </div>
      ))}
    </div>
  );
}

export function BracketMatchCard({ match, onWinner }) {
  const canPickWinner = match.status === 'active' && match.player1 && match.player2 && !match.isBye;

  const renderPlayer = (player, slot) => {
    const isWinner = match.winner === player;
    const isLoser = match.loser === player && player !== 'BYE';
    const score = slot === 'player1' ? match.score1 : match.score2;

    return (
      <button
        className={`bracket-player-slot ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''} ${player === 'BYE' ? 'bye-player' : ''}`}
        type="button"
        disabled={!canPickWinner || !player || player === 'BYE'}
        onClick={() => onWinner(match.id, player)}
      >
        <span>{player || 'TBD'}</span>
        <b>{isWinner ? '✓' : score || ''}</b>
      </button>
    );
  };

  return (
    <article className={`bracket-match-card ${match.status} ${match.nextMatchId ? 'has-connector' : ''}`}>
      <div className="match-card-topline">
        <span>{match.id.toUpperCase()}</span>
        <b>{match.isBye ? 'BYE' : match.status}</b>
      </div>
      {renderPlayer(match.player1, 'player1')}
      {renderPlayer(match.player2, 'player2')}
      {match.isBye && <p>{match.winner} advanced automatically.</p>}
    </article>
  );
}

export function BracketLobby({ room }) {
  const bracketSize = Number(room.settings.bracketSize || 8);
  const participants = ['You', ...demoPlayers].slice(0, Math.min(bracketSize, room.settings.demoParticipantCount || bracketSize - 1));
  const participantCount = participants.length;
  const validCount = isValidSingleEliminationCount(participantCount, bracketSize);
  const [tournament, setTournament] = useState(null);

  const startTournament = () => {
    if (!validCount) return;
    setTournament(generateSingleEliminationTournament(participants, bracketSize));
  };

  const pickWinner = (matchId, winner) => {
    setTournament((current) => completeTournamentMatch(current, matchId, winner));
  };

  return (
    <div className="bracket-lobby">
      <div className="single-elim-toolbar">
        <div className="joined-counter">
          <span>Players</span>
          <strong>{participantCount} / {bracketSize}</strong>
        </div>
        <div>
          <PrimaryButton type="button" disabled={!validCount || Boolean(tournament)} onClick={startTournament}>
            Start Tournament
          </PrimaryButton>
          {!validCount && (
            <p className="bracket-validation">
              Single Elimination requires 3, 4, 7, 8, 15, 16, 31, or 32 players.
            </p>
          )}
        </div>
      </div>

      {tournament ? (
        <div className="bracket-scroll">
          <div className={`pro-bracket bracket-size-${bracketSize}`}>
            {tournament.rounds.map((round) => (
              <section className="bracket-round" key={round.id}>
                <h3>{round.name}</h3>
                <div className="round-matches">
                  {round.matches.map((match) => (
                    <BracketMatchCard key={match.id} match={match} onWinner={pickWinner} />
                  ))}
                </div>
              </section>
            ))}
            <section className="champion-column">
              <h3>Champion</h3>
              <div className="champion-card">
                <span>🏆 CHAMPION</span>
                <strong>{tournament.champion || 'TBD'}</strong>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="bracket-empty-state">
          <strong>Bracket not created yet</strong>
          <p>Participants will be randomly shuffled when the tournament starts. If one player is missing, exactly one random BYE is assigned.</p>
        </div>
      )}
    </div>
  );
}

export function GauntletLobby() {
  const questionCount = 12;
  const [youUnlocked, setYouUnlocked] = useState(4);
  const opponentUnlocked = 3;
  const problems = Array.from({ length: questionCount }, (_, index) => `Problem ${index + 1}`);

  return (
    <div className="gauntlet-wrap">
      <div className="gauntlet-progress-grid">
        <article>
          <span>You</span>
          <strong>Unlocked Q{youUnlocked}</strong>
          <div><i style={{ width: `${(youUnlocked / questionCount) * 100}%` }} /></div>
        </article>
        <article>
          <span>Opponent</span>
          <strong>Unlocked Q{opponentUnlocked}</strong>
          <div><i style={{ width: `${(opponentUnlocked / questionCount) * 100}%` }} /></div>
        </article>
      </div>
      <div className="gauntlet-panel">
        {problems.map((problem, index) => (
          <article className={index < youUnlocked ? 'unlocked' : ''} key={problem}>
            <span>{index < youUnlocked ? 'Unlocked' : 'Locked'}</span>
            <strong>{problem}</strong>
            <p>{index < youUnlocked ? 'Available on your path.' : 'Unlocks after the previous accepted solution.'}</p>
          </article>
        ))}
      </div>
      <PrimaryButton type="button" disabled={youUnlocked >= questionCount} onClick={() => setYouUnlocked((value) => Math.min(questionCount, value + 1))}>
        Simulate Accepted Solution
      </PrimaryButton>
    </div>
  );
}

export function RulesPanel({ mode }) {
  const modeRules = {
    'battle-royale': [
      'Everyone receives the same problem set sorted by increasing difficulty.',
      'Problem scores increase by 50 points each question.',
      'Each wrong submission costs 10 points.',
      'Highest score wins; ties use penalty and last accepted time.',
    ],
    'team-duel': [
      'Players join Team A or Team B before the contest starts.',
      'Uneven teams are allowed, including handicap matches.',
      'Team score is based on solved problems, points, and penalty.',
      'Players can switch to empty slots before start.',
    ],
    'single-elimination': [
      'Only 3, 4, 7, 8, 15, 16, 31, or 32 players can start.',
      'One-player-short brackets assign exactly one random BYE.',
      'Winners advance through a fixed bracket path.',
      'The final winner is crowned champion.',
    ],
    'code-gauntlet': [
      'This mode is strictly 1v1.',
      'Both players follow the same problem path.',
      'Solving the current problem unlocks the next.',
      'Most solved wins; penalty time breaks ties.',
    ],
  };

  return (
    <div className="rules-panel">
      {(modeRules[mode] || modeRules['battle-royale']).map((rule) => (
        <article key={rule}>
          <span>•</span>
          <p>{rule}</p>
        </article>
      ))}
    </div>
  );
}

export function RoomModePanel({ room }) {
  const mode = room.mode;
  if (mode === 'team-duel') return <TeamLobby />;
  if (mode === 'single-elimination') return <BracketLobby room={room} />;
  if (mode === 'code-gauntlet') return <GauntletLobby />;
  return <BattleRoyaleLobby />;
}

export function DuelRoomPage() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [room] = useState(() => ({
    roomCode,
    creator: location.state?.creator || 'You',
    mode: location.state?.mode || 'battle-royale',
    settings: location.state?.settings || {
      questionCount: 5,
      difficultyMin: 900,
      difficultyMax: 1300,
      duration: '45',
      onlyUnsolved: true,
      bracketSize: 8,
    },
  }));

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true, state: { returnTo: `/room/${roomCode}` } });
  }, [navigate, roomCode]);

  const modeInfo = duelRoomModes.find((item) => item.id === room.mode) || duelRoomModes[0];

  const startContest = async () => {
    setLoading(true);
    await duelApi.startContest({ roomCode });
    setLoading(false);
  };

  return (
    <DuelPageShell
      eyebrow="DUEL LOBBY"
      title={`${modeInfo.title} Lobby`}
      subtitle="Manage room code, players, ready status, and creator controls before the contest starts."
    >
      <div className="room-layout">
        <aside className="room-sidebar">
          <div className="room-code-card">
            <span>Room Code</span>
            <strong>{room.roomCode}</strong>
            <div className="room-action-row">
              <SecondaryButton onClick={() => navigator.clipboard.writeText(room.roomCode)}>Copy Room Code</SecondaryButton>
              <SecondaryButton onClick={() => navigator.share?.({ title: 'LetsDuel Room', text: room.roomCode })}>Share Room</SecondaryButton>
            </div>
          </div>
          <RoomMetaCard label="Creator" value={room.creator} />
          <RoomMetaCard label="Game Mode" value={modeInfo.title} />
          <RoomMetaCard label="Players" value={room.mode === 'code-gauntlet' ? '1 / 2' : `${demoPlayers.length + 1} joined`} />
          <RoomMetaCard label="Duration" value={`${room.settings.duration} min`} />
          <RoomMetaCard label="Questions" value={room.settings.questionCount} />
          <RoomMetaCard label="Difficulty" value={`${room.settings.difficultyMin}-${room.settings.difficultyMax}`} />
          {room.mode === 'single-elimination' && (
            <RoomMetaCard label="Bracket" value={`${room.settings.bracketSize} Players`} />
          )}
        </aside>

        <section className="room-main-panel">
          <div className="room-status-bar">
            <div>
              <span>Ready Status</span>
              <strong>Waiting for creator to start</strong>
            </div>
            <div className="room-action-row">
              <SecondaryButton onClick={() => navigate('/')}>Leave Room</SecondaryButton>
              <SecondaryButton onClick={() => setRulesOpen(true)}>Rules</SecondaryButton>
              <PrimaryButton type="button" loading={loading} onClick={startContest}>
                Start Contest
              </PrimaryButton>
            </div>
          </div>
          <RoomModePanel room={room} />
        </section>
      </div>

      <Modal open={rulesOpen} title={`${modeInfo.title} Rules`} onClose={() => setRulesOpen(false)}>
        <RulesPanel mode={room.mode} />
      </Modal>
    </DuelPageShell>
  );
}
