import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Save, UserCheck } from "lucide-react";

interface Contrato {
  id: string;
  inquilino: string;
  documento: string | null;
  valor_aluguel: number;
  dia_vencimento: number | null;
}

interface TenantAssignSelectProps {
  nomeExtrato: string;
  currentMatch: string | null;
  contratos: Contrato[];
  onAssign: (contratoId: string, tenantName: string) => void;
  saving?: boolean;
}

export function TenantAssignSelect({ nomeExtrato, currentMatch, contratos, onAssign, saving }: TenantAssignSelectProps) {
  const [selected, setSelected] = useState<string>("");

  if (currentMatch) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        {currentMatch}
      </Badge>
    );
  }

  const handleAssign = () => {
    const contrato = contratos.find(c => c.id === selected);
    if (contrato) {
      onAssign(contrato.id, contrato.inquilino);
    }
  };

  return (
    <div className="flex items-center gap-1.5 min-w-[220px]">
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger className="h-8 text-xs w-[180px]">
          <SelectValue placeholder="Atribuir inquilino..." />
        </SelectTrigger>
        <SelectContent>
          {contratos.map(c => (
            <SelectItem key={c.id} value={c.id} className="text-xs">
              <div className="flex flex-col">
                <span className="font-medium">{c.inquilino}</span>
                <span className="text-muted-foreground">
                  R$ {c.valor_aluguel?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  {c.documento ? ` · ${c.documento}` : ""}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected && (
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={handleAssign}
          disabled={saving}
          title="Salvar atribuição"
        >
          {saving ? <Save className="h-3.5 w-3.5 animate-pulse" /> : <UserCheck className="h-3.5 w-3.5 text-green-600" />}
        </Button>
      )}
    </div>
  );
}
