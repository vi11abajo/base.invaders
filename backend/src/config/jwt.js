// Environment variables are loaded in app.js before this module is imported
// No need for dotenv.config() here

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
    console.error('❌ JWT_SECRET is not configured!');
    console.error('   Authentication endpoints will not work.');
    console.error('   Set JWT_SECRET environment variable with at least 32 characters.');
    return false;
  }

  if (jwtConfig.secret.length < 32) {
    console.warn('⚠️  JWT_SECRET is too short! Use at least 32 characters for security.');
  }

  console.log('✅ JWT configuration is valid');
  return true;
}

export default jwtConfig;
