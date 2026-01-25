const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjQxNzE4OCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDU5Rjc0ZUQ4MkEwOEY4MGNmZjVEN0U4MDU1ZjZhMjRBMTg1OTVGNjQifQ",
    payload: "eyJkb21haW4iOiJiYXNlaW52YWRlcnMudmVyY2VsLmFwcCJ9",
    signature: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABHRiq1h4v4jt6icDLM8jVkWKaztVjYWLuPDSqn2vCt60LYtKXRGUATARPzJYbz5dFG85lIFR3oWtba7-TEOYo7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAl8ZgIay2xclZzG8RWZzuWvO8j9R0fus3XxDee9lRlVy8dAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKeyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiSXBiNkJqRGVBVlZzR3M2MnZFWWVjTnIzcWZiYW10UWtTcnZVeW11MGFJQSIsIm9yaWdpbiI6Imh0dHBzOi8va2V5cy5jb2luYmFzZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  },
  miniapp: {
    version: "1",
    name: "Base Invaders",
    subtitle: "Classic Arcade on Base",
    description: "Play Space Invaders, compete on-chain, sign to start",
    screenshotUrls: [`${ROOT_URL}/screenshots/game.png`],
    iconUrl: `${ROOT_URL}/icon-game.png`,
    splashImageUrl: `${ROOT_URL}/splash-game.png`,
    splashBackgroundColor: "#001122",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["games", "arcade", "onchain", "space-invaders"],
    heroImageUrl: `${ROOT_URL}/hero-game.png`,
    tagline: "Defend the space, sign to play",
    ogTitle: "Base Invaders - On-chain Arcade Game",
    ogDescription: "Classic Space Invaders with blockchain sessions on Base",
    ogImageUrl: `${ROOT_URL}/og-game.png`,
  },
} as const;

