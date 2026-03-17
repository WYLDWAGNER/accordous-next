import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChangeAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  currentTenantName: string;
  currentTenantEmail: string | null;
  currentTenantPhone: string | null;
  currentTenantDocument: string | null;
  onUpdate: () => void;
}

export function ChangeAccountDialog({
  open,
  onOpenChange,
  contractId,
  currentTenantName,
  currentTenantEmail,
  currentTenantPhone,
  currentTenantDocument,
  onUpdate,
}: ChangeAccountDialogProps) {
  const [tenantName, setTenantName] = useState(currentTenantName);
  const [tenantEmail, setTenantEmail] = useState(currentTenantEmail || "");
  const [tenantPhone, setTenantPhone] = useState(currentTenantPhone || "");
  const [tenantDocument, setTenantDocument] = useState(currentTenantDocument || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!tenantName.trim()) {
      toast.error("Nome do inquilino é obrigatório");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("contracts")
        .update({
          tenant_name: tenantName.trim(),
          tenant_email: tenantEmail.trim() || null,
          tenant_phone: tenantPhone.trim() || null,
          tenant_document: tenantDocument.trim() || null,
        } as any)
        .eq("id", contractId);

      if (error) throw error;

      toast.success("Dados do inquilino atualizados com sucesso");
      onOpenChange(false);
      onUpdate();
    } catch (err: any) {
      toast.error("Erro ao atualizar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Conta / Inquilino</DialogTitle>
          <DialogDescription>
            Atualize os dados do inquilino vinculado a este contrato.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Inquilino *</Label>
            <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>CPF/CNPJ</Label>
            <Input value={tenantDocument} onChange={(e) => setTenantDocument(e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)} placeholder="(00) 00000-0000" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
