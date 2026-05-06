import { Toaster } from "../shared/ui/toaster";
import { Toaster as Sonner } from "../shared/ui/sonner";
import { TooltipProvider } from "../shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../entities/user/ui/AuthContext";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { AppLayout } from "../widgets/app-layout/ui/AppLayout";
import Login from "../widgets/auth-form/ui/Login";
import DashboardPage from "../pages/dashboard/ui/DashboardPage";
import ClientsPage from "../pages/clients/ui/ClientsPage";
import OrdersPage from "../pages/orders/ui/OrdersPage";
import FurniturePage from "../pages/furniture/ui/FurniturePage";
import PartsPage from "../pages/parts/ui/PartsPage";
import ScannerPage from "../pages/scanner/ui/ScannerPage";
import ProcessesPage from "../pages/processes/ui/ProcessesPage";
import AssemblyPage from "../pages/assembly/ui/AssemblyPage";
import ExpeditionPage from "../pages/expedition/ui/ExpeditionPage";
import SupervisorDashboard from "../pages/dashboard/ui/SupervisorDashboard";
import InstallPage from "../pages/install/ui/InstallPage";
import NotFound from "../pages/not-found/ui/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        if (
          error instanceof Error &&
          "statusCode" in error &&
          [401, 403, 404].includes((error as { statusCode: number }).statusCode)
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/pedidos" element={<OrdersPage />} />
              <Route path="/moveis" element={<FurniturePage />} />
              <Route path="/pecas" element={<PartsPage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/processos" element={<ProcessesPage />} />
              <Route path="/montagem" element={<AssemblyPage />} />
              <Route path="/expedicao" element={<ExpeditionPage />} />
              <Route path="/dashboard" element={<SupervisorDashboard />} />
              <Route path="/instalar" element={<InstallPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
