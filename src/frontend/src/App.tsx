import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import React, { Suspense, lazy } from "react";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";
import { LanguageProvider } from "./contexts/LanguageContext";

const HomePage = lazy(() => import("./pages/HomePage"));
const CustomerDetailPage = lazy(() => import("./pages/CustomerDetailPage"));
const BillSummaryView = lazy(() => import("./pages/BillSummaryView"));
const MySummaryPage = lazy(() => import("./pages/MySummaryPage"));

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const customerDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customer/$customerId",
  component: CustomerDetailPage,
});

const billSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customer/$customerId/bill/$transactionId",
  component: BillSummaryView,
});

const mySummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-summary",
  component: MySummaryPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  customerDetailRoute,
  billSummaryRoute,
  mySummaryRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}
