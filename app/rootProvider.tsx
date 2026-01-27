"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { http } from "viem";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import "@coinbase/onchainkit/styles.css";

// Создаем кастомный chain без ENS
const baseChainWithoutENS = {
  ...base,
  contracts: {
    ...base.contracts,
    ensRegistry: undefined, // Отключаем ENS
    ensUniversalResolver: undefined, // Отключаем ENS resolver
  },
};

const wagmiConfig = createConfig({
  chains: [baseChainWithoutENS as typeof base],
  connectors: [
    coinbaseWallet({
      appName: "sea invaders",
      preference: "all",
    }),
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org", {
      batch: false, // Отключаем batching чтобы избежать лишних запросов
      timeout: 30_000,
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: true,
  // Отключаем ENS чтобы избежать CORS ошибок с eth.merkle.io
  multiInjectedProviderDiscovery: false,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ПОЛНОЕ отключение всех запросов для избежания CORS ошибок с eth.merkle.io
      enabled: false, // Отключаем все queries по умолчанию
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      gcTime: 0,
    },
  },
});

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          chain={baseChainWithoutENS}
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
            autoConnect: false, // Отключаем автоподключение чтобы избежать ENS запросов
            notificationProxyUrl: undefined,
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
