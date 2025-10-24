import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PropertiesList from "./pages/Properties/PropertiesList";
import PropertyForm from "./pages/Properties/PropertyForm";
import PropertyDetails from "./pages/Properties/PropertyDetails";
import ContractsList from "./pages/Contracts/ContractsList";
import ContractWizard from "./pages/Contracts/ContractWizard";
import ContractDetails from "./pages/Contracts/ContractDetails";
import InvoicesList from "./pages/Invoices/InvoicesList";
import ReportsList from "./pages/Reports/ReportsList";
import DocumentsList from "./pages/Documents/DocumentsList";
import ScheduledVisits from "./pages/Visits/ScheduledVisits";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
