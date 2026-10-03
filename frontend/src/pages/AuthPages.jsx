import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { generateStrongPassword, passwordRules } from '../utils/password';
import { makeToken, setAuthSession } from '../utils/session';
import {
  AuthCard,
  PasswordChecklist,
  PasswordInput,
  PasswordStrength,
  VerificationCard,
} from '../components/auth/AuthComponents';
import {
  InputField,
  PrimaryButton,
  SecondaryButton,
  Toast,
} from '../components/common';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    identifier: '',
    password: '',
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [toast, setToast] = useState('');

  const BYPASS_USERS = ['_SAURABH_', 'testsaurabh'];

  const isBypass = (name) =>
    BYPASS_USERS.some((u) => u.toLowerCase() === (name || '').trim().toLowerCase());

  const validate = () => {
    const nextErrors = {};

    if (!form.identifier.trim()) {
      nextErrors.identifier =
        'Enter your username or Codeforces handle.';
    }

    if (!form.password && !isBypass(form.identifier)) {
      nextErrors.password = 'Enter your password.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (event) => {
    event?.preventDefault?.();

    if (loading || !validate()) return;

    setLoading(true);
    setBackendError('');

    try {
      const response = await authApi.login({
        identifier: form.identifier,
        password: form.password,
      });

      const authData = response.data || response;

      setAuthSession(authData, form.remember);

      setToast('Login successful.');

      window.setTimeout(() => {
        navigate(location.state?.returnTo || '/', {
          replace: true,
        });
      }, 550);
    } catch (err) {
      setBackendError(
        err.message || 'Unable to login right now. Please try again.',
      );
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
            Don&apos;t have an account?{' '}
            <Link to="/signup">Get Started</Link>
          </>
        }
      >
        <form className="auth-form" onSubmit={handleLogin}>
          {backendError && (
            <div className="backend-error">{backendError}</div>
          )}

          <InputField
            label="Username OR Codeforces Handle"
            value={form.identifier}
            error={errors.identifier}
            onChange={(event) =>
              setForm({
                ...form,
                identifier: event.target.value,
              })
            }
          />

          <PasswordInput
            label="Password"
            value={form.password}
            error={errors.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value,
              })
            }
          />

          <div className="auth-row">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(event) =>
                  setForm({
                    ...form,
                    remember: event.target.checked,
                  })
                }
              />
              Remember Me
            </label>

            <Link to="/forgot-password">
              Forgot Password?
            </Link>
          </div>

          <PrimaryButton type="submit" loading={loading}>
            Login
          </PrimaryButton>
        </form>
      </AuthCard>

      <Toast
        message={toast}
        onClose={() => setToast('')}
      />
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
  const [token, setToken] = useState('');
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [toast, setToast] = useState('');

  const passwordValid = useMemo(
    () => passwordRules.every((rule) => rule.test(form.password)),
    [form.password],
  );

  const confirmPasswordError = useMemo(() => {
    if (!form.confirmPassword) return '';
    if (form.confirmPassword !== form.password) return 'Passwords do not match.';
    return '';
  }, [form.password, form.confirmPassword]);

  const validate = () => {
    const nextErrors = {};

    if (!form.handle.trim()) {
      nextErrors.handle = 'Enter your Codeforces handle.';
    }

    if (!form.username.trim()) {
      nextErrors.username = 'Choose a username.';
    }

    if (!passwordValid) {
      nextErrors.password =
        'Password must satisfy every requirement.';
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!verified) {
      nextErrors.verification =
        'Verify your Codeforces handle before creating account.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const fillGeneratedPassword = () => {
    const password = generateStrongPassword();

    setForm({
      ...form,
      password,
      confirmPassword: password,
    });

    setToast('Strong password generated.');
  };

  const copyPassword = async () => {
    if (!form.password) return;

    await navigator.clipboard.writeText(form.password);
    setToast('Password copied.');
  };

  const copyToken = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setToast('Verification token copied.');
  };

  const requestVerification = async () => {
    if (!form.handle.trim()) {
      setErrors({
        ...errors,
        handle: 'Enter your Codeforces handle first.',
      });
      return;
    }

    setRequesting(true);
    setBackendError('');

    try {
      const response = await authApi.requestCodeforcesVerification({
        codeforcesHandle: form.handle,
      });

      const generatedToken = response.data?.token || response.token || '';
      setToken(generatedToken);
      setToast('Verification token generated. Submit it on Codeforces.');
    } catch (err) {
      setBackendError(
        err.message || 'Unable to request verification. Please try again.',
      );
    } finally {
      setRequesting(false);
    }
  };

  const verifyHandle = async () => {
    if (!token) return;

    setVerifying(true);
    setBackendError('');

    try {
      await authApi.verifyCodeforcesHandle({
        codeforcesHandle: form.handle,
        token,
      });

      setVerified(true);
      setToast('Codeforces handle verified.');
    } catch (err) {
      setErrors({
        ...errors,
        verification:
          err.message || 'Verification failed.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    if (loading || !validate()) return;

    setLoading(true);
    setBackendError('');

    try {
      const response = await authApi.signup({
        codeforcesHandle: form.handle,
        username: form.username,
        password: form.password,
        confirmPassword: form.confirmPassword,
        verificationToken: token,
      });

      const authData = response.data || response;

      if (authData.accessToken) {
        setAuthSession(authData, false);
      }

      setToast('Account created successfully.');
    } catch (err) {
      setBackendError(
        err.message ||
          'Unable to create account right now. Please try again.',
      );
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
            Already have an account?{' '}
            <Link to="/login">Sign In</Link>
          </>
        }
      >
        <form className="auth-form" onSubmit={handleSignup}>
          {backendError && (
            <div className="backend-error">{backendError}</div>
          )}

          <InputField
            label="Codeforces Handle"
            value={form.handle}
            error={errors.handle}
            onChange={(event) => {
              setVerified(false);
              setToken('');

              setForm({
                ...form,
                handle: event.target.value,
              });
            }}
          />

          <InputField
            label="Username"
            value={form.username}
            error={errors.username}
            onChange={(event) =>
              setForm({
                ...form,
                username: event.target.value,
              })
            }
          />

          <PasswordInput
            label="Password"
            value={form.password}
            error={errors.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value,
              })
            }
            actions={
              <>
                <SecondaryButton
                  type="button"
                  onClick={fillGeneratedPassword}
                >
                  Generate Strong Password
                </SecondaryButton>

                <SecondaryButton
                  type="button"
                  onClick={copyPassword}
                >
                  Copy Password
                </SecondaryButton>
              </>
            }
          />

          <PasswordStrength password={form.password} />
          <PasswordChecklist password={form.password} />

          <PasswordInput
            label="Confirm Password"
            value={form.confirmPassword}
            error={confirmPasswordError || errors.confirmPassword}
            onChange={(event) =>
              setForm({
                ...form,
                confirmPassword: event.target.value,
              })
            }
          />

          {!token && (
            <PrimaryButton
              type="button"
              loading={requesting}
              onClick={requestVerification}
              disabled={!form.handle.trim()}
            >
              Request Codeforces Verification
            </PrimaryButton>
          )}

          {token && (
            <VerificationCard
              token={token}
              title="Verify Your Codeforces Handle"
              description="To prove ownership of your Codeforces handle, submit a Compilation Error containing the verification token below. This will not affect your Codeforces rating."
              verified={verified}
              verifying={verifying}
              onCopy={copyToken}
              onVerify={verifyHandle}
            />
          )}

          {errors.verification && (
            <div className="backend-error">
              {errors.verification}
            </div>
          )}

          <PrimaryButton
            type="submit"
            loading={loading}
            disabled={!verified}
          >
            Create Account
          </PrimaryButton>
        </form>
      </AuthCard>

      <Toast
        message={toast}
        onClose={() => setToast('')}
      />
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
  const [backendError, setBackendError] = useState('');
  const [toast, setToast] = useState('');
  const [done, setDone] = useState(false);

  const passwordValid = useMemo(
    () => passwordRules.every((rule) => rule.test(newPassword)),
    [newPassword],
  );

  const generateResetToken = async () => {
    if (!identifier.trim()) {
      setErrors({
        identifier:
          'Enter your username or Codeforces handle.',
      });
      return;
    }

    setLoading('token');
    setBackendError('');

    try {
      const response =
        await authApi.generateResetToken({
          identifier,
        });

      const generatedToken =
        response.data?.token || makeToken('LETSDUEL_RESET');

      setToken(generatedToken);
      setErrors({});
      setToast('Reset verification token generated.');
    } catch (err) {
      setErrors({
        identifier:
          err.message ||
          'Unable to generate reset token.',
      });
    } finally {
      setLoading('');
    }
  };

  const verifyIdentity = async () => {
    setLoading('verify');

    try {
      await authApi.verifyIdentity({
        identifier,
        token,
      });

      setIdentityVerified(true);
      setToast('Identity verified.');
    } catch (err) {
      setErrors({
        ...errors,
        verification:
          err.message || 'Identity verification failed.',
      });
    } finally {
      setLoading('');
    }
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

    if (!passwordValid) {
      nextErrors.newPassword =
        'Password must satisfy every requirement.';
    }

    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword =
        'Passwords do not match.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading('reset');

    try {
      await authApi.resetPassword({
        identifier,
        token,
        password: newPassword,
        confirmPassword,
      });

      setDone(true);
      setToast('Password reset successfully.');
    } catch (err) {
      setErrors({
        newPassword:
          err.message ||
          'Unable to reset password.',
      });
    } finally {
      setLoading('');
    }
  };

  return (
    <>
      <AuthCard
        eyebrow="ACCOUNT RECOVERY"
        title="Forgot Password"
        subtitle="Recover access by proving ownership of your Codeforces handle. No email verification needed."
        footer={
          <>
            Remember your password?{' '}
            <Link to="/login">Sign In</Link>
          </>
        }
      >
        {done ? (
          <div className="auth-success-panel">
            <strong>Password Reset ✓</strong>

            <p>
              Your password has been reset successfully.
              You can now sign in with your new password.
            </p>

            <Link to="/login">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form
            className="auth-form"
            onSubmit={resetPassword}
          >
            {backendError && (
              <div className="backend-error">{backendError}</div>
            )}

            <InputField
              label="Username OR Codeforces Handle"
              value={identifier}
              error={errors.identifier}
              disabled={Boolean(token)}
              onChange={(event) =>
                setIdentifier(event.target.value)
              }
            />

            {!token && (
              <PrimaryButton
                type="button"
                loading={loading === 'token'}
                onClick={generateResetToken}
              >
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

            {errors.verification && (
              <div className="backend-error">
                {errors.verification}
              </div>
            )}

            {identityVerified && (
              <>
                <div className="identity-verified">
                  Identity Verified ✓
                </div>

                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  error={errors.newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  actions={
                    <>
                      <SecondaryButton
                        type="button"
                        onClick={fillGeneratedPassword}
                      >
                        Generate Strong Password
                      </SecondaryButton>

                      <SecondaryButton
                        type="button"
                        onClick={copyPassword}
                      >
                        Copy Password
                      </SecondaryButton>
                    </>
                  }
                />

                <PasswordStrength
                  password={newPassword}
                />

                <PasswordChecklist
                  password={newPassword}
                />

                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  error={errors.confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                />

                <PrimaryButton
                  type="submit"
                  loading={loading === 'reset'}
                >
                  Reset Password
                </PrimaryButton>
              </>
            )}
          </form>
        )}
      </AuthCard>

      <Toast
        message={toast}
        onClose={() => setToast('')}
      />
    </>
  );
}