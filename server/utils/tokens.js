import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';

export const ACCESS_EXPIRES = '15m';
export const REFRESH_EXPIRES_DAYS = 7;

export const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const createRefreshTokenValue = () => crypto.randomBytes(48).toString('hex');

export const issueRefreshToken = async (userId, req) => {
  const raw = createRefreshTokenValue();
  const hashed = hashToken(raw);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user: userId,
    tokenHash: hashed,
    expiresAt,
    userAgent: req?.headers?.['user-agent'] || '',
    ip: req?.ip || '',
  });

  return raw;
};

export const rotateRefreshToken = async (rawToken, req) => {
  if (!rawToken) return null;
  const hashed = hashToken(rawToken);
  const existing = await RefreshToken.findOne({ tokenHash: hashed, revokedAt: null });
  if (!existing || existing.expiresAt < new Date()) {
    if (existing) {
      existing.revokedAt = new Date();
      await existing.save();
    }
    return null;
  }

  existing.revokedAt = new Date();
  existing.replacedByHash = 'pending';
  await existing.save();

  const nextRaw = await issueRefreshToken(existing.user, req);
  existing.replacedByHash = hashToken(nextRaw);
  await existing.save();

  return { userId: existing.user, refreshToken: nextRaw };
};

export const revokeRefreshToken = async (rawToken) => {
  if (!rawToken) return;
  const hashed = hashToken(rawToken);
  await RefreshToken.findOneAndUpdate(
    { tokenHash: hashed, revokedAt: null },
    { revokedAt: new Date() }
  );
};

export const revokeAllUserRefreshTokens = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { revokedAt: new Date() }
  );
};

export const buildAuthPayload = (user, token) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  adminLevel: user.adminLevel,
  identityVerification: user.identityVerification,
  payoutBalance: user.payoutBalance || 0,
  bookingSuspended: user.bookingSuspended || false,
  referralCode: user.referralCode,
  token,
});
