"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { http } from "viem";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { createConfig } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import "@coinbase/onchainkit/styles.css";

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "Base Invaders",
      preference: "all",
    }),
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org", {
      batch: true,
      timeout: 30_000,
    }),
  },
  ssr: true,
});

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          preference: "all",
        },
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
      wagmiConfig={wagmiConfig}
    >
      {children}
    </OnchainKitProvider>
  );
}
