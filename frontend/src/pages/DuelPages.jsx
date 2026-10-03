import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { duelRoomModes } from '../data/appData';
import { authApi, duelApi } from '../api';
import { connectDuelRoomSocket } from '../realtime/socket';
import { isAuthenticated } from '../utils/session';
import {
  completeTournamentMatch,
  generateSingleEliminationTournament,
  isValidSingleEliminationCount,
} from '../utils/tournament';
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
    durationMinutes: 30,
  });
  const [mode, setMode] = useState('team-duel');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true, state: { returnTo: '/create-duel' } });
  }, [navigate]);

  const createRoom = async () => {
    const questionCount = Number(settings.questionCount);
    const difficultyMin = Number(settings.difficultyMin);
    const difficultyMax = Number(settings.difficultyMax);
    const durationMinutes = Number(settings.durationMinutes);

    if (!questionCount || questionCount < 1) return setError('Enter at least 1 question.');
    if (!difficultyMin || !difficultyMax || difficultyMin > difficultyMax) return setError('Enter a valid difficulty range.');
    if (!durationMinutes || durationMinutes < 1) return setError('Choose a valid contest duration.');

    setLoading(true);
    setError('');

    try {
      const response = await duelApi.createRoom({
        mode,
        settings: {
          questionCount,
          difficultyMin,
          difficultyMax,
          durationMinutes,
          onlyUnsolved: settings.onlyUnsolved,
          bracketSize: mode === 'single-elimination' ? Number(settings.bracketSize) : undefined,
        },
      });

      const room = response?.data?.room || response?.room || response;
      navigate(`/room/${room.roomCode}`, { state: { room } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            <motion.div className="duel-config-card" key="settings" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }}>
              <div className="config-group">
                <h3>Number of Questions</h3>
                <input className="duel-custom-input" type="number" min="1" max="50" value={settings.questionCount} onChange={(e) => setSettings({ ...settings, questionCount: e.target.value })} />
              </div>

              <div className="config-group">
                <h3>Difficulty Range</h3>
                <div className="duel-range-grid">
                  <input className="duel-custom-input" type="number" min="800" max="3500" step="100" value={settings.difficultyMin} onChange={(e) => setSettings({ ...settings, difficultyMin: e.target.value })} />
                  <input className="duel-custom-input" type="number" min="800" max="3500" step="100" value={settings.difficultyMax} onChange={(e) => setSettings({ ...settings, difficultyMax: e.target.value })} />
                </div>
              </div>

              <label className="duel-checkbox">
                <input type="checkbox" checked={settings.onlyUnsolved} onChange={(e) => setSettings({ ...settings, onlyUnsolved: e.target.checked })} />
                <span>Include only questions that participating users have NOT solved before</span>
              </label>

              <div className="config-group">
                <h3>Contest Duration</h3>
                <input className="duel-custom-input" type="number" min="1" max="600" value={settings.durationMinutes} onChange={(e) => setSettings({ ...settings, durationMinutes: e.target.value })} />
              </div>

              <PrimaryButton type="button" onClick={() => setStep(2)}>Continue to Game Mode</PrimaryButton>
            </motion.div>
          ) : (
            <motion.div className="duel-config-card" key="modes" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <div className="room-mode-grid">
                {duelRoomModes.map((item) => (
                  <button className={`room-mode-card ${mode === item.id ? 'active' : ''}`} key={item.id} type="button" onClick={() => setMode(item.id)}>
                    <span>{item.tag}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <ul>{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
                  </button>
                ))}
              </div>

              {mode === 'single-elimination' && (
                <div className="config-group">
                  <h3>Bracket Mode</h3>
                  <div className="choice-grid">
                    {[4, 8, 16, 32].map((size) => (
                      <ChoicePill key={size} active={Number(settings.bracketSize) === size} onClick={() => setSettings({ ...settings, bracketSize: size })}>
                        {size} Players
                      </ChoicePill>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className="backend-error">{error}</div>}

              <div className="room-action-row">
                <SecondaryButton onClick={() => setStep(1)}>Back</SecondaryButton>
                <PrimaryButton type="button" loading={loading} onClick={createRoom}>Create Room</PrimaryButton>
              </div>
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
  const [preview, setPreview] = useState(null);
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
    setPreview(null);
    setError('');

    if (nextCode.length === 5) {
      try {
        const data = await duelApi.fetchRoom(nextCode);
        setPreview(data.room || data.data?.room || data);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const joinRoom = async (event) => {
    event.preventDefault();
    if (!validCode) return setError('Enter a valid 5-character alphanumeric duel code.');

    setLoading(true);
    setError('');

    try {
      const response = await duelApi.joinRoom({ roomCode: normalizedCode });
      const room = response?.data?.room || response?.room || response;
      navigate(`/room/${normalizedCode}`, { state: { room } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DuelPageShell eyebrow="JOIN DUEL" title="Join Duel Room" subtitle="Enter the shared duel code to join the correct lobby.">
      <form className="join-room-card" onSubmit={joinRoom}>
        <div className="creator-preview">
          <span>Creator</span>
          <strong>{preview?.creator?.username || preview?.creator || 'Enter a room code to fetch creator'}</strong>
        </div>

        <label className="duel-code-field">
          <span>Enter 5-character Duel Code</span>
          <input value={roomCode} onChange={(event) => handleCodeChange(event.target.value)} placeholder="A7X2P" maxLength="5" />
        </label>

        {error && <div className="backend-error">{error}</div>}
        <PrimaryButton type="submit" loading={loading}>Join</PrimaryButton>
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

function getTeamPlayers(room, team) {
  return Array.from({ length: 8 }, (_, index) =>
    room.participants?.find((player) => player.team === team && player.slot === index) || null,
  );
}

export function TeamLobby({ room, onMoveSlot }) {
  const renderSlot = (player, index, team) => (
    <button className={`team-slot ${player ? 'filled' : ''}`} key={`${team}-${index}`} type="button" disabled={Boolean(player) || room.status !== 'waiting'} onClick={() => onMoveSlot(team, index)}>
      {player ? player.username : 'Empty Slot'}
    </button>
  );

  return (
    <div className="team-lobby">
      <div className="room-tip">Tip: team changes update live for everyone in this lobby.</div>
      <div className="team-columns">
        <section>
          <h3>Team A</h3>
          {getTeamPlayers(room, 'A').map((player, index) => renderSlot(player, index, 'A'))}
        </section>
        <section>
          <h3>Team B</h3>
          {getTeamPlayers(room, 'B').map((player, index) => renderSlot(player, index, 'B'))}
        </section>
      </div>
    </div>
  );
}

export function ActiveContestPanel({ room, onSyncProblem, syncingProblemId }) {
  const teamA = room.participants?.filter((player) => player.team === 'A') || [];
  const teamB = room.participants?.filter((player) => player.team === 'B') || [];
  const teamScore = (team) => team.reduce((sum, player) => sum + (player.score || 0), 0);

  return (
    <div className="active-contest-panel">
      <div className="leaderboard-panel">
        <div className="leaderboard-head">
          <span>Team</span>
          <span>Players</span>
          <span>Solved</span>
          <span>Score</span>
          <span>Penalty</span>
          <span>Last AC</span>
        </div>
        {[['Team A', teamA], ['Team B', teamB]].map(([name, players]) => (
          <div className="leaderboard-row" key={name}>
            <strong>{name}</strong>
            <span>{players.length}</span>
            <span>{players.reduce((sum, p) => sum + (p.solvedCount || 0), 0)}</span>
            <span>{teamScore(players)}</span>
            <span>{players.reduce((sum, p) => sum + (p.penalty || 0), 0)}</span>
            <span>{players.some((p) => p.lastAcceptedAt) ? 'AC' : '--'}</span>
          </div>
        ))}
      </div>

      <div className="gauntlet-panel">
        {(room.problems || []).map((item) => {
          const problem = item.problem || item;
          return (
            <article className="unlocked" key={problem._id}>
              <span>{problem.rating || item.rating} rating</span>
              <strong>{problem.name}</strong>
              <p>{problem.contestId}{problem.index}</p>
              <div className="room-action-row">
                <SecondaryButton onClick={() => window.open(problem.url, '_blank', 'noopener,noreferrer')}>Open Codeforces</SecondaryButton>
                <PrimaryButton loading={syncingProblemId === problem._id} onClick={() => onSyncProblem(problem._id)}>Check Submissions</PrimaryButton>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function BattleRoyaleLobby({ room }) {
  const players = [...(room.participants || [])].sort((a, b) => (b.score || 0) - (a.score || 0));

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
      {players.map((player, index) => (
        <div className="leaderboard-row" key={player.user || player.username}>
          <span>#{index + 1}</span>
          <strong>{player.username}</strong>
          <span>{player.solvedCount || 0}</span>
          <span>{player.score || 0}</span>
          <span>{player.penalty || 0}</span>
          <span>{player.lastAcceptedAt ? 'AC' : '--'}</span>
        </div>
      ))}
    </div>
  );
}

export function BracketLobby({ room }) {
  const bracketSize = Number(room.settings?.bracketSize || 8);
  const participants = (room.participants || []).map((player) => player.username);
  const validCount = isValidSingleEliminationCount(participants.length, bracketSize);
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
          <strong>{participants.length} / {bracketSize}</strong>
        </div>
        <PrimaryButton type="button" disabled={!validCount || Boolean(tournament)} onClick={startTournament}>Start Tournament</PrimaryButton>
      </div>

      {!validCount && <p className="bracket-validation">Single Elimination requires 3, 4, 7, 8, 15, 16, 31, or 32 players.</p>}

      {tournament && (
        <div className="bracket-scroll">
          <div className={`pro-bracket bracket-size-${bracketSize}`}>
            {tournament.rounds.map((round) => (
              <section className="bracket-round" key={round.id}>
                <h3>{round.name}</h3>
                <div className="round-matches">
                  {round.matches.map((match) => (
                    <article className={`bracket-match-card ${match.status}`} key={match.id}>
                      <button className="bracket-player-slot" type="button" onClick={() => pickWinner(match.id, match.player1)}>{match.player1 || 'TBD'}</button>
                      <button className="bracket-player-slot" type="button" onClick={() => pickWinner(match.id, match.player2)}>{match.player2 || 'TBD'}</button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function GauntletLobby({ room }) {
  return <BattleRoyaleLobby room={room} />;
}

export function RulesPanel({ mode }) {
  const modeRules = {
    'battle-royale': ['Everyone receives the same problem set.', 'Highest score wins.', 'Penalty breaks ties.'],
    'team-duel': ['Players join Team A or Team B.', 'Uneven teams are allowed.', 'Team score decides the winner.'],
    'single-elimination': ['Valid counts only.', 'Winners advance.', 'Final winner is champion.'],
    'code-gauntlet': ['Strict 1v1.', 'Solve to unlock next problem.', 'Most solved wins.'],
  };

  return (
    <div className="rules-panel">
      {(modeRules[mode] || modeRules['team-duel']).map((rule) => (
        <article key={rule}><span>•</span><p>{rule}</p></article>
      ))}
    </div>
  );
}

export function RoomModePanel({ room, onMoveSlot }) {
  if (room.status === 'active') return null;
  if (room.mode === 'team-duel') return <TeamLobby room={room} onMoveSlot={onMoveSlot} />;
  if (room.mode === 'single-elimination') return <BracketLobby room={room} />;
  if (room.mode === 'code-gauntlet') return <GauntletLobby room={room} />;
  return <BattleRoyaleLobby room={room} />;
}

export function DuelRoomPage() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [room, setRoom] = useState(location.state?.room || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!location.state?.room);
  const [actionLoading, setActionLoading] = useState(false);
  const [syncingProblemId, setSyncingProblemId] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login', { replace: true, state: { returnTo: `/room/${roomCode}` } });
  }, [navigate, roomCode]);

  useEffect(() => {
    let mounted = true;

    const loadRoom = async () => {
      try {
        const [roomData, userData] = await Promise.all([
          duelApi.fetchRoom(roomCode),
          authApi.me().catch(() => null),
        ]);

        if (!mounted) return;
        const fetchedRoom = roomData.room || roomData.data?.room || roomData;
        setRoom(fetchedRoom);
        setCurrentUser(userData?.user || userData?.data?.user || null);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadRoom();
    return () => { mounted = false; };
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode) return undefined;

    return connectDuelRoomSocket(roomCode, {
      onRoomUpdated: ({ room: updatedRoom }) => setRoom(updatedRoom),
      onDuelStarted: ({ room: updatedRoom }) => setRoom(updatedRoom),
      onDuelCancelled: ({ room: updatedRoom }) => setRoom(updatedRoom),
      onSubmissionSynced: ({ room: updatedRoom }) => {
        if (updatedRoom) setRoom((current) => ({ ...current, ...updatedRoom }));
      },
    });
  }, [roomCode]);

  const modeInfo = useMemo(() => {
    return duelRoomModes.find((item) => item.id === room?.mode) || duelRoomModes[0];
  }, [room?.mode]);

  const currentUserId = currentUser?._id || currentUser?.id;
  const currentUsername = currentUser?.username;
  const creatorId = room?.creator?._id || room?.creator?.id || (typeof room?.creator === 'string' ? room?.creator : null);
  const creatorUsername = room?.creator?.username || (typeof room?.creator === 'string' ? room?.creator : null);

  const isCreator = Boolean(
    currentUser && (
      (currentUserId && creatorId && String(creatorId) === String(currentUserId)) ||
      (currentUsername && creatorUsername && currentUsername === creatorUsername) ||
      room?.creator === 'You' ||
      (currentUsername && room?.creator === currentUsername)
    )
  );

  const isParticipant = Boolean(
    currentUser && room?.participants?.some((p) => {
      const pUserId = p.user?._id || p.user?.id || p.user;
      return (currentUserId && pUserId && String(pUserId) === String(currentUserId)) ||
             (currentUsername && p.username === currentUsername);
    })
  );

  const teamAPlayers = room?.participants?.filter((p) => p.team === 'A') || [];
  const teamBPlayers = room?.participants?.filter((p) => p.team === 'B') || [];
  const hasPlayersInEitherTeam = teamAPlayers.length > 0 || teamBPlayers.length > 0 || (room?.participants?.length || 0) > 0;

  const canStartContest = (isCreator || isParticipant || !currentUser) && hasPlayersInEitherTeam;

  const moveToSlot = async (team, slot) => {
    setActionLoading(true);
    setError('');

    try {
      const response = await duelApi.moveTeamSlot({ roomCode, team, slot });
      const updatedRoom = response.room || response.data?.room || response;
      setRoom(updatedRoom);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const startContest = async () => {
    setActionLoading(true);
    setError('');

    try {
      const response = await duelApi.startContest({ roomCode });
      const updatedRoom = response.room || response.data?.room || response;
      setRoom(updatedRoom);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const syncProblem = async (problemId) => {
    setSyncingProblemId(problemId);
    setError('');

    try {
      const response = await duelApi.syncProblemSubmissions({ roomCode, problemId });
      const updatedRoom = response?.room || response?.data?.room;
      if (updatedRoom) setRoom((current) => ({ ...current, ...updatedRoom }));
      const refreshed = await duelApi.fetchRoom(roomCode);
      setRoom(refreshed.room || refreshed.data?.room || refreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncingProblemId('');
    }
  };

  if (loading) {
    return <DuelPageShell eyebrow="DUEL LOBBY" title="Loading Room" subtitle="Fetching the latest room state..." />;
  }

  if (!room) {
    return <DuelPageShell eyebrow="DUEL LOBBY" title="Room Not Found" subtitle={error || 'Unable to load this duel room.'} />;
  }

  return (
    <DuelPageShell
      eyebrow={room.status === 'active' ? 'LIVE CONTEST' : 'DUEL LOBBY'}
      title={`${modeInfo.title} ${room.status === 'active' ? 'Arena' : 'Lobby'}`}
      subtitle="Room state updates in real time as players join, move teams, start contests, and sync Codeforces submissions."
    >
      <div className="room-layout">
        <aside className="room-sidebar">
          <div className="room-code-card">
            <span>Room Code</span>
            <strong>{room.roomCode}</strong>
            <div className="room-action-row">
              <SecondaryButton onClick={() => navigator.clipboard.writeText(room.roomCode)}>Copy Room Code</SecondaryButton>
            </div>
          </div>

          <RoomMetaCard label="Creator" value={room.creator?.username || 'Host'} />
          <RoomMetaCard label="Game Mode" value={modeInfo.title} />
          <RoomMetaCard label="Players" value={`${room.participants?.length || 0} joined`} />
          <RoomMetaCard label="Status" value={room.status} />
          <RoomMetaCard label="Duration" value={`${room.settings?.durationMinutes} min`} />
          <RoomMetaCard label="Questions" value={room.settings?.questionCount} />
          <RoomMetaCard label="Difficulty" value={`${room.settings?.difficultyMin}-${room.settings?.difficultyMax}`} />
        </aside>

        <section className="room-main-panel">
          <div className="room-status-bar">
            <div>
              <span>{room.status === 'active' ? 'Contest Active' : 'Ready Status'}</span>
              <strong>
                {room.winner
                  ? `${room.winner.username} won`
                  : room.status === 'active'
                  ? 'Solve on Codeforces, then sync submissions'
                  : hasPlayersInEitherTeam
                  ? 'Ready to start contest'
                  : 'Waiting for players to join'}
              </strong>
            </div>

            <div className="room-action-row">
              <SecondaryButton onClick={() => navigate('/')}>Leave Room</SecondaryButton>
              <SecondaryButton onClick={() => setRulesOpen(true)}>Rules</SecondaryButton>
              {room.status === 'waiting' && (
                <PrimaryButton type="button" loading={actionLoading} disabled={!canStartContest} onClick={startContest}>
                  Start Contest
                </PrimaryButton>
              )}
            </div>
          </div>

          {error && <div className="backend-error">{error}</div>}

          {room.status === 'active' ? (
            <ActiveContestPanel room={room} onSyncProblem={syncProblem} syncingProblemId={syncingProblemId} />
          ) : (
            <RoomModePanel room={room} onMoveSlot={moveToSlot} />
          )}
        </section>
      </div>

      <Modal open={rulesOpen} title={`${modeInfo.title} Rules`} onClose={() => setRulesOpen(false)}>
        <RulesPanel mode={room.mode} />
      </Modal>
    </DuelPageShell>
  );
}