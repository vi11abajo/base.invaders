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
    header: "",
    payload: "",
    signature: ""
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

