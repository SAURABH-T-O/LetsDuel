import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PrimaryButton, SecondaryButton, PageTransition } from '../common';
import { passwordRules, getPasswordStrength } from '../../utils/password';

export function PasswordInput({ label, value, onChange, error, actions, ...props }) {
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

export function PasswordChecklist({ password }) {
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

export function PasswordStrength({ password }) {
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

export function AuthCard({ eyebrow, title, subtitle, children, footer }) {
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

export function VerificationCard({
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
