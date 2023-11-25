import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import RequireProfile from "../components/RequireUniversalProfile";
import { useConnectWallet } from "@web3-onboard/react";
import { WalletState } from "@web3-onboard/core";
import { dispenseToken } from "../utils/dispenser";
import { TESTNET_MOCK_USDC_ADDR, TESTNET_MOCK_DAI_ADDR } from "../types/contracts";


export function Component() {
    const [{ wallet }] = useConnectWallet()

    function handleDispenseUsdc(wallet: WalletState): void {
        dispenseToken(wallet, TESTNET_MOCK_USDC_ADDR)
        //throw new Error("Function not implemented.");
    }

    function dispenseDAI(wallet: WalletState): void {
        dispenseToken(wallet, TESTNET_MOCK_DAI_ADDR)
        // throw new Error("Function not implemented.");
    }

    return (
        <RequireProfile>
            <div className="flex flex-wrap my-6 justify-center">

                <div className="m-6 card w-96 bg-neutral text-neutral-content">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">USDC Dispenser</h2>
                        <p>USDC: {TESTNET_MOCK_USDC_ADDR}</p>
                        <div className="card-actions justify-end">
                            <button onClick={() => handleDispenseUsdc(wallet!)} className="btn btn-primary">
                                Get mUSDC</button>
                        </div>
                    </div>
                </div>

                <div className="m-6 card w-96 bg-neutral text-neutral-content">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">Dai Dispenser</h2>
                        <p>DAI: {TESTNET_MOCK_DAI_ADDR}</p>
                        <div className="card-actions justify-end">
                            <button onClick={() => dispenseDAI(wallet!)} className="btn btn-primary">Get mDAI</button>
                        </div>
                    </div>
                </div>
            </div>
        </RequireProfile>
    )
}

Component.displayName = "DispenserPageRoute";

export function ErrorBoundary() {
    let error = useRouteError();
    return isRouteErrorResponse(error) ? (
        <h1>
            Dispenser Page
            {error.status} {error.statusText}
        </h1>
    ) : (
        <h1>{(error as any).message || error}</h1>
    );
}

ErrorBoundary.displayName = "DispenserErrorBoundary";