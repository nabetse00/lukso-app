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
    <Route path="/REPO"
      id="main"
      lazy={() => import("./pages/MainPage")} />
    <Route
      id="dispenser"
      path="dispenser"
      lazy={
        () => import("./pages/DispenserPage")
      }
    />
    <Route
      id='Auctions'
      path="auctions"
      lazy={
        () => import("./pages/AuctionsPage")
      }
      />
      <Route
        path="/auctions/create"
        lazy={
          () => import("./pages/CreateAuctionPage")
        }
      />
      <Route
        path="auctions/:id"
        loader={({ params }) => { return params.id! }}
        lazy={
          () => import("./pages/AuctionsPage")
        }
      />
  </Route>
);


export const menu: Menu = [
  {
    path: "/REPO",
    description: "Home"
  },
  {
    path: "/dispenser",
    description: "Dispensers"
  },
  {
    path: "/auctions",
    description: "Auctions"
  },
  {
    path: "/auctions/create",
    description: "Create Auctions"
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