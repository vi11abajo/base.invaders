"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { http } from "viem";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import "@coinbase/onchainkit/styles.css";

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "sea invaders",
      preference: "all",
    }),
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org", {
      batch: true,
      timeout: 30_000,
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
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
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
