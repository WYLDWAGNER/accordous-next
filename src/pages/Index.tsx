import { AppLayout } from "@/components/Layout/AppLayout";
import { StatCard } from "@/components/Dashboard/StatCard";
import { CalculatorCard } from "@/components/Dashboard/CalculatorCard";
import { PropertySummaryCard } from "@/components/Dashboard/PropertySummaryCard";
import { InvoicesTable } from "@/components/Dashboard/InvoicesTable";
import { FileText, DollarSign, FileCheck, Users2, Calculator, TrendingUp, Calendar, Percent } from "lucide-react";

const Index = () => {
  return (
    <AppLayout title="Dashboard">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              icon={FileText}
              title="Anúncios"
              stats={[
                { label: "Propostas", value: "0", color: "bg-info" },
                { label: "Anúncios", value: "0", color: "bg-info" },
              ]}
            />
            
            <StatCard
              icon={DollarSign}
              title="Cobranças"
              stats={[
                { label: "Em aberto", value: "R$ 29.637,61", color: "bg-warning" },
                { label: "Recebidas", value: "R$ 70.054,27", color: "bg-success" },
              ]}
            />
            
            <StatCard
              icon={FileCheck}
              title="Contratos"
              stats={[
                { label: "Ativos", value: "72", color: "bg-info" },
                { label: "A vencer", value: "31", color: "bg-warning" },
              ]}
            />
            
            <StatCard
              icon={Users2}
              title="Leads"
              stats={[
                { label: "Novas respostas", value: "0", color: "bg-info" },
                { label: "Agendados", value: "0", color: "bg-success" },
              ]}
            />
          </div>

          {/* Calculators and Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <CalculatorCard icon={TrendingUp} title="Calculadora de Inflação" />
            <CalculatorCard icon={Percent} title="Calculadora de Juros/Multa" />
            <CalculatorCard icon={Calculator} title="Calculadora de financiamento" />
            <CalculatorCard icon={Calendar} title="Visitas agendadas" />
            <PropertySummaryCard unavailable={3} contracted={48} available={26} />
          </div>

          {/* Invoices Table */}
          <InvoicesTable />
    </AppLayout>
  );
};

export default Index;
