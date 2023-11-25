import { useConnectWallet } from "@web3-onboard/react";
import AlertNotConnected from "./EnsureConnected";


export default function RequireProfile({ children }: { children: JSX.Element }) {
    const [{ wallet} ] = useConnectWallet()
  
    if (!wallet?.accounts) {
      return <AlertNotConnected/>
    }
  
    return children;
  }