import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/placeholders';
import { generateStrongPassword, passwordRules } from '../utils/password';
import { makeToken } from '../utils/session';
import { AuthCard, PasswordChecklist, PasswordInput, PasswordStrength, VerificationCard } from '../components/auth/AuthComponents';
import { InputField, PrimaryButton, SecondaryButton, Toast } from '../components/common';

export function LoginPage() {
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

export function SignupPage() {
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

export function ForgotPasswordPage() {
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
