import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function PageTransition({ children }) {
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

export function LoadingSpinner() {
  return <span className="loading-spinner" aria-hidden="true" />;
}

export function Toast({ message, type = 'success', onClose }) {
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

export function Modal({ open, title, children, onClose }) {
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

export function PrimaryButton({ children, loading = false, disabled = false, ...props }) {
  return (
    <button className="auth-primary-button" disabled={disabled || loading} {...props}>
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }) {
  return (
    <button className="auth-secondary-button" type="button" {...props}>
      {children}
    </button>
  );
}

export function InputField({ label, error, className = '', ...props }) {
  return (
    <label className={`auth-field ${className}`}>
      <span>{label}</span>
      <input {...props} />
      {error && <small>{error}</small>}
    </label>
  );
}
