import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '7d', // token valid for 7 days
  algorithm: 'HS256',
  issuer: 'pharos-invaders',
  audience: 'pharos-players'
};

// Configuration check
export function validateJwtConfig() {
  if (!jwtConfig.secret) {
    throw new Error('JWT_SECRET is not configured!');
  }

  if (jwtConfig.secret.length < 32) {
    console.warn('⚠️  JWT_SECRET is too short! Use at least 32 characters.');
  }

  console.log('✅ JWT configuration is valid');
}

export default jwtConfig;
