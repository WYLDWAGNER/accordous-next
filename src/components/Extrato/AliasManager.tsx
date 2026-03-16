import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAccountId } from "@/hooks/useAccountId";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Settings2 } from "lucide-react";
import { toast } from "sonner";

interface Alias {
  id: string;
  nome_extrato: string;
  tenant_name: string;
  contract_id: string;
  updated_at: string;
}

export function AliasManager() {
  const { accountId } = useAccountId();
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAliases() {
    if (!accountId) return;
    setLoading(true);
    const { data } = await supabase
      .from("extrato_aliases")
      .select("*")
      .eq("account_id", accountId)
      .order("updated_at", { ascending: false });
    setAliases((data as Alias[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAliases();
  }, [accountId]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("extrato_aliases").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir alias");
      return;
    }
    setAliases(prev => prev.filter(a => a.id !== id));
    toast.success("Alias removido");
  }

  if (loading) return <p className="text-sm text-muted-foreground p-4">Carregando aliases...</p>;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 p-4 border-b">
          <Settings2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Aliases Salvos ({aliases.length})</h3>
        </div>
        {aliases.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">Nenhum alias salvo ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome no Extrato</TableHead>
                  <TableHead>Inquilino Vinculado</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead className="text-center w-[80px]">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aliases.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-sm">{a.nome_extrato}</TableCell>
                    <TableCell className="text-sm">{a.tenant_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.updated_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(a.id)}
                        title="Excluir alias"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
