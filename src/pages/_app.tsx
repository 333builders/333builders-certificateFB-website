import { AppProps } from "next/app";
import Head from "next/head";
import { FC } from "react";
import { defaultChains, Provider } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { Footer } from "../components/Footer";

require("../styles/globals.css");

const infuraId = process.env.INFURA_ID;

// Chains for connectors to support
const chains = defaultChains;

// Set up connectors
const connectors = ({ chainId }) => {
  return [
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true },
    }),
    new WalletConnectConnector({
      options: {
        infuraId,
        qrcode: true,
      },
    }),
  ];
};

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>333.Builders</title>
      </Head>

      <div className="flex flex-col h-screen">
        <Provider autoConnect connectors={connectors}>
          <Component {...pageProps} />
          <Footer />
        </Provider>
      </div>
    </>
  );
};

export default App;
