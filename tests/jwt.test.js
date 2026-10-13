import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/utils/jwt.js';

describe('JWT utilities', () => {
  const originalEnv = { ...process.env };

  const user = {
    id: 1,
    email: 'test@example.com',
    role: 'technician',
  };

  before(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  after(() => {
    for (const key of [
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'JWT_ACCESS_EXPIRES_IN',
      'JWT_REFRESH_EXPIRES_IN',
    ]) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  it('creates an access token with user data', () => {
    const payload = verifyAccessToken(generateAccessToken(user));

    assert.equal(payload.sub, user.id);
    assert.equal(payload.email, user.email);
    assert.equal(payload.role, user.role);
  });

  it('creates a refresh token with user ID only', () => {
    const payload = verifyRefreshToken(generateRefreshToken(user));

    assert.equal(payload.sub, user.id);
    assert.equal(payload.email, undefined);
    assert.equal(payload.role, undefined);
  });

  it('rejects an access token signed with the wrong secret', () => {
    const token = generateAccessToken(user);
    process.env.JWT_ACCESS_SECRET = 'wrong-secret';

    assert.throws(() => verifyAccessToken(token));

    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  });

  it('rejects an invalid refresh token', () => {
    assert.throws(() => verifyRefreshToken('not-a-valid-token'));
  });
});