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
    name: "sea invaders",
    subtitle: "classic arcade on base",
    description: "play sea invaders, compete on-chain, sign to start",
    screenshotUrls: [
      `${ROOT_URL}/metadata/screenshots/screenshot-1.png`,
      `${ROOT_URL}/metadata/screenshots/screenshot-2.png`,
      `${ROOT_URL}/metadata/screenshots/screenshot-3.png`
    ],
    iconUrl: `${ROOT_URL}/metadata/icon.png`,
    splashImageUrl: `${ROOT_URL}/metadata/cover.png`,
    splashBackgroundColor: "#001122",
    homeUrl: ROOT_URL,
    primaryCategory: "games",
    tags: ["games", "arcade", "onchain", "space-invaders"],
    heroImageUrl: `${ROOT_URL}/metadata/icon.png`,
    tagline: "Play classic arcade action",
    ogTitle: "Play classic arcade on base",
    ogDescription: "Destroy crab waves, defeat bosses, and compete on the leaderboard!",
    ogImageUrl: `${ROOT_URL}/metadata/cover.png`,
  },
} as const;

