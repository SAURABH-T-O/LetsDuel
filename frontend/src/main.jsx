import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import heroImage from './assets/bb.png';

const navItems = ['Home', 'How It Works', 'Features', 'Duel'];

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
          <a key={item} className={index === 0 ? 'active' : ''} href="#">
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
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);