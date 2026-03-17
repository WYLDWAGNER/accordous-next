import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TerminateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  contractStatus: string;
  propertyId?: string;
  onUpdate: () => void;
}

export function TerminateContractDialog({
  open,
  onOpenChange,
  contractId,
  contractStatus,
  propertyId,
  onUpdate,
}: TerminateContractDialogProps) {
  const [terminationDate, setTerminationDate] = useState<Date>(new Date());
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleTerminate = async () => {
    if (!reason.trim()) {
      toast.error("Informe o motivo do encerramento");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("contracts")
        .update({
          status: "terminated",
          end_date: format(terminationDate, "yyyy-MM-dd"),
        } as any)
        .eq("id", contractId);

      if (error) throw error;

      // Update property status to available if linked
      if (propertyId) {
        await supabase
          .from("properties")
          .update({ status: "available" } as any)
          .eq("id", propertyId);
      }

      toast.success("Contrato encerrado com sucesso");
      onOpenChange(false);
      onUpdate();
    } catch (err: any) {
      toast.error("Erro ao encerrar contrato: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isAlreadyTerminated = contractStatus === "terminated";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Encerrar Contrato</DialogTitle>
          <DialogDescription>
            {isAlreadyTerminated
              ? "Este contrato já foi encerrado."
              : "Ao encerrar, o contrato será marcado como finalizado e o imóvel ficará disponível."}
          </DialogDescription>
        </DialogHeader>

        {isAlreadyTerminated ? (
          <p className="text-sm text-muted-foreground">Nenhuma ação necessária.</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Data de Encerramento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(terminationDate, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={terminationDate}
                    onSelect={(d) => d && setTerminationDate(d)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Motivo do Encerramento *</Label>
              <Textarea
                placeholder="Ex: Término do prazo contratual, rescisão antecipada pelo inquilino..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {!isAlreadyTerminated && (
            <Button variant="destructive" onClick={handleTerminate} disabled={saving}>
              {saving ? "Encerrando..." : "Confirmar Encerramento"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
