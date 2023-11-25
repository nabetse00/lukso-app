import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function AlertNotConnected() {
    let error = useRouteError();
    return isRouteErrorResponse(error) ? (
        <div className="toast toast-center toast-middle">

            <div role="alert" className="alert alert-error ">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                    <h3 className="font-bold">{error.status} - {error.statusText}
                    </h3>
                    <div className="text-xs">{error.data}</div>
                </div>
            </div>

        </div>
    ) : (
        <h1>{(error as any).message || error}</h1>
    );
}