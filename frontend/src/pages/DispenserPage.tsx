import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import RequireProfile from "../components/RequireUniversalProfile";


export function Component() {
    return (
        <RequireProfile>
            <p>
                Dispenser Page
            </p>
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