import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronRight } from "lucide-react";

interface Invoice {
  client: string;
  property: string;
  dueDate: string;
  amount: string;
  status: "pending" | "paid" | "overdue";
}

const mockInvoices: Invoice[] = [
  {
    client: "Miguel Ramon Deyan Balda",
    property: "Rua Parati, 233, Bloco 2 AP 19, Guarituba - Piraquara/PR",
    dueDate: "30/10/2025",
    amount: "R$ 1.081,80",
    status: "pending",
  },
];

const getStatusBadge = (status: Invoice["status"]) => {
  const variants = {
    pending: { variant: "secondary" as const, label: "Pendente" },
    paid: { variant: "default" as const, label: "Pago" },
    overdue: { variant: "destructive" as const, label: "Vencido" },
  };

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const InvoicesTable = () => {
  return (
    <Card>
      <CardHeader className="border-b">
        <Tabs defaultValue="cobrancas" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="cobrancas">Cobranças</TabsTrigger>
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="propostas">Propostas</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Imóvel</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{invoice.client}</TableCell>
                  <TableCell className="max-w-xs truncate">{invoice.property}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="font-semibold">{invoice.amount}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-center border-t p-4">
          <Button variant="link" className="text-blue-600">
            VISUALIZAR FATURAS
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
