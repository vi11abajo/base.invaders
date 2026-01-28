import dotenv from 'dotenv';

dotenv.config();

export const discordConfig = {
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: process.env.DISCORD_REDIRECT_URI,
  scopes: ['identify', 'email'],

  // Discord API endpoints
  authUrl: 'https://discord.com/api/oauth2/authorize',
  tokenUrl: 'https://discord.com/api/oauth2/token',
  userUrl: 'https://discord.com/api/users/@me',
};

// Configuration check (OPTIONAL - Discord is legacy, Farcaster is primary)
export function validateDiscordConfig() {
  const required = ['clientId', 'clientSecret', 'redirectUri'];
  const missing = required.filter(key => !discordConfig[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Discord OAuth not configured (${missing.join(', ')} missing) - using Farcaster auth only`);
    return false;
  }

  console.log('✅ Discord OAuth configuration is valid');
  return true;
}

export default discordConfig;
