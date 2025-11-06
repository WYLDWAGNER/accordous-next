import { AppLayout } from "@/components/Layout/AppLayout";
import { StatCard } from "@/components/Dashboard/StatCard";
import { CalculatorCard } from "@/components/Dashboard/CalculatorCard";
import { PropertySummaryCard } from "@/components/Dashboard/PropertySummaryCard";
import { InvoicesTable } from "@/components/Dashboard/InvoicesTable";
import { FileText, DollarSign, FileCheck, Users2, Calculator, TrendingUp, Calendar, Percent } from "lucide-react";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import { useRecentInvoices } from "@/hooks/dashboard/useRecentInvoices";
import { usePropertySummary } from "@/hooks/dashboard/usePropertySummary";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: invoices, isLoading: invoicesLoading } = useRecentInvoices(10);
  const { data: propertySummary, isLoading: propertySummaryLoading } = usePropertySummary();

  return (
    <AppLayout title="Dashboard">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statsLoading ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : (
              <>
                <StatCard
                  icon={FileText}
                  title="Imóveis"
                  stats={[
                    { label: "Total", value: stats?.totalProperties.toString() || "0", color: "bg-info" },
                    { label: "Disponíveis", value: propertySummary?.available.toString() || "0", color: "bg-success" },
                  ]}
                />
                
                <StatCard
                  icon={DollarSign}
                  title="Cobranças"
                  stats={[
                    { label: "Pendentes", value: stats?.pendingInvoices.toString() || "0", color: "bg-warning" },
                    { label: "Receita Mensal", value: `R$ ${(stats?.monthlyRevenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "bg-success" },
                  ]}
                />
                
                <StatCard
                  icon={FileCheck}
                  title="Contratos"
                  stats={[
                    { label: "Ativos", value: stats?.activeContracts.toString() || "0", color: "bg-info" },
                    { label: "Alugados", value: propertySummary?.rented.toString() || "0", color: "bg-success" },
                  ]}
                />
                
                <StatCard
                  icon={Users2}
                  title="Propriedades"
                  stats={[
                    { label: "Manutenção", value: propertySummary?.maintenance.toString() || "0", color: "bg-warning" },
                    { label: "Reservados", value: propertySummary?.reserved.toString() || "0", color: "bg-info" },
                  ]}
                />
              </>
            )}
          </div>

          {/* Calculators and Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <CalculatorCard icon={TrendingUp} title="Calculadora de Inflação" />
            <CalculatorCard icon={Percent} title="Calculadora de Juros/Multa" />
            <CalculatorCard icon={Calculator} title="Calculadora de financiamento" />
            <CalculatorCard icon={Calendar} title="Visitas agendadas" />
            {propertySummaryLoading ? (
              <Skeleton className="h-full" />
            ) : (
              <PropertySummaryCard 
                unavailable={propertySummary?.maintenance || 0} 
                contracted={propertySummary?.rented || 0} 
                available={propertySummary?.available || 0} 
              />
            )}
          </div>

          {/* Invoices Table */}
          {invoicesLoading ? (
            <Skeleton className="h-96" />
          ) : (
            <InvoicesTable invoices={invoices || []} />
          )}
    </AppLayout>
  );
};

export default Index;
