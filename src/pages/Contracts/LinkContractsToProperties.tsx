import { useState } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, Link2 } from "lucide-react";

const LinkContractsToProperties = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: contracts = [], isLoading: loadingContracts } = useQuery({
    queryKey: ["contracts-without-property"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("id, tenant_name, contract_number, start_date, rental_value, status")
        .is("property_id", null)
        .order("tenant_name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["all-properties-for-link"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, address, city, status")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const handleAssign = (contractId: string, propertyId: string) => {
    setAssignments(prev => ({ ...prev, [contractId]: propertyId }));
  };

  const handleSaveAll = async () => {
    const entries = Object.entries(assignments).filter(([, v]) => v);
    if (entries.length === 0) {
      toast({ title: "Nenhuma atribuição", description: "Selecione pelo menos um imóvel", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      for (const [contractId, propertyId] of entries) {
        const { error } = await supabase
          .from("contracts")
          .update({ property_id: propertyId })
          .eq("id", contractId);
        if (error) throw error;

        // Also update related invoices
        await supabase
          .from("invoices")
          .update({ property_id: propertyId })
          .eq("contract_id", contractId)
          .is("property_id", null);

        // And lancamentos
        await supabase
          .from("lancamentos_financeiros")
          .update({ id_imovel: propertyId })
          .eq("id_contrato", contractId)
          .is("id_imovel", null);
      }

      toast({ title: "Sucesso!", description: `${entries.length} contrato(s) vinculado(s) com sucesso` });
      setAssignments({});
      queryClient.invalidateQueries({ queryKey: ["contracts-without-property"] });
      queryClient.invalidateQueries({ queryKey: ["recent-invoices"] });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Vincular Contratos a Imóveis">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Vincular Contratos a Imóveis</h1>
          <p className="text-muted-foreground">
            Contratos criados sem imóvel vinculado. Selecione o imóvel correto para cada contrato.
          </p>
        </div>

        {contracts.length === 0 && !loadingContracts ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Check className="h-12 w-12 text-green-500 mb-4" />
              <CardTitle className="mb-2">Tudo certo!</CardTitle>
              <CardDescription>Todos os contratos já possuem imóvel vinculado.</CardDescription>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">{contracts.length} contrato(s) sem imóvel</CardTitle>
              </div>
              <Button onClick={handleSaveAll} disabled={saving || Object.keys(assignments).length === 0}>
                <Link2 className="h-4 w-4 mr-2" />
                Salvar Vínculos ({Object.values(assignments).filter(Boolean).length})
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inquilino</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-[280px]">Imóvel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.tenant_name}</TableCell>
                      <TableCell className="font-mono text-sm">{contract.contract_number || "—"}</TableCell>
                      <TableCell>
                        R$ {Number(contract.rental_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                          {contract.status === "active" ? "Ativo" : contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={assignments[contract.id] || ""}
                          onValueChange={(v) => handleAssign(contract.id, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o imóvel..." />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} — {p.address}, {p.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default LinkContractsToProperties;
