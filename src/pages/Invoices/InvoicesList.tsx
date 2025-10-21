import { useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Receipt, Eye, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const InvoicesList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          contracts (
            tenant_name,
            tenant_email,
            tenant_phone
          ),
          properties (
            name,
            address,
            city,
            state
          )
        `)
        .eq("user_id", user?.id)
        .order("due_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch =
      invoice.contracts?.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.properties?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === "pending";
    
    const variants = {
      paid: { variant: "default" as const, label: "Pago", icon: null },
      pending: { 
        variant: isOverdue ? "destructive" as const : "secondary" as const, 
        label: isOverdue ? "Vencida" : "Pendente",
        icon: isOverdue ? AlertCircle : null
      },
      cancelled: { variant: "outline" as const, label: "Cancelada", icon: null },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon && <config.icon className="h-3 w-3" />}
        {config.label}
      </Badge>
    );
  };

  const totals = filteredInvoices?.reduce(
    (acc, invoice) => {
      if (invoice.status === "paid") {
        acc.paid += Number(invoice.total_amount);
      } else if (invoice.status === "pending") {
        acc.pending += Number(invoice.total_amount);
      }
      acc.total += Number(invoice.total_amount);
      return acc;
    },
    { paid: 0, pending: 0, total: 0 }
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Faturas" />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Em Aberto</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  R$ {totals?.pending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Recebido</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totals?.paid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
                <Receipt className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {totals?.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por inquilino, imóvel ou número da fatura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Link to="/faturas/nova">
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nova Fatura
              </Button>
            </Link>
          </div>

          {/* Invoices Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                <p className="mt-4 text-muted-foreground">Carregando faturas...</p>
              </div>
            </div>
          ) : filteredInvoices && filteredInvoices.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº Fatura</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Imóvel</TableHead>
                        <TableHead>Competência</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoice_number || `#${invoice.id.slice(0, 8)}`}
                          </TableCell>
                          <TableCell>{invoice.contracts?.tenant_name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {invoice.properties?.name}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.reference_month).toLocaleDateString("pt-BR", {
                              month: "long",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.due_date).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="font-semibold">
                            R$ {Number(invoice.total_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(invoice.status, invoice.due_date)}
                          </TableCell>
                          <TableCell>
                            <Link to={`/faturas/${invoice.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Receipt className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma fatura encontrada</h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Comece criando sua primeira fatura"}
                </p>
                <Link to="/faturas/nova">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Fatura
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default InvoicesList;
