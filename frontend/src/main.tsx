import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, isRouteErrorResponse, useRouteError } from "react-router-dom";
import RouterError from './components/RouterError.tsx';
import { Menu } from './types/models.ts';





let routes = createRoutesFromElements(
  <Route element={<App />}
    errorElement={<RouterError />}>
    <Route path="/lukso-app"
      id="main"
      lazy={() => import("./pages/MainPage")} />
    <Route
      id="dispenser"
      path="/lukso-app/dispenser"
      lazy={
        () => import("./pages/DispenserPage")
      }
    />
    <Route
      id='Auctions'
      path="/lukso-app/auctions"
      lazy={
        () => import("./pages/AuctionsPage")
      }
      />
      <Route
        path="/lukso-app/auctions/create"
        lazy={
          () => import("./pages/CreateAuctionPage")
        }
      />
      <Route
        path="/lukso-app/auctions/:id"
        loader={({ params }) => { return params.id! }}
        lazy={
          () => import("./pages/AuctionsPage")
        }
      />
      <Route
        path="/lukso-app/nft-data"
        lazy={
          () => import("./pages/NftPage")
        }
      />
  </Route>
);


export const menu: Menu = [
  {
    path: "/lukso-app",
    description: "Home"
  },
  {
    path: "/lukso-app/dispenser",
    description: "Dispensers"
  },
  {
    path: "/lukso-app/auctions",
    description: "Auctions"
  },
  {
    path: "/lukso-app/auctions/create",
    description: "Create Auctions"
  },
  {
    path: "/lukso-app/nft-data",
    description: "Nft Data"
  },

]

const router = createBrowserRouter(routes);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)


export function ErrorBoundary() {
  let error = useRouteError();
  return isRouteErrorResponse(error) ? (
    <h1>
      Error Main APP -
      {error.status} {error.statusText}
    </h1>
  ) : (
    <h1>{(error as any).message || error}</h1>
  );
}