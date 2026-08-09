import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './styles.css';
import heroImage from './assets/bb.png';

const supportLinks = [
  { label: 'Report Bug', icon: '🐞', path: '/support/report-bug' },
  { label: 'Contact Us', icon: '📞', path: '/support/contact' },
  { label: 'FAQs', icon: '❓', path: '/support/faqs' },
];

const issueCategories = [
  'Website Bug',
  'Matchmaking',
  'Code Execution',
  'Leaderboard',
  'Account/Login',
  'Performance Issue',
  'UI Issue',
  'Other',
];

const browsers = ['Chrome', 'Firefox', 'Edge', 'Safari', 'Brave', 'Other'];

const contactSubjects = [
  'General Question',
  'Account Help',
  'Feature Request',
  'Partnership',
  'Feedback',
  'Technical Support',
];

const contactCards = [
  ['📧', 'Email Support', 'support@letsduel.com'],
  ['💼', 'Business Inquiries', 'business@letsduel.com'],
  ['💬', 'Discord Community', 'Join our Discord server to connect with other competitive programmers.'],
  ['🐦', 'Twitter / X', 'Follow LetsDuel for updates and announcements.'],
  ['💡', 'Feature Requests', 'Suggest new ideas to improve LetsDuel.'],
  ['📍', 'Location', 'India'],
];

const faqGroups = [
  {
    title: 'Account',
    items: [
      ['How do I create an account?', 'Click Get Started and register using your email or Google account.'],
      ['I forgot my password.', 'Use the Forgot Password option on the login page.'],
      ['Can I change my username?', 'Yes, from your profile settings.'],
      ['Is my account free?', 'Yes. Creating an account is completely free.'],
    ],
  },
  {
    title: 'Duels',
    items: [
      ['How does a duel work?', 'You and your opponent receive the same coding problems and compete to solve them within the time limit.'],
      ['How is the winner decided?', 'Based on problems solved, penalty time, and submission time in case of ties.'],
      ['Can I challenge my friends?', 'Yes. Send them a duel invitation link.'],
      ['Can I play random opponents?', 'Yes. LetsDuel supports public matchmaking.'],
    ],
  },
  {
    title: 'Coding',
    items: [
      ['Which coding platforms are supported?', 'Currently LeetCode is supported, with more integrations planned.'],
      ['Which programming languages can I use?', 'Any language supported by the coding platform.'],
      ['Does LetsDuel judge my code?', "LetsDuel uses the integrated coding platform's online judge."],
    ],
  },
  {
    title: 'Technical Issues',
    items: [
      ["The website isn't loading properly.", 'Refresh the page, clear your browser cache, or try another browser.'],
      ["Code submission isn't working.", 'Refresh the page. If the problem continues, report it through the Report Bug page.'],
      ['I found a bug.', 'Use the Report Bug page and attach a screenshot if possible.'],
      ['My duel disconnected.', 'Refresh the page. Your progress is automatically saved whenever possible.'],
    ],
  },
  {
    title: 'General',
    items: [
      ['Is LetsDuel free?', 'Yes, the core platform is completely free.'],
      ['Can I suggest new features?', 'Yes! Use the Contact Us page and select "Feature Request."'],
      ['Is my coding data secure?', 'Yes. User data is securely stored and never shared without permission.'],
      ['Will more coding platforms be added?', 'Yes. More competitive programming platforms are planned.'],
    ],
  },
];

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

const duelRoomModes = [
  {
    id: 'battle-royale',
    title: 'Battle Royale',
    tag: 'Unlimited Players',
    description:
      'Any number of coders compete in one contest with the same problem set, increasing difficulty, and Codeforces-style scoring.',
    highlights: ['Live leaderboard', 'Shareable room code', 'Creator starts contest', '-10 per wrong submission'],
  },
  {
    id: 'team-duel',
    title: 'N vs N Team Duel',
    tag: '1v1 to 8v8',
    description:
      'Team A battles Team B. Uneven teams and handicap matches are allowed, and players can switch teams before start.',
    highlights: ['8 slots per team', 'Uneven teams allowed', 'Ready status', 'Click empty slot to move'],
  },
  {
    id: 'single-elimination',
    title: 'Single Elimination',
    tag: '4 / 8 / 16 / 32',
    description:
      'Players join a waiting lobby, then a randomized knockout bracket is created when the participant count is valid.',
    highlights: ['Random bracket', 'Winner advances', 'Champion final', 'Exact player count required'],
  },
  {
    id: 'code-gauntlet',
    title: 'Code Gauntlet',
    tag: 'Strictly 1v1',
    description:
      'Both players unlock the same progressive sequence. Solve one problem to unlock the next before time expires.',
    highlights: ['Progression path', 'Harder each round', 'Penalty tie-breaker', 'Two-player duel'],
  },
];

const demoPlayers = [
  'tourist_shadow', 'dp_knight', 'bit_coder', 'greedy_master', 'stack_wizard', 'array_runner',
  'binary_sage', 'graph_ninja', 'heap_hunter', 'mod_math', 'prefix_pro', 'segment_tree',
  'lazy_prop', 'fft_runner', 'dfs_nomad', 'bfs_blitz', 'rating_1600', 'rating_1800',
  'zero_one_bfs', 'bitmasker', 'flow_master', 'suffix_sorter', 'fenwick_fury', 'two_pointer',
  'constructive_x', 'hash_guard', 'number_theory', 'matrix_mage', 'shortest_path',
  'recursionist', 'final_boss',
];

const passwordRules = [
  { key: 'length', label: 'Minimum 8 characters', test: (value) => value.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { key: 'lower', label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { key: 'number', label: 'One number', test: (value) => /\d/.test(value) },
  { key: 'special', label: 'One special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const wait = (ms = 800) => new Promise((resolve) => window.setTimeout(resolve, ms));

const authApi = {
  login: async () => {
    // TODO: POST /api/auth/login
    await wait();
    return { ok: true };
  },
  signup: async () => {
    // TODO: POST /api/auth/signup
    await wait();
    return { ok: true };
  },
  verifyCodeforcesHandle: async () => {
    // TODO: POST /api/auth/verify-codeforces
    await wait();
    return { ok: true };
  },
  generateResetToken: async () => {
    // TODO: POST /api/auth/forgot-password/token
    await wait();
    return { ok: true };
  },
  verifyIdentity: async () => {
    // TODO: POST /api/auth/forgot-password/verify
    await wait();
    return { ok: true };
  },
  resetPassword: async () => {
    // TODO: POST /api/auth/forgot-password/reset
    await wait();
    return { ok: true };
  },
};

const duelApi = {
  createRoom: async () => {
    // TODO: POST /api/duel-rooms
    await wait();
    return { ok: true, roomCode: makeRoomCode(), creator: 'You' };
  },
  fetchRoom: async (roomCode) => {
    // TODO: GET /api/duel-rooms/:roomCode
    await wait(500);
    return { ok: true, roomCode, creator: 'CodeMaster_21', mode: 'battle-royale' };
  },
  joinRoom: async () => {
    // TODO: POST /api/duel-rooms/:roomCode/join
    await wait();
    return { ok: true };
  },
  startContest: async () => {
    // TODO: POST /api/duel-rooms/:roomCode/start
    await wait();
    return { ok: true };
  },
  cancelRoom: async () => {
    // TODO: DELETE /api/duel-rooms/:roomCode
    await wait();
    return { ok: true };
  },
};

function makeToken(prefix = 'LETSDUEL') {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}_${random}`;
}

function makeRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function isAuthenticated() {
  return window.localStorage.getItem('letsduel-auth-demo') === 'true';
}

function generateStrongPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%^&*_-+=?';
  const all = upper + lower + numbers + special;
  const length = Math.floor(Math.random() * 5) + 14;
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  while (required.length < length) {
    required.push(all[Math.floor(Math.random() * all.length)]);
  }

  return required.sort(() => Math.random() - 0.5).join('');
}

function getPasswordScore(password) {
  return passwordRules.reduce((score, rule) => score + (rule.test(password) ? 1 : 0), 0);
}

function getPasswordStrength(password) {
  const score = getPasswordScore(password);
  if (!password) return { label: 'Weak', className: 'weak', percent: 0 };
  if (score <= 2) return { label: 'Weak', className: 'weak', percent: 25 };
  if (score === 3) return { label: 'Medium', className: 'medium', percent: 50 };
  if (score === 4) return { label: 'Strong', className: 'strong', percent: 75 };
  return { label: 'Excellent', className: 'excellent', percent: 100 };
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function LoadingSpinner() {
  return <span className="loading-spinner" aria-hidden="true" />;
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`toast toast-${type}`}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Modal({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
          >
            <button className="modal-close" type="button" onClick={onClose}>
              ×
            </button>
            <h3>{title}</h3>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PrimaryButton({ children, loading = false, disabled = false, ...props }) {
  return (
    <button className="auth-primary-button" disabled={disabled || loading} {...props}>
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button className="auth-secondary-button" type="button" {...props}>
      {children}
    </button>
  );
}

function InputField({ label, error, className = '', ...props }) {
  return (
    <label className={`auth-field ${className}`}>
      <span>{label}</span>
      <input {...props} />
      {error && <small>{error}</small>}
    </label>
  );
}

function PasswordInput({ label, value, onChange, error, actions, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="password-control">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          {...props}
        />
        <button type="button" onClick={() => setVisible((current) => !current)}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {actions && <div className="password-actions">{actions}</div>}
      {error && <small>{error}</small>}
    </label>
  );
}

function PasswordChecklist({ password }) {
  return (
    <ul className="password-checklist">
      {passwordRules.map((rule) => {
        const valid = rule.test(password);
        return (
          <li className={valid ? 'valid' : 'invalid'} key={rule.key}>
            <span>{valid ? '✓' : '✗'}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

function PasswordStrength({ password }) {
  const strength = getPasswordStrength(password);

  return (
    <div className={`password-strength ${strength.className}`}>
      <div className="strength-topline">
        <span>Password Strength</span>
        <b>{strength.label}</b>
      </div>
      <div className="strength-track">
        <span style={{ width: `${strength.percent}%` }} />
      </div>
    </div>
  );
}

function AuthCard({ eyebrow, title, subtitle, children, footer }) {
  return (
    <PageTransition>
      <section className="auth-page">
        <div className="auth-ambient auth-ambient-one" />
        <div className="auth-ambient auth-ambient-two" />
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="auth-heading">
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{subtitle}</span>
          </div>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </motion.div>
      </section>
    </PageTransition>
  );
}

function VerificationCard({
  token,
  title,
  description,
  verified,
  verifying,
  onCopy,
  onVerify,
}) {
  return (
    <motion.div
      className={`verification-card ${verified ? 'is-verified' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="token-box">
        <span>Verification Token</span>
        <strong>{token}</strong>
      </div>

      <div className="verification-actions">
        <SecondaryButton onClick={onCopy}>Copy Token</SecondaryButton>
        <PrimaryButton type="button" loading={verifying} disabled={verified} onClick={onVerify}>
          {verified ? 'Codeforces Handle Verified' : "I've Submitted the Verification"}
        </PrimaryButton>
      </div>

      <p className="verification-status">
        Verification Status: <b>{verified ? 'Verified ✓' : 'Waiting...'}</b>
      </p>
    </motion.div>
  );
}

function SupportDropdown({ closeMenu }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="support-nav"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="support-trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        Support
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="support-dropdown"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {supportLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  closeMenu();
                  setOpen(false);
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (sectionId) => {
    setOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="navbar">
      <Link className="brand" to="/" onClick={() => window.setTimeout(() => goToSection('home'), 0)}>
        <span className="brand-word">
          Lets<span>Duel</span>
        </span>
      </Link>

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
        <button
          type="button"
          className={location.pathname === '/' ? 'active nav-button' : 'nav-button'}
          onClick={() => goToSection('home')}
        >
          Home
        </button>
        <button type="button" className="nav-button" onClick={() => goToSection('how-it-works')}>
          How It Works
        </button>
        <button type="button" className="nav-button" onClick={() => goToSection('modes')}>
          Modes
        </button>
        <SupportDropdown closeMenu={() => setOpen(false)} />
      </nav>

      <div className={`nav-actions ${open ? 'is-open' : ''}`}>
        <Link className="signin" to="/login" onClick={() => setOpen(false)}>
          Sign In
        </Link>
        <Link className="get-started" to="/signup" onClick={() => setOpen(false)}>
          Get Started <span>→</span>
        </Link>
      </div>
    </header>
  );
}

function ProtectedDuelLink({ to, className, children }) {
  const navigate = useNavigate();

  const handleClick = (event) => {
    event.preventDefault();
    if (!isAuthenticated()) {
      navigate('/login', { state: { returnTo: to } });
      return;
    }
    navigate(to);
  };

  return (
    <a className={className} href={to} onClick={handleClick}>
      {children}
    </a>
  );
}

function HomePage() {
  return (
    <PageTransition>
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

      <section className="hero" id="home">
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
            <ProtectedDuelLink className="primary-cta" to="/create-duel">
              Create Duel Room
            </ProtectedDuelLink>
            <ProtectedDuelLink className="secondary-cta" to="/join-duel">
              Join Duel Room
            </ProtectedDuelLink>
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
            <p>Invite your friends or share a duel link. Everyone joins the same room and gets ready to compete.</p>
          </article>
          <article className="step-card">
            <strong>02</strong>
            <h3>Pick the Challenge</h3>
            <p>Choose the difficulty and topic, or let the system decide randomly. LetsDuel selects a Codeforces problem that none of the participants have solved before.</p>
          </article>
          <article className="step-card">
            <strong>03</strong>
            <h3>Start the Duel</h3>
            <p>Once everyone has joined, click Start. A countdown begins, and all participants receive the same problem at the exact same time.</p>
          </article>
          <article className="step-card">
            <strong>04</strong>
            <h3>Code & Submit</h3>
            <p>Solve the problem on Codeforces. LetsDuel tracks submissions and updates each player's progress in real time.</p>
          </article>
          <article className="step-card step-card-wide">
            <strong>05</strong>
            <h3>Winner Announced</h3>
            <p>The first participant to make a valid accepted submission wins. If multiple players solve the problem, the fastest accepted submission takes the victory.</p>
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

      <section className="feature-strip">
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
    </PageTransition>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [toast, setToast] = useState('');

  const validate = () => {
    const nextErrors = {};
    if (!form.identifier.trim()) nextErrors.identifier = 'Enter your username or Codeforces handle.';
    if (!form.password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    setBackendError('');

    try {
      await authApi.login(form);
      window.localStorage.setItem('letsduel-auth-demo', 'true');
      setToast('Login request completed. Connect backend to continue.');
      window.setTimeout(() => {
        navigate(location.state?.returnTo || '/', { replace: true });
      }, 550);
    } catch {
      setBackendError('Unable to login right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthCard
        eyebrow="WELCOME BACK"
        title="Sign In"
        subtitle="Enter LetsDuel with your username or Codeforces handle."
        footer={
          <>
            Don&apos;t have an account? <Link to="/signup">Get Started</Link>
          </>
        }
      >
        <form className="auth-form" onSubmit={handleLogin}>
          {backendError && <div className="backend-error">{backendError}</div>}
          <InputField
            label="Username OR Codeforces Handle"
            value={form.identifier}
            error={errors.identifier}
            onChange={(event) => setForm({ ...form, identifier: event.target.value })}
          />
          <PasswordInput
            label="Password"
            value={form.password}
            error={errors.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          <div className="auth-row">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(event) => setForm({ ...form, remember: event.target.checked })}
              />
              Remember Me
            </label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          <PrimaryButton type="submit" loading={loading}>
            Login
          </PrimaryButton>
        </form>
      </AuthCard>
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}

function SignupPage() {
  const [form, setForm] = useState({
    handle: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [token] = useState(() => makeToken());
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [toast, setToast] = useState('');

  const passwordValid = useMemo(
    () => passwordRules.every((rule) => rule.test(form.password)),
    [form.password],
  );

  const validate = () => {
    const nextErrors = {};
    if (!form.handle.trim()) nextErrors.handle = 'Enter your Codeforces handle.';
    if (!form.username.trim()) nextErrors.username = 'Choose a username.';
    if (!passwordValid) nextErrors.password = 'Password must satisfy every requirement.';
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';
    if (!verified) nextErrors.verification = 'Verify your Codeforces handle before creating account.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fillGeneratedPassword = () => {
    const password = generateStrongPassword();
    setForm({ ...form, password, confirmPassword: password });
    setToast('Strong password generated.');
  };

  const copyPassword = async () => {
    if (!form.password) return;
    await navigator.clipboard.writeText(form.password);
    setToast('Password copied.');
  };

  const copyToken = async () => {
    await navigator.clipboard.writeText(token);
    setToast('Verification token copied.');
  };

  const verifyHandle = async () => {
    if (!form.handle.trim()) {
      setErrors({ ...errors, handle: 'Enter your Codeforces handle first.' });
      return;
    }
    setVerifying(true);
    await authApi.verifyCodeforcesHandle({ handle: form.handle, token });
    setVerified(true);
    setVerifying(false);
    setToast('Codeforces handle verified.');
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    setBackendError('');

    try {
      await authApi.signup(form);
      setToast('Account creation request completed. Connect backend to continue.');
    } catch {
      setBackendError('Unable to create account right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthCard
        eyebrow="NEW CHALLENGER"
        title="Get Started"
        subtitle="Create your LetsDuel account using your Codeforces identity. No email required."
        footer={
          <>
            Already have an account? <Link to="/login">Sign In</Link>
          </>
        }
      >
        <form className="auth-form" onSubmit={handleSignup}>
          {backendError && <div className="backend-error">{backendError}</div>}
          <InputField
            label="Codeforces Handle"
            value={form.handle}
            error={errors.handle}
            onChange={(event) => {
              setVerified(false);
              setForm({ ...form, handle: event.target.value });
            }}
          />
          <InputField
            label="Username"
            value={form.username}
            error={errors.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
          />
          <PasswordInput
            label="Password"
            value={form.password}
            error={errors.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            actions={
              <>
                <SecondaryButton onClick={fillGeneratedPassword}>Generate Strong Password</SecondaryButton>
                <SecondaryButton onClick={copyPassword}>Copy Password</SecondaryButton>
              </>
            }
          />
          <PasswordStrength password={form.password} />
          <PasswordChecklist password={form.password} />
          <PasswordInput
            label="Confirm Password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
          />

          <VerificationCard
            token={token}
            title="Verify Your Codeforces Handle"
            description="To prove ownership of your Codeforces handle, submit a Compilation Error containing the verification token below. This will not affect your Codeforces rating."
            verified={verified}
            verifying={verifying}
            onCopy={copyToken}
            onVerify={verifyHandle}
          />
          {errors.verification && <div className="backend-error">{errors.verification}</div>}

          <PrimaryButton type="submit" loading={loading} disabled={!verified}>
            Create Account
          </PrimaryButton>
        </form>
      </AuthCard>
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}

function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [token, setToken] = useState('');
  const [identityVerified, setIdentityVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState('');
  const [toast, setToast] = useState('');
  const [done, setDone] = useState(false);

  const passwordValid = useMemo(
    () => passwordRules.every((rule) => rule.test(newPassword)),
    [newPassword],
  );

  const generateResetToken = async () => {
    if (!identifier.trim()) {
      setErrors({ identifier: 'Enter your username or Codeforces handle.' });
      return;
    }
    setLoading('token');
    await authApi.generateResetToken({ identifier });
    setToken(makeToken('LETSDUEL_RESET'));
    setErrors({});
    setLoading('');
    setToast('Reset verification token generated.');
  };

  const verifyIdentity = async () => {
    setLoading('verify');
    await authApi.verifyIdentity({ identifier, token });
    setIdentityVerified(true);
    setLoading('');
    setToast('Identity verified.');
  };

  const fillGeneratedPassword = () => {
    const password = generateStrongPassword();
    setNewPassword(password);
    setConfirmPassword(password);
    setToast('Strong password generated.');
  };

  const copyPassword = async () => {
    if (!newPassword) return;
    await navigator.clipboard.writeText(newPassword);
    setToast('Password copied.');
  };

  const copyToken = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setToast('Verification token copied.');
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!passwordValid) nextErrors.newPassword = 'Password must satisfy every requirement.';
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading('reset');
    await authApi.resetPassword({ identifier, newPassword });
    setLoading('');
    setDone(true);
    setToast('Password reset request completed.');
  };

  return (
    <>
      <AuthCard
        eyebrow="ACCOUNT RECOVERY"
        title="Forgot Password"
        subtitle="Recover access by proving ownership of your Codeforces handle. No email verification needed."
        footer={
          <>
            Remember your password? <Link to="/login">Sign In</Link>
          </>
        }
      >
        {done ? (
          <div className="auth-success-panel">
            <strong>Password Reset ✓</strong>
            <p>Your reset request is complete. Connect the backend to activate the real password update flow.</p>
            <Link to="/login">Return to Sign In</Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={resetPassword}>
            <InputField
              label="Username OR Codeforces Handle"
              value={identifier}
              error={errors.identifier}
              disabled={Boolean(token)}
              onChange={(event) => setIdentifier(event.target.value)}
            />

            {!token && (
              <PrimaryButton type="button" loading={loading === 'token'} onClick={generateResetToken}>
                Verify Identity
              </PrimaryButton>
            )}

            {token && (
              <VerificationCard
                token={token}
                title="Verify Identity"
                description="Submit a Compilation Error on Codeforces containing this token."
                verified={identityVerified}
                verifying={loading === 'verify'}
                onCopy={copyToken}
                onVerify={verifyIdentity}
              />
            )}

            {identityVerified && (
              <>
                <div className="identity-verified">Identity Verified ✓</div>
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  error={errors.newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  actions={
                    <>
                      <SecondaryButton onClick={fillGeneratedPassword}>Generate Strong Password</SecondaryButton>
                      <SecondaryButton onClick={copyPassword}>Copy Password</SecondaryButton>
                    </>
                  }
                />
                <PasswordStrength password={newPassword} />
                <PasswordChecklist password={newPassword} />
                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  error={errors.confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <PrimaryButton type="submit" loading={loading === 'reset'}>
                  Reset Password
                </PrimaryButton>
              </>
            )}
          </form>
        )}
      </AuthCard>
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}

function DuelPageShell({ eyebrow, title, subtitle, children }) {
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

function ChoicePill({ active, children, onClick }) {
  return (
    <button className={`choice-pill ${active ? 'active' : ''}`} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function CreateDuelRoomPage() {
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

function JoinDuelRoomPage() {
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

function RoomMetaCard({ label, value }) {
  return (
    <article className="room-meta-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function TeamLobby() {
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

function BattleRoyaleLobby() {
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

function getRoundNames(bracketSize) {
  if (bracketSize === 4) return ['Semifinals', 'Final'];
  if (bracketSize === 8) return ['Quarterfinals', 'Semifinals', 'Final'];
  if (bracketSize === 16) return ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
  return ['Round 1', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];
}

function shuffleList(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function isValidSingleEliminationCount(participantCount, bracketSize) {
  return participantCount === bracketSize || participantCount === bracketSize - 1;
}

function generateSingleEliminationTournament(participants, bracketSize) {
  const shuffled = shuffleList(participants);
  const hasBye = participants.length === bracketSize - 1;
  const byePlayer = hasBye ? shuffled.splice(Math.floor(Math.random() * shuffled.length), 1)[0] : null;
  const slots = [...shuffled];

  if (byePlayer) {
    const byePairIndex = Math.floor(Math.random() * (bracketSize / 2));
    slots.splice(byePairIndex * 2, 0, byePlayer, 'BYE');
  }

  while (slots.length < bracketSize) slots.push(null);

  const roundNames = getRoundNames(bracketSize);
  const rounds = roundNames.map((name, roundIndex) => {
    const matchCount = bracketSize / 2 ** (roundIndex + 1);
    return {
      id: `round-${roundIndex + 1}`,
      name,
      matches: Array.from({ length: matchCount }, (_, matchIndex) => ({
        id: `r${roundIndex + 1}-m${matchIndex + 1}`,
        round: roundIndex + 1,
        player1: null,
        player2: null,
        score1: 0,
        score2: 0,
        status: 'upcoming',
        winner: null,
        loser: null,
        isBye: false,
        nextMatchId: roundIndex < roundNames.length - 1 ? `r${roundIndex + 2}-m${Math.floor(matchIndex / 2) + 1}` : null,
        nextSlot: matchIndex % 2 === 0 ? 'player1' : 'player2',
        previousMatchIds: [],
      })),
    };
  });

  rounds[0].matches = rounds[0].matches.map((match, index) => {
    const player1 = slots[index * 2];
    const player2 = slots[index * 2 + 1];
    const isBye = player1 === 'BYE' || player2 === 'BYE';
    const winner = isBye ? (player1 === 'BYE' ? player2 : player1) : null;

    return {
      ...match,
      player1,
      player2,
      winner,
      loser: isBye ? 'BYE' : null,
      isBye,
      status: isBye ? 'bye' : player1 && player2 ? 'active' : 'upcoming',
    };
  });

  rounds.forEach((round, roundIndex) => {
    if (roundIndex === 0) return;
    round.matches = round.matches.map((match, matchIndex) => ({
      ...match,
      previousMatchIds: [
        `r${roundIndex}-m${matchIndex * 2 + 1}`,
        `r${roundIndex}-m${matchIndex * 2 + 2}`,
      ],
    }));
  });

  rounds[0].matches.forEach((match) => {
    if (!match.isBye || !match.nextMatchId) return;
    const nextRound = rounds[match.round];
    const nextMatch = nextRound.matches.find((item) => item.id === match.nextMatchId);
    if (nextMatch) nextMatch[match.nextSlot] = match.winner;
  });

  return { bracketSize, participantCount: participants.length, rounds, champion: null, frozen: true };
}

function completeTournamentMatch(tournament, matchId, winner) {
  const rounds = tournament.rounds.map((round) => ({
    ...round,
    matches: round.matches.map((match) => ({ ...match })),
  }));

  let completedMatch;

  rounds.forEach((round) => {
    round.matches = round.matches.map((match) => {
      if (match.id !== matchId) return match;
      const loser = match.player1 === winner ? match.player2 : match.player1;
      completedMatch = { ...match, winner, loser, status: 'completed', score1: match.player1 === winner ? 1 : 0, score2: match.player2 === winner ? 1 : 0 };
      return completedMatch;
    });
  });

  if (completedMatch?.nextMatchId) {
    rounds.forEach((round) => {
      round.matches = round.matches.map((match) => {
        if (match.id !== completedMatch.nextMatchId) return match;
        const nextMatch = { ...match, [completedMatch.nextSlot]: winner };
        if (nextMatch.player1 && nextMatch.player2 && nextMatch.player1 !== 'BYE' && nextMatch.player2 !== 'BYE') {
          nextMatch.status = 'active';
        }
        return nextMatch;
      });
    });
  }

  const finalRound = rounds[rounds.length - 1];
  const finalMatch = finalRound.matches[0];
  const champion = finalMatch?.status === 'completed' ? finalMatch.winner : tournament.champion;

  return { ...tournament, rounds, champion };
}

function BracketMatchCard({ match, onWinner }) {
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

function BracketLobby({ room }) {
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

function GauntletLobby() {
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

function RulesPanel({ mode }) {
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

function RoomModePanel({ room }) {
  const mode = room.mode;
  if (mode === 'team-duel') return <TeamLobby />;
  if (mode === 'single-elimination') return <BracketLobby room={room} />;
  if (mode === 'code-gauntlet') return <GauntletLobby />;
  return <BattleRoyaleLobby />;
}

function DuelRoomPage() {
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

function SupportShell({ eyebrow, title, subtitle, children }) {
  return (
    <PageTransition>
      <section className="support-page">
        <div className="support-hero">
          <p className="eyebrow">
            <span />
            {eyebrow}
          </p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </section>
    </PageTransition>
  );
}

function FormField({ label, children, wide = false }) {
  return (
    <label className={`form-field ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function ReportBugPage() {
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState('');

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
  };

  if (submitted) {
    return (
      <SupportShell
        eyebrow="SUPPORT"
        title="Report a Technical Issue"
        subtitle="Facing a problem? Help us improve LetsDuel by reporting the issue."
      >
        <motion.div className="success-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <strong>✅ Thank you!</strong>
          <p>Your bug report has been submitted successfully.</p>
          <p>Our team will review it and get back to you if needed.</p>
        </motion.div>
      </SupportShell>
    );
  }

  return (
    <SupportShell
      eyebrow="REPORT BUG"
      title="Report a Technical Issue"
      subtitle="Facing a problem? Help us improve LetsDuel by reporting the issue."
    >
      <form className="support-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        <FormField label="Full Name (optional)"><input type="text" /></FormField>
        <FormField label="Email Address"><input type="email" required /></FormField>
        <FormField label="Issue Category"><select required>{issueCategories.map((item) => <option key={item}>{item}</option>)}</select></FormField>
        <FormField label="Page where issue occurred"><input type="text" required /></FormField>
        <FormField label="Problem Description" wide><textarea rows="6" required /></FormField>
        <FormField label="Steps to Reproduce (optional)" wide><textarea rows="4" /></FormField>
        <FormField label="Browser"><select required>{browsers.map((item) => <option key={item}>{item}</option>)}</select></FormField>
        <FormField label="Operating System"><input type="text" required /></FormField>
        <div
          className="upload-zone wide"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files[0]);
          }}
        >
          {preview ? (
            <div className="upload-preview">
              <img src={preview} alt="Uploaded screenshot preview" />
              <button type="button" onClick={() => setPreview('')}>Remove image</button>
            </div>
          ) : (
            <>
              <strong>Upload Screenshot</strong>
              <p>Drag & drop an image here, or browse files.</p>
              <input type="file" accept="image/*" onChange={(event) => handleFile(event.target.files[0])} />
            </>
          )}
        </div>
        <button className="support-submit wide" type="submit">Submit Report</button>
      </form>
    </SupportShell>
  );
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <SupportShell
      eyebrow="CONTACT"
      title="Contact LetsDuel"
      subtitle="Have a question, partnership proposal, feature suggestion, or need help? We'd love to hear from you."
    >
      <div className="contact-grid">
        {contactCards.map(([icon, title, text]) => (
          <article className="contact-card" key={title}>
            <span>{icon}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <form className="support-form contact-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        <FormField label="Name"><input type="text" required /></FormField>
        <FormField label="Email"><input type="email" required /></FormField>
        <FormField label="Subject" wide><select required>{contactSubjects.map((item) => <option key={item}>{item}</option>)}</select></FormField>
        <FormField label="Message" wide><textarea rows="7" placeholder="Write your message..." required /></FormField>
        <button className="support-submit wide" type="submit">Send Message</button>
        {submitted && <p className="form-success wide">Thanks for contacting us! We&apos;ll reply within 24-48 hours.</p>}
      </form>
    </SupportShell>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.article className={`faq-item ${open ? 'is-open' : ''}`} layout>
      <button type="button" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <b>{open ? '−' : '+'}</b>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {answer}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function FAQPage() {
  return (
    <SupportShell
      eyebrow="FAQS"
      title="Frequently Asked Questions"
      subtitle="Find answers to the most common questions about LetsDuel."
    >
      <div className="faq-stack">
        {faqGroups.map((group) => (
          <section className="faq-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.items.map(([question, answer]) => (
              <FAQItem key={question} question={question} answer={answer} />
            ))}
          </section>
        ))}
      </div>
    </SupportShell>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/create-duel" element={<CreateDuelRoomPage />} />
        <Route path="/join-duel" element={<JoinDuelRoomPage />} />
        <Route path="/room/:roomCode" element={<DuelRoomPage />} />
        <Route path="/support/report-bug" element={<ReportBugPage />} />
        <Route path="/support/contact" element={<ContactPage />} />
        <Route path="/support/faqs" element={<FAQPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppLayout() {
  const glowRef = useRef(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let x = mouseX;
    let y = mouseY;
    let animationFrame;

    const handleMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const animate = () => {
      x += (mouseX - x) * 0.12;
      y += (mouseY - y) * 0.12;

      if (glowRef.current) {
        glowRef.current.style.left = `${x}px`;
        glowRef.current.style.top = `${y}px`;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
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
      <AnimatedRoutes />
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<App />);
