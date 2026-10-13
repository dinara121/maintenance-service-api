import bcrypt from 'bcrypt';

import * as userRepository from '../repositories/user.repository.js';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

const register = async ({ email, password }) => {
  const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    error.code = 'USER_ALREADY_EXISTS';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await userRepository.create({
    email,
    passwordHash,
    role: 'viewer',
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 401;
    throw error;
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    const authError = new Error('Invalid refresh token');
    authError.statusCode = 401;
    throw authError;
  }

  const user = await userRepository.findById(payload.sub);

  if (!user) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

export {
  register,
  login,
  refresh,
};