import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import BillSummaryView from './pages/BillSummaryView';
import MySummaryPage from './pages/MySummaryPage';

const rootRoute = createRootRoute({
  component: () => (
    <LanguageProvider>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster richColors position="top-center" />
    </LanguageProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const customerDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer/$customerId',
  component: CustomerDetailPage,
});

const billSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transaction/$transactionId/bill',
  component: BillSummaryView,
});

const mySummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-summary',
  component: MySummaryPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  customerDetailRoute,
  billSummaryRoute,
  mySummaryRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
