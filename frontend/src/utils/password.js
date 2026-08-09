export const passwordRules = [
  { key: 'length', label: 'Minimum 8 characters', test: (value) => value.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { key: 'lower', label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { key: 'number', label: 'One number', test: (value) => /\d/.test(value) },
  { key: 'special', label: 'One special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export function generateStrongPassword() {
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

export function getPasswordScore(password) {
  return passwordRules.reduce((score, rule) => score + (rule.test(password) ? 1 : 0), 0);
}

export function getPasswordStrength(password) {
  const score = getPasswordScore(password);
  if (!password) return { label: 'Weak', className: 'weak', percent: 0 };
  if (score <= 2) return { label: 'Weak', className: 'weak', percent: 25 };
  if (score === 3) return { label: 'Medium', className: 'medium', percent: 50 };
  if (score === 4) return { label: 'Strong', className: 'strong', percent: 75 };
  return { label: 'Excellent', className: 'excellent', percent: 100 };
}
