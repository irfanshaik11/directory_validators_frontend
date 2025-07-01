import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import "~/styles/globals.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { config } from "../wagmi";

const client = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={GeistSans.className}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <RainbowKitProvider
            theme={lightTheme({
              accentColor: "#6ee7b7", 
              accentColorForeground: "#000", 
              borderRadius: "large",
              fontStack: "system",
            })}
          >
            <Component {...pageProps} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
};

export default MyApp;
