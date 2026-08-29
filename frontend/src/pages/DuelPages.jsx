import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { demoPlayers } from '../data/appData';
import { duelApi } from '../api';
import { isAuthenticated } from '../utils/session';
import {
  Modal,
  PageTransition,
  PrimaryButton,
  SecondaryButton,
} from '../components/common';

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
    <button
      className={`choice-pill ${active ? 'active' : ''}`}
      type="button"
      onClick={onClick}
    >
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
    onlyUnsolved: true,
    duration: '30',
    customDuration: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', {
        replace: true,
        state: { returnTo: '/create-duel' },
      });
    }
  }, [navigate]);

  const duration =
    settings.duration === 'custom'
      ? settings.customDuration
      : settings.duration;

  const createRoom = async () => {
    if (!duration || Number(duration) <= 0) {
      setError('Choose a valid contest duration.');
      return;
    }

    const questionCount = Number(settings.questionCount);
    const difficultyMin = Number(settings.difficultyMin);
    const difficultyMax = Number(settings.difficultyMax);

    if (!questionCount || questionCount < 1 || questionCount > 50) {
      setError('Enter a number of questions between 1 and 50.');
      return;
    }

    if (
      !difficultyMin ||
      !difficultyMax ||
      difficultyMin < 800 ||
      difficultyMin > difficultyMax
    ) {
      setError('Enter a valid difficulty range.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await duelApi.createRoom({
        mode: 'team-duel',
        settings: {
          questionCount,
          difficultyMin,
          difficultyMax,
          durationMinutes: Number(duration),
          onlyUnsolved: settings.onlyUnsolved,
        },
      });

      const createdRoomData =
        response?.data?.room ||
        response?.room ||
        response?.data ||
        response;

      const room = {
        roomCode: createdRoomData.roomCode,
        creator:
          createdRoomData.creator?.username ||
          createdRoomData.creator ||
          'You',
        mode: 'team-duel',
        settings: {
          questionCount,
          difficultyMin,
          difficultyMax,
          duration: Number(duration),
          onlyUnsolved: settings.onlyUnsolved,
        },
      };

      if (!room.roomCode) {
        throw new Error('Room code was not returned by the server.');
      }

      setCreatedRoom(room);
    } catch (err) {
      setError(
        err.message || 'Failed to create room. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const enterRoom = () => {
    if (!createdRoom?.roomCode) return;

    navigate(`/room/${createdRoom.roomCode}`, {
      state: createdRoom,
    });
  };

  return (
    <DuelPageShell
      eyebrow="CREATE DUEL"
      title="Create Team Duel Room"
      subtitle="Configure the contest, create your N vs N room, and share the room code with your teammates and opponents."
    >
      <div className="duel-builder">
        <div className="duel-steps">
          <button
            className={step === 1 ? 'active' : ''}
            type="button"
            onClick={() => setStep(1)}
          >
            <span>01</span> Contest Settings
          </button>

          <button
            className={step === 2 ? 'active' : ''}
            type="button"
            onClick={() => setStep(2)}
          >
            <span>02</span> Team Duel
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
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      questionCount: event.target.value,
                    })
                  }
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
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        difficultyMin: event.target.value,
                      })
                    }
                    placeholder="Min rating"
                  />

                  <input
                    className="duel-custom-input"
                    type="number"
                    min="800"
                    step="100"
                    value={settings.difficultyMax}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        difficultyMax: event.target.value,
                      })
                    }
                    placeholder="Max rating"
                  />
                </div>

                <p className="config-hint">
                  LetsDuel will select questions whose ratings stay inside
                  this range.
                </p>
              </div>

              <label className="duel-checkbox">
                <input
                  type="checkbox"
                  checked={settings.onlyUnsolved}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      onlyUnsolved: event.target.checked,
                    })
                  }
                />

                <span>
                  Include only questions that participating users have NOT
                  solved before
                </span>
              </label>

              <div className="config-group">
                <h3>Contest Duration</h3>

                <div className="choice-grid difficulty-grid">
                  {['15', '30', '45', '60', '90', 'custom'].map((item) => (
                    <ChoicePill
                      key={item}
                      active={settings.duration === item}
                      onClick={() =>
                        setSettings({
                          ...settings,
                          duration: item,
                        })
                      }
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
                    value={settings.customDuration}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        customDuration: event.target.value,
                      })
                    }
                    placeholder="Custom minutes"
                  />
                )}
              </div>

              <PrimaryButton
                type="button"
                onClick={() => setStep(2)}
              >
                Continue to Team Duel
              </PrimaryButton>
            </motion.div>
          ) : (
            <motion.div
              className="duel-config-card"
              key="team-duel"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
            >
              <div className="room-mode-grid">
                <div className="room-mode-card active">
                  <span>TEAM MODE</span>
                  <h3>N vs N Team Duel</h3>

                  <p>
                    Create a team-based coding contest where players can
                    join Team A or Team B.
                  </p>

                  <ul>
                    <li>Players can choose their team in the lobby.</li>
                    <li>Uneven teams are allowed.</li>
                    <li>Everyone gets the same problem set.</li>
                    <li>Team performance determines the winner.</li>
                  </ul>
                </div>
              </div>

              <p className="room-mode-note">
                N vs N Team Duel is currently the only available game mode.
              </p>

              {error && (
                <div className="backend-error">
                  {error}
                </div>
              )}

              {createdRoom ? (
                <div className="created-room-card">
                  <span>Room Created</span>

                  <strong>{createdRoom.roomCode}</strong>

                  <p>
                    Your Team Duel room is ready. Share this code with
                    the other players and enter the lobby.
                  </p>

                  <div className="room-action-row">
                    <SecondaryButton
                      onClick={() =>
                        navigator.clipboard.writeText(
                          createdRoom.roomCode,
                        )
                      }
                    >
                      Copy Room Code
                    </SecondaryButton>

                    <PrimaryButton
                      type="button"
                      onClick={enterRoom}
                    >
                      Enter Lobby
                    </PrimaryButton>
                  </div>
                </div>
              ) : (
                <div className="room-action-row">
                  <SecondaryButton
                    onClick={() => setStep(1)}
                  >
                    Back
                  </SecondaryButton>

                  <PrimaryButton
                    type="button"
                    loading={loading}
                    onClick={createRoom}
                  >
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
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingRoom, setFetchingRoom] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', {
        replace: true,
        state: { returnTo: '/join-duel' },
      });
    }
  }, [navigate]);

  const normalizedCode = roomCode.toUpperCase();

  const validCode = /^[A-Z0-9]{5}$/.test(normalizedCode);

  const handleCodeChange = async (value) => {
    const nextCode = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 5);

    setRoomCode(nextCode);
    setError('');
    setCreator('');
    setRoom(null);

    if (nextCode.length !== 5) return;

    setFetchingRoom(true);

    try {
      const response = await duelApi.fetchRoom(nextCode);

      const roomData =
        response?.data?.room ||
        response?.room ||
        response?.data ||
        response;

      setRoom(roomData);
      setCreator(
        roomData?.creator?.username ||
          roomData?.creator ||
          '',
      );
    } catch (err) {
      setError(
        err.message ||
          'Unable to find this room. Please check the code.',
      );
    } finally {
      setFetchingRoom(false);
    }
  };

  const joinRoom = async (event) => {
    event.preventDefault();

    if (!validCode) {
      setError(
        'Enter a valid 5-character alphanumeric duel code.',
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await duelApi.joinRoom(normalizedCode);

      const joinedRoom =
        response?.data?.room ||
        response?.room ||
        response?.data ||
        room;

      navigate(`/room/${normalizedCode}`, {
        state: {
          roomCode: normalizedCode,
          creator:
            joinedRoom?.creator?.username ||
            joinedRoom?.creator ||
            creator ||
            'Unknown',
          mode: 'team-duel',
          settings: joinedRoom?.settings || {
            questionCount: 5,
            difficultyMin: 900,
            difficultyMax: 1300,
            duration: 45,
            onlyUnsolved: true,
          },
          joined: true,
        },
      });
    } catch (err) {
      setError(
        err.message ||
          'Failed to join room. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DuelPageShell
      eyebrow="JOIN DUEL"
      title="Join Team Duel Room"
      subtitle="Enter the shared duel code to join the N vs N Team Duel lobby."
    >
      <form
        className="join-room-card"
        onSubmit={joinRoom}
      >
        <div className="creator-preview">
          <span>Creator</span>

          <strong>
            {fetchingRoom
              ? 'Finding room...'
              : creator ||
                'Enter a room code to fetch creator'}
          </strong>
        </div>

        <label className="duel-code-field">
          <span>Enter 5-character Duel Code</span>

          <input
            value={roomCode}
            onChange={(event) =>
              handleCodeChange(event.target.value)
            }
            placeholder="A7X2P"
            maxLength="5"
          />
        </label>

        {room && !error && (
          <div className="created-room-card">
            <span>Room Found</span>

            <strong>
              {room.roomCode || normalizedCode}
            </strong>

            <p>
              N vs N Team Duel room is ready to join.
            </p>
          </div>
        )}

        {error && (
          <div className="backend-error">
            {error}
          </div>
        )}

        <PrimaryButton
          type="submit"
          loading={loading}
          disabled={!validCode || fetchingRoom}
        >
          Join Team Duel
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
  const [teamA, setTeamA] = useState([
    'You',
    'dp_knight',
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [teamB, setTeamB] = useState([
    'bit_coder',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const moveToSlot = (team, index) => {
    const nextA = teamA.map((player) =>
      player === 'You' ? '' : player,
    );

    const nextB = teamB.map((player) =>
      player === 'You' ? '' : player,
    );

    if (team === 'A' && !nextA[index]) {
      nextA[index] = 'You';
    }

    if (team === 'B' && !nextB[index]) {
      nextB[index] = 'You';
    }

    setTeamA(nextA);
    setTeamB(nextB);
  };

  const renderSlot = (player, index, team) => (
    <button
      className={`team-slot ${player ? 'filled' : ''}`}
      key={`${team}-${index}`}
      type="button"
      onClick={() =>
        !player && moveToSlot(team, index)
      }
    >
      {player || 'Empty Slot'}
    </button>
  );

  return (
    <div className="team-lobby">
      <div className="room-tip">
        Tip: You can change your team by clicking any empty
        slot before the contest starts.
      </div>

      <div className="team-columns">
        <section>
          <h3>Team A</h3>

          {teamA.map((player, index) =>
            renderSlot(player, index, 'A'),
          )}
        </section>

        <section>
          <h3>Team B</h3>

          {teamB.map((player, index) =>
            renderSlot(player, index, 'B'),
          )}
        </section>
      </div>
    </div>
  );
}

export function RulesPanel() {
  const rules = [
    'Players join Team A or Team B before the contest starts.',
    'Uneven teams are allowed.',
    'Every player receives the same problem set.',
    'The team score is calculated from the problems solved by team members.',
    'The team with the higher final score wins.',
  ];

  return (
    <div className="rules-panel">
      {rules.map((rule) => (
        <article key={rule}>
          <span>•</span>
          <p>{rule}</p>
        </article>
      ))}
    </div>
  );
}

export function DuelRoomPage() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const [room, setRoom] = useState(() => ({
    roomCode,
    creator: location.state?.creator || 'You',
    mode: 'team-duel',
    settings: location.state?.settings || {
      questionCount: 5,
      difficultyMin: 900,
      difficultyMax: 1300,
      duration: 45,
      onlyUnsolved: true,
    },
  }));

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', {
        replace: true,
        state: {
          returnTo: `/room/${roomCode}`,
        },
      });

      return;
    }

    const loadRoom = async () => {
      try {
        const response = await duelApi.fetchRoom(roomCode);

        const roomData =
          response?.data?.room ||
          response?.room ||
          response?.data ||
          response;

        if (roomData) {
          setRoom((current) => ({
            ...current,
            ...roomData,
            roomCode: roomData.roomCode || roomCode,
            mode: 'team-duel',
            creator:
              roomData.creator?.username ||
              roomData.creator ||
              current.creator,
            settings:
              roomData.settings ||
              current.settings,
          }));
        }
      } catch {
        // Keep the room data passed through navigation state.
      }
    };

    loadRoom();
  }, [navigate, roomCode]);

  const startContest = async () => {
    setLoading(true);

    try {
      await duelApi.startContest(roomCode);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DuelPageShell
      eyebrow="TEAM DUEL LOBBY"
      title="N vs N Team Duel"
      subtitle="Choose your team, review the contest settings, and wait for the creator to start the duel."
    >
      <div className="room-layout">
        <aside className="room-sidebar">
          <div className="room-code-card">
            <span>Room Code</span>

            <strong>{room.roomCode}</strong>

            <div className="room-action-row">
              <SecondaryButton
                onClick={() =>
                  navigator.clipboard.writeText(
                    room.roomCode,
                  )
                }
              >
                Copy Room Code
              </SecondaryButton>

              <SecondaryButton
                onClick={() =>
                  navigator.share?.({
                    title: 'LetsDuel Team Room',
                    text: room.roomCode,
                  })
                }
              >
                Share Room
              </SecondaryButton>
            </div>
          </div>

          <RoomMetaCard
            label="Creator"
            value={room.creator}
          />

          <RoomMetaCard
            label="Game Mode"
            value="N vs N Team Duel"
          />

          <RoomMetaCard
            label="Players"
            value={`${demoPlayers.length + 1} joined`}
          />

          <RoomMetaCard
            label="Duration"
            value={`${room.settings.duration || room.settings.durationMinutes} min`}
          />

          <RoomMetaCard
            label="Questions"
            value={room.settings.questionCount}
          />

          <RoomMetaCard
            label="Difficulty"
            value={`${room.settings.difficultyMin}-${room.settings.difficultyMax}`}
          />
        </aside>

        <section className="room-main-panel">
          <div className="room-status-bar">
            <div>
              <span>Ready Status</span>

              <strong>
                Waiting for creator to start
              </strong>
            </div>

            <div className="room-action-row">
              <SecondaryButton
                onClick={() => navigate('/')}
              >
                Leave Room
              </SecondaryButton>

              <SecondaryButton
                onClick={() => setRulesOpen(true)}
              >
                Rules
              </SecondaryButton>

              <PrimaryButton
                type="button"
                loading={loading}
                onClick={startContest}
              >
                Start Contest
              </PrimaryButton>
            </div>
          </div>

          <TeamLobby />
        </section>
      </div>

      <Modal
        open={rulesOpen}
        title="N vs N Team Duel Rules"
        onClose={() => setRulesOpen(false)}
      >
        <RulesPanel />
      </Modal>
    </DuelPageShell>
  );
}