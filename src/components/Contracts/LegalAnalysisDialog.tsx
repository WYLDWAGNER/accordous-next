import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { format, differenceInDays, isPast, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LegalAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: {
    status: string;
    start_date: string;
    end_date: string | null;
    rental_value: number;
    payment_day: number;
    guarantee_type: string | null;
    guarantee_value: number | null;
    tenant_document: string | null;
    tenant_rg: string | null;
    adjustment_index: string | null;
    tenant_name: string;
  };
  overdueInvoices: number;
}

interface AnalysisItem {
  label: string;
  status: "ok" | "warning" | "error";
  detail: string;
}

export function LegalAnalysisDialog({ open, onOpenChange, contract, overdueInvoices }: LegalAnalysisDialogProps) {
  const items: AnalysisItem[] = [];

  // 1. Contract status
  if (contract.status === "active" || contract.status === "vigente") {
    items.push({ label: "Status do contrato", status: "ok", detail: "Contrato vigente" });
  } else {
    items.push({ label: "Status do contrato", status: "warning", detail: `Status: ${contract.status}` });
  }

  // 2. End date check
  if (contract.end_date) {
    const endDate = new Date(contract.end_date);
    const daysLeft = differenceInDays(endDate, new Date());
    if (isPast(endDate)) {
      items.push({ label: "Vigência", status: "error", detail: `Contrato vencido em ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}` });
    } else if (daysLeft <= 90) {
      items.push({ label: "Vigência", status: "warning", detail: `Contrato vence em ${daysLeft} dias (${format(endDate, "dd/MM/yyyy", { locale: ptBR })})` });
    } else {
      items.push({ label: "Vigência", status: "ok", detail: `Vence em ${format(endDate, "dd/MM/yyyy", { locale: ptBR })} (${daysLeft} dias)` });
    }
  } else {
    items.push({ label: "Vigência", status: "warning", detail: "Contrato sem data de término definida" });
  }

  // 3. Guarantee
  if (contract.guarantee_type && contract.guarantee_value && contract.guarantee_value > 0) {
    items.push({ label: "Garantia", status: "ok", detail: `${contract.guarantee_type} — R$ ${contract.guarantee_value.toFixed(2)}` });
  } else {
    items.push({ label: "Garantia", status: "warning", detail: "Nenhuma garantia registrada" });
  }

  // 4. Tenant docs
  if (contract.tenant_document && contract.tenant_rg) {
    items.push({ label: "Documentos do inquilino", status: "ok", detail: "CPF e RG preenchidos" });
  } else {
    items.push({ label: "Documentos do inquilino", status: "warning", detail: "CPF ou RG ausente — importante para ações legais" });
  }

  // 5. Adjustment index
  if (contract.adjustment_index) {
    items.push({ label: "Índice de reajuste", status: "ok", detail: contract.adjustment_index });
  } else {
    items.push({ label: "Índice de reajuste", status: "warning", detail: "Sem índice de reajuste definido" });
  }

  // 6. Overdue invoices
  if (overdueInvoices > 0) {
    items.push({ label: "Inadimplência", status: "error", detail: `${overdueInvoices} fatura(s) em atraso` });
  } else {
    items.push({ label: "Inadimplência", status: "ok", detail: "Nenhuma fatura em atraso" });
  }

  const errorCount = items.filter((i) => i.status === "error").length;
  const warningCount = items.filter((i) => i.status === "warning").length;

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (status === "warning") return <Clock className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Análise Jurídica — {contract.tenant_name}</DialogTitle>
          <DialogDescription>
            Verificação automática das condições contratuais e pendências.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 mb-3">
          {errorCount > 0 && <Badge variant="destructive">{errorCount} problema(s)</Badge>}
          {warningCount > 0 && <Badge variant="secondary" className="ml-2">{warningCount} alerta(s)</Badge>}
          {errorCount === 0 && warningCount === 0 && <Badge variant="default">Tudo em ordem</Badge>}
        </div>

        <Separator />

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
              <StatusIcon status={item.status} />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
