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

// Configuration check
export function validateDiscordConfig() {
  const required = ['clientId', 'clientSecret', 'redirectUri'];
  const missing = required.filter(key => !discordConfig[key]);

  if (missing.length > 0) {
    throw new Error(`Missing Discord configuration: ${missing.join(', ')}`);
  }

  console.log('✅ Discord OAuth configuration is valid');
}

export default discordConfig;
