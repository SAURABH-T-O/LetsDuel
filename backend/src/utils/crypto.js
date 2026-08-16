import crypto from 'crypto';

export const createRandomToken = (prefix = 'LETSDUEL') => {
  const value = crypto.randomBytes(18).toString('base64url').toUpperCase();
  return `${prefix}_${value}`;
};

export const sha256 = (value) => {
  return crypto.createHash('sha256').update(value).digest('hex');
};