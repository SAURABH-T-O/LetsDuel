import crypto from 'crypto';
import { RefreshToken } from '../models/RefreshToken.js';
import { env } from '../config/env.js';
import { sha256 } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { User } from '../models/User.js';

const parseExpiryToMs = (value) => {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

export const buildAuthTokens = async (user, req) => {
  const tokenId = crypto.randomUUID();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, tokenId);

  await RefreshToken.create({
    user: user._id,
    tokenId,
    tokenHash: sha256(refreshToken),
    userAgent: req.get('user-agent') || '',
    ipAddress: req.ip || '',
    expiresAt: new Date(Date.now() + parseExpiryToMs(env.jwt.refreshExpiresIn)),
  });

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (refreshToken, req) => {
  if (!refreshToken) throw new AppError('Refresh token is required', 401);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const tokenDoc = await RefreshToken.findOne({
    tokenId: payload.jti,
    tokenHash: sha256(refreshToken),
    revokedAt: null,
  });

  if (!tokenDoc) throw new AppError('Refresh token has been revoked', 401);
  if (tokenDoc.expiresAt <= new Date()) throw new AppError('Refresh token has expired', 401);

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError('User no longer exists', 401);
  if (user.tokenVersion !== payload.tokenVersion) {
    await tokenDoc.revoke();
    throw new AppError('Refresh token is no longer valid', 401);
  }

  await tokenDoc.revoke();
  return buildAuthTokens(user, req);
};

export const revokeRefreshToken = async (refreshToken) => {
  if (!refreshToken) return;
  await RefreshToken.findOneAndUpdate(
    { tokenHash: sha256(refreshToken), revokedAt: null },
    { revokedAt: new Date() },
  );
};

export const revokeAllUserRefreshTokens = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { revokedAt: new Date() },
  );
};