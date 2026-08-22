import React from 'react';
import heroImage from '../assets/bb.png';
import { features, modes } from '../data/appData';
import { PageTransition } from '../components/common';
import { Icon, ProtectedDuelLink } from '../components/layout';

export function HomePage() {
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

        {/* <aside className="stats">
          {stats.map(([label, value]) => (
            <div className="stat" key={label}>
              <span className="stat-line" />
              <p>{label}</p>
              <strong>{value}</strong>
            </div>
          ))}
        </aside> */}
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
        <p className="modes-note">
          <span>Currently, only N vs N Team Duel is playable.</span> Stay tuned - more game modes are on the way.
        </p>
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