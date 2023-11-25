import luksoModule from "@lukso/web3-onboard-config";
import injectedModule from '@web3-onboard/injected-wallets';
import './App.css'
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import appLogoSvg from "./assets/logo.svg"

import {
  Outlet,
} from "react-router-dom";

// initialize the module
const lukso = luksoModule();

const luksoInjected = injectedModule({
  custom: [lukso],
  sort: (wallets) => {
    const sorted = wallets.reduce<any[]>((sorted, wallet) => {
      if (wallet.label === "Universal Profiles") {
        sorted.unshift(wallet);
      } else {
        sorted.push(wallet);
      }
      return sorted;
    }, []);
    return sorted;
  },
  displayUnavailable: ["Universal Profiles"],
});

const chains = [
  // mainet not provided for demo
  // {
  //   id: 42,
  //   token: "LYX",
  //   label: "LUKSO Mainnet",
  //   rpcUrl: "https://lukso.rpc.thirdweb.com",
  // },
  // testnet
  {
    id: 4201,
    token: "LYXt",
    label: "LUKSO Testnet",
    rpcUrl: "https://rpc.testnet.lukso.network",
  },
];
const appMetadata = {
  name: "LUKSO Auction",
  icon: appLogoSvg,
  logo: appLogoSvg,
  description: "Lukso Auctions - Auction house on lukso network",
  recommendedInjectedWallets: [
    {
      name: "Universal Profiles",
      url: "https://chrome.google.com/webstore/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn?hl=en",
    },
  ],
};

const connect: ConnectModalOptions = {
  iDontHaveAWalletLink:
    "https://chrome.google.com/webstore/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn?hl=en",
  removeWhereIsMyWalletWarning: true,
};

const web3Onboard = init({
  wallets: [luksoInjected],
  chains: chains,
  appMetadata: appMetadata,
  connect: connect,
});



import NavBar from './components/Navbar'
import { ConnectModalOptions } from "@web3-onboard/core/dist/types";
import FooterComponent from "./components/Footer";


export default function App() {
  return (
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      <div className="App  flex flex-col min-h-screen">
        <NavBar />
        <main className="container mx-auto flex-grow">
          <Outlet />
        </main>
        <FooterComponent />
      </div>
    </Web3OnboardProvider>
  )
}

