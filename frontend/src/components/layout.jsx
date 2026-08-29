import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supportLinks } from '../data/appData';
import { clearAuthSession, getAuthUser, isAuthenticated } from '../utils/session';
import { authApi } from '../api';

export function SupportDropdown({ closeMenu }) {
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

export function Icon({ type }) {
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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const authed = isAuthenticated();
  const user = getAuthUser();

  const handleLogout = async () => {
    setOpen(false);
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearAuthSession();
    navigate('/');
  };

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
        {authed ? (
          <>
            <span className="nav-user-badge">
              <span className="user-icon">👤</span>
              <span className="user-name">{user?.username || 'Challenger'}</span>
            </span>
            <button
              type="button"
              className="signout-btn"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link className="signin" to="/login" onClick={() => setOpen(false)}>
              Sign In
            </Link>
            <Link className="get-started" to="/signup" onClick={() => setOpen(false)}>
              Get Started <span>→</span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export function ProtectedDuelLink({ to, className, children }) {
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
