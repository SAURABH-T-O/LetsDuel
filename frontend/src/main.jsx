import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import heroImage from './assets/bb.png';

const navItems = ['Home', 'How It Works', 'Modes', 'Log-In'];

// you will find modes function under the name of features

const stats = [
  ['DUELS PLAYED', '10K+'],
  ['ACTIVE CODERS', '5K+'],
  ['PROBLEMS SOLVED', '50K+'],
];

const features = [
  ['Real-time Duels', 'Compete head-to-head in real-time.', 'bolt'],
  ['Your IDE', 'Code in the IDE you love and submit.', 'code'],
  ['First to AC Wins', 'Whoever solves and gets accepted first, wins.', 'cup'],
  ['No Distractions', 'Clean. Focused. Built for coders.', 'shield'],
];
const modes = [
  {
    title: 'Battle Royale',
    tag: 'Contest Mode',
    meta: 'N Players',
    text: 'Any number of coders enter one contest. Problems are scored like Codeforces, with points, penalties, and a live leaderboard.',
    points: ['Codeforces-style scoring', 'Live ranking', 'Best for large contests'],
  },
  {
    title: 'N vs N Team Duel',
    tag: 'Team Mode',
    meta: '1v1 to 8v8',
    text: 'Team A battles Team B. Players choose a side, and team sizes can be uneven for handicap duels like 1v6, 3v2, or 8v8.',
    points: ['Choose Team A or B', 'Handicap supported', 'Max 8 vs 8'],
  },
  {
    title: 'Single Elimination',
    tag: 'Bracket Mode',
    meta: '4 / 8 / 16 / 32',
    text: 'Players compete through a knockout bracket. Winners advance round by round until only one champion remains.',
    points: ['Fixed bracket sizes', 'Round-by-round progress', 'One final champion'],
  },
  {
    title: 'Random Matchmaking',
    tag: 'Queue Mode',
    meta: 'Auto Pairing',
    text: 'Coders join a lobby and LetsDuel automatically pairs them. Random matchmaking can also be used to seed bracket tournaments.',
    points: ['Lobby based', 'Automatic pairing', 'Works with brackets'],
  },
];

function Icon({ type }) {
  if (type === 'bolt')
    return (
      <svg viewBox="0 0 42 52">
        <path d="M24.8 2 5.9 29h14.6l-3.3 21L36.6 20H22.3L24.8 2Z" />
      </svg>
    );

  if (type === 'code')
    return (
      <svg viewBox="0 0 58 42">
        <path d="M20.5 4 4 21l16.5 17M37.5 4 54 21 37.5 38M31.8 1l-6.4 40" />
      </svg>
    );

  if (type === 'cup')
    return (
      <svg viewBox="0 0 52 52">
        <path d="M14 5h24v11c0 8.8-4.8 16-12 16S14 24.8 14 16V5Z" />
        <path d="M14 11H6v5c0 6.1 3.9 10 10.3 10M38 11h8v5c0 6.1-3.9 10-10.3 10M26 32v9M17 47h18" />
      </svg>
    );

  return (
    <svg viewBox="0 0 48 52">
      <path d="M24 4 42 10v14c0 11.2-7.3 18.6-18 24C13.3 42.6 6 35.2 6 24V10l18-6Z" />
      <path d="m16.5 26 5 5.1 10.5-12" />
    </svg>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <a className="brand" href="#">
        <span className="brand-word">
          Lets<span>Duel</span>
        </span>
      </a>

      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        <span />
        <span />
        <span />
      </button>

    <nav className={`nav-links ${open ? 'is-open' : ''}`}>
      {navItems.map((item, index) => (
        <a
          key={item}
          className={index === 0 ? 'active' : ''}
          href={
            item === 'How It Works'
              ? '#how-it-works'
              : item === 'Modes'
                ? '#modes'
                : '#'
          }
          onClick={(event) => {
            if (item === 'How It Works' || item === 'Modes') {
              event.preventDefault();
              document
                .getElementById(item === 'How It Works' ? 'how-it-works' : 'modes')
                ?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {item}
        </a>
      ))}
    </nav>

      <div className={`nav-actions ${open ? 'is-open' : ''}`}>
        <a className="signin" href="#">
          Sign In
        </a>
        <a className="get-started" href="#">
          Get Started <span>→</span>
        </a>
      </div>
    </header>
  );
}

function App() {
  const glowRef = useRef(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let x = mouseX;
    let y = mouseY;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrame;

    const animate = () => {
      x += (mouseX - x) * 0.12;
      y += (mouseY - y) * 0.12;

      if (glowRef.current) {
        glowRef.current.style.left = `${x}px`;
        glowRef.current.style.top = `${y}px`;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <main className="page-shell">
      <div ref={glowRef} className="cursor-glow" />

      <div className="noise" />

      <Navbar />

      <aside className="page-indicator">
        <div className="section-dots">
          <span className="section-number current">01</span>
          <span className="dot current" />
          <span className="line current" />
          <span className="section-number">02</span>
          <span className="dot" />
          <span className="line" />
          <span className="section-number">03</span>
        </div>

        <div className="scroll-cue">
          <span>SCROLL</span>
          <i />
        </div>
      </aside>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span />
            REAL-TIME CODING DUELS
          </p>

          <h1>
            <span>Code.</span>
            <span className="red">Duel.</span>
            <span>Conquer.</span>
          </h1>

          <p className="intro">
            Challenge your friends in real-time coding duels.
            <br />
            Same problem. Same time.
            <br />
            First to get <strong>AC</strong> wins.
          </p>

          <div className="hero-actions">
            <a className="primary-cta" href="#">
              Create Duel Room
            </a>

            <a className="secondary-cta" href="#">
              Join Duel Room
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-glow" />

          <div className="particles">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>

          <img src={heroImage} alt="" className="code-mark" />

          <div className="ac-badge">
            <span>AC</span>
          </div>
        </div>

        <aside className="stats">
          {stats.map(([label, value]) => (
            <div className="stat" key={label}>
              <span className="stat-line" />
              <p>{label}</p>
              <strong>{value}</strong>
            </div>
          ))}
        </aside>
      </section>

      
      <section className="how-it-works" id="how-it-works">
        <div className="section-heading">
          <span></span>
          <p>HOW IT WORKS</p>
        </div>

        <h2>
          Duel in <span>5 Steps</span>
        </h2>

        <div className="steps-grid">
          <article className="step-card">
            <strong>01</strong>
            <h3>Create or Join a Duel</h3>
            <p>
              Invite your friends or share a duel link. Everyone joins the same room
              and gets ready to compete.
            </p>
          </article>

          <article className="step-card">
            <strong>02</strong>
            <h3>Pick the Challenge</h3>
            <p>
              Choose the difficulty and topic, or let the system decide randomly.
              LetsDuel selects a Codeforces problem that none of the participants
              have solved before.
            </p>
          </article>

          <article className="step-card">
            <strong>03</strong>
            <h3>Start the Duel</h3>
            <p>
              Once everyone has joined, click Start. A countdown begins, and all
              participants receive the same problem at the exact same time.
            </p>
          </article>

          <article className="step-card">
            <strong>04</strong>
            <h3>Code & Submit</h3>
            <p>
              Solve the problem on Codeforces. LetsDuel tracks submissions and updates
              each player’s progress in real time.
            </p>
          </article>

          <article className="step-card step-card-wide">
            <strong>05</strong>
            <h3>Winner Announced</h3>
            <p>
              The first participant to make a valid accepted submission wins. If
              multiple players solve the problem, the fastest accepted submission
              takes the victory.
            </p>
          </article>
        </div>
      </section>

    <section className="modes-section" id="modes">
  <div className="section-heading">
    <span></span>
    <p>DUEL MODES</p>
  </div>

  <h2>
    Pick the <span>Rules of War</span>
  </h2>

  <div className="modes-showcase">
    {modes.map((mode, index) => (
      <article className="mode-panel" key={mode.title}>
        <div className="mode-index">{String(index + 1).padStart(2, '0')}</div>

        <div className="mode-content">
          <div className="mode-topline">
            <span>{mode.tag}</span>
            <b>{mode.meta}</b>
          </div>

          <h3>{mode.title}</h3>
          <p>{mode.text}</p>

          <ul>
            {mode.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </article>
    ))}
  </div>
</section>
      <section id="how-it-works" className="feature-strip">
        {features.map(([title, text, icon]) => (
          <article className="feature-card" key={title}>
            <div className="feature-icon">
              <Icon type={icon} />
            </div>

            <div>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="feature-underline" />
            </div>
          </article>
        ))}
      </section>

      <footer className="footer-line">
        <span>BUILT FOR CODERS.</span>
        <b>/</b>
        <span>MADE FOR COMPETITION.</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);