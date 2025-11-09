import { useState } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, DollarSign, AlertCircle, 
  Calendar, RefreshCw, Download, Plus
} from "lucide-react";
import { useResumoFinanceiro } from "@/hooks/useResumoFinanceiro";
import { toast } from "sonner";

const FinancialDashboard = () => {
  // Período padrão: mês atual
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [dataInicio, setDataInicio] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(lastDayOfMonth.toISOString().split('T')[0]);

  const { data: resumo, isLoading, refetch } = useResumoFinanceiro(dataInicio, dataFim);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handlePeriodChange = (type: 'current' | 'previous' | 'year') => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (type) {
      case 'current':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'previous':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
    }

    setDataInicio(start.toISOString().split('T')[0]);
    setDataFim(end.toISOString().split('T')[0]);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Resumo Financeiro" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Filtros de Período */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Período de Análise
                </CardTitle>
                <CardDescription>
                  Selecione o período para visualizar o resumo financeiro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handlePeriodChange('current')}
                  >
                    Mês Atual
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePeriodChange('previous')}
                  >
                    Mês Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePeriodChange('year')}
                  >
                    Ano Atual
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data-inicio">Data Início</Label>
                    <Input
                      id="data-inicio"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data-fim">Data Fim</Label>
                    <Input
                      id="data-fim"
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards de Resumo */}
            {isLoading ? (
              <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-8 bg-muted rounded w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : resumo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Receitas */}
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Receitas
                      </p>
                      <div className="rounded-full p-2 bg-green-500/10">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(resumo.total_receitas)}
                    </p>
                    <Badge variant="outline" className="mt-2 border-green-600 text-green-600">
                      Pagamentos recebidos
                    </Badge>
                  </CardContent>
                </Card>

                {/* Total Despesas */}
                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Despesas
                      </p>
                      <div className="rounded-full p-2 bg-red-500/10">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(resumo.total_despesas)}
                    </p>
                    <Badge variant="outline" className="mt-2 border-red-600 text-red-600">
                      Pagamentos realizados
                    </Badge>
                  </CardContent>
                </Card>

                {/* Saldo */}
                <Card className={`border-${resumo.saldo >= 0 ? 'blue' : 'orange'}-200 bg-${resumo.saldo >= 0 ? 'blue' : 'orange'}-50/50`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Saldo do Período
                      </p>
                      <div className={`rounded-full p-2 bg-${resumo.saldo >= 0 ? 'blue' : 'orange'}-500/10`}>
                        <DollarSign className={`h-5 w-5 text-${resumo.saldo >= 0 ? 'blue' : 'orange'}-600`} />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold text-${resumo.saldo >= 0 ? 'blue' : 'orange'}-600`}>
                      {formatCurrency(resumo.saldo)}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 border-${resumo.saldo >= 0 ? 'blue' : 'orange'}-600 text-${resumo.saldo >= 0 ? 'blue' : 'orange'}-600`}
                    >
                      {resumo.saldo >= 0 ? 'Positivo' : 'Negativo'}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Inadimplência */}
                <Card className="border-yellow-200 bg-yellow-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Inadimplência Total
                      </p>
                      <div className="rounded-full p-2 bg-yellow-500/10">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">
                      {formatCurrency(resumo.total_inadimplencia)}
                    </p>
                    <Badge variant="outline" className="mt-2 border-yellow-600 text-yellow-600">
                      Valores atrasados
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {/* Resumo Detalhado */}
            {resumo && (
              <Card>
                <CardHeader>
                  <CardTitle>Análise Detalhada</CardTitle>
                  <CardDescription>
                    Análise do período de {new Date(dataInicio).toLocaleDateString('pt-BR')} até {new Date(dataFim).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm text-muted-foreground">Receitas Pagas</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(resumo.total_receitas)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm text-muted-foreground">Despesas Pagas</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(resumo.total_despesas)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">Resultado Líquido</span>
                        <span className={`font-bold ${resumo.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatCurrency(resumo.saldo)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg bg-yellow-50">
                        <span className="text-sm font-medium">Valores em Atraso</span>
                        <span className="font-bold text-yellow-600">
                          {formatCurrency(resumo.total_inadimplencia)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex gap-3">
                    <Button className="flex-1">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Lançamento
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Relatório
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinancialDashboard;