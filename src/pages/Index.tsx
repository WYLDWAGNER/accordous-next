import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { StatCard } from "@/components/Dashboard/StatCard";
import { CalculatorCard } from "@/components/Dashboard/CalculatorCard";
import { PropertySummaryCard } from "@/components/Dashboard/PropertySummaryCard";
import { InvoicesTable } from "@/components/Dashboard/InvoicesTable";
import { FileText, DollarSign, FileCheck, Users2, Calculator, TrendingUp, Calendar, Percent } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-gray-50">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              icon={FileText}
              title="Anúncios"
              stats={[
                { label: "Propostas", value: "0", color: "bg-blue-500" },
                { label: "Anúncios", value: "0", color: "bg-blue-500" },
              ]}
            />
            
            <StatCard
              icon={DollarSign}
              title="Cobranças"
              stats={[
                { label: "Em aberto", value: "R$ 29.637,61", color: "bg-orange-500" },
                { label: "Recebidas", value: "R$ 70.054,27", color: "bg-green-500" },
              ]}
            />
            
            <StatCard
              icon={FileCheck}
              title="Contratos"
              stats={[
                { label: "Ativos", value: "72", color: "bg-blue-500" },
                { label: "A vencer", value: "31", color: "bg-orange-500" },
              ]}
            />
            
            <StatCard
              icon={Users2}
              title="Leads"
              stats={[
                { label: "Novas respostas", value: "0", color: "bg-blue-500" },
                { label: "Agendados", value: "0", color: "bg-green-500" },
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
        </main>
      </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
