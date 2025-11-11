import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LicenseProvider } from "@/contexts/LicenseContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import SuperAdminRoute from "@/components/SuperAdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Plans from "./pages/Plans";
import CheckoutPlan from "./pages/CheckoutPlan";
import Checkout from "./pages/Checkout";
import PropertiesList from "./pages/Properties/PropertiesList";
import PropertyForm from "./pages/Properties/PropertyForm";
import PropertyDetails from "./pages/Properties/PropertyDetails";
import ContractsList from "./pages/Contracts/ContractsList";
import ContractWizard from "./pages/Contracts/ContractWizard";
import ContractDetails from "./pages/Contracts/ContractDetails";
import InvoicesList from "./pages/Invoices/InvoicesList";
import InvoiceDetails from "./pages/Invoices/InvoiceDetails";
import ReportsList from "./pages/Reports/ReportsList";
import DocumentsList from "./pages/Documents/DocumentsList";
import ScheduledVisits from "./pages/Visits/ScheduledVisits";
import UsersList from "./pages/Users/UsersList";
import NotFound from "./pages/NotFound";
import LicenseManagement from "./pages/Admin/LicenseManagement";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminAccounts from "./pages/Admin/AdminAccounts";
import AdminPayments from "./pages/Admin/AdminPayments";
import NotificationSettings from "./pages/Notifications/NotificationSettings";
import FinancialDashboard from "./pages/Financial/FinancialDashboard";
import BaixaPagamentos from "./pages/Financial/BaixaPagamentos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LicenseProvider>
            <SidebarProvider>
              <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/checkout-plan" element={<CheckoutPlan />} />
              <Route path="/checkout" element={<Checkout />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/imoveis" element={
              <ProtectedRoute>
                <PropertiesList />
              </ProtectedRoute>
            } />
            <Route path="/imoveis/novo" element={
              <ProtectedRoute>
                <PropertyForm />
              </ProtectedRoute>
            } />
            <Route path="/imoveis/:id/editar" element={
              <ProtectedRoute>
                <PropertyForm />
              </ProtectedRoute>
            } />
            <Route path="/imoveis/:id" element={
              <ProtectedRoute>
                <PropertyDetails />
              </ProtectedRoute>
            } />
            <Route path="/contratos" element={
              <ProtectedRoute>
                <ContractsList />
              </ProtectedRoute>
            } />
            <Route path="/contratos/novo/:propertyId" element={
              <ProtectedRoute>
                <ContractWizard />
              </ProtectedRoute>
            } />
            <Route path="/contratos/:id" element={
              <ProtectedRoute>
                <ContractDetails />
              </ProtectedRoute>
            } />
            <Route path="/faturas" element={
              <ProtectedRoute>
                <InvoicesList />
              </ProtectedRoute>
            } />
            <Route path="/faturas/:id" element={
              <ProtectedRoute>
                <InvoiceDetails />
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <ReportsList />
              </ProtectedRoute>
            } />
            <Route path="/documentos" element={
              <ProtectedRoute>
                <DocumentsList />
              </ProtectedRoute>
            } />
            <Route path="/visitas" element={
              <ProtectedRoute>
                <ScheduledVisits />
              </ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute>
                <UsersList />
              </ProtectedRoute>
            } />
            <Route path="/notificacoes" element={
              <ProtectedRoute>
                <NotificationSettings />
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute>
                <FinancialDashboard />
              </ProtectedRoute>
            } />
            <Route path="/financeiro/baixa" element={
              <ProtectedRoute>
                <BaixaPagamentos />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <SuperAdminRoute>
                  <AdminDashboard />
                </SuperAdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/accounts" element={
              <ProtectedRoute>
                <SuperAdminRoute>
                  <AdminAccounts />
                </SuperAdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute>
                <SuperAdminRoute>
                  <AdminPayments />
                </SuperAdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/licenses" element={
              <ProtectedRoute>
                <AdminRoute>
                  <LicenseManagement />
                </AdminRoute>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
          </LicenseProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
