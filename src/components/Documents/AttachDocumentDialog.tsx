import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AttachDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "property" = attach to property, "contract" = attach to contract */
  target: "property" | "contract";
}

export function AttachDocumentDialog({ open, onOpenChange, target }: AttachDocumentDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ["properties-select"],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("id, name, address").order("name");
      return data || [];
    },
    enabled: open && target === "property",
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["contracts-select"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contracts")
        .select("id, contract_number, tenant_name")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: open && target === "contract",
  });

  const items = target === "property"
    ? properties.map(p => ({ id: p.id, label: p.name || p.address }))
    : contracts.map(c => ({ id: c.id, label: `#${c.contract_number || c.id.slice(0, 8)} - ${c.tenant_name}` }));

  const bucketName = target === "property" ? "property-documents" : "contract-documents";

  const handleUpload = async () => {
    if (!selectedId || files.length === 0 || !user?.id) return;
    setUploading(true);

    try {
      const uploadedDocs: any[] = [];

      for (const file of files) {
        const storagePath = `${user.id}/${selectedId}/${Date.now()}_${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from(bucketName)
          .upload(storagePath, file, { contentType: file.type });

        if (uploadErr) throw uploadErr;

        uploadedDocs.push({
          name: file.name,
          path: storagePath,
          type: file.type,
          size: file.size,
          uploaded_at: new Date().toISOString(),
        });
      }

      // Get existing documents
      const table = target === "property" ? "properties" : "contracts";
      const { data: existing } = await supabase
        .from(table)
        .select("documents")
        .eq("id", selectedId)
        .single();

      const existingDocs = Array.isArray((existing as any)?.documents) ? (existing as any).documents : [];

      const { error: updateErr } = await supabase
        .from(table)
        .update({ documents: [...existingDocs, ...uploadedDocs] } as any)
        .eq("id", selectedId);

      if (updateErr) throw updateErr;

      toast.success(`${uploadedDocs.length} documento(s) anexado(s) com sucesso`);
      queryClient.invalidateQueries({ queryKey: [table] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setDone(true);
    } catch (err: any) {
      toast.error("Erro ao anexar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedId("");
    setFiles([]);
    setDone(false);
    onOpenChange(false);
  };

  const title = target === "property" ? "Novo Documento do Imóvel" : "Anexar Documento ao Contrato";
  const description = target === "property"
    ? "Selecione o imóvel e faça upload dos documentos (escritura, procuração, etc.)"
    : "Selecione o contrato e anexe os documentos relacionados";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <p className="font-medium">Documentos anexados com sucesso!</p>
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{target === "property" ? "Imóvel" : "Contrato"}</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Selecione o ${target === "property" ? "imóvel" : "contrato"}`} />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Arquivos</Label>
              <label
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {files.length > 0 ? `${files.length} arquivo(s) selecionado(s)` : "Clique para selecionar"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </label>

              {files.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose} disabled={uploading}>Cancelar</Button>
              <Button onClick={handleUpload} disabled={uploading || !selectedId || files.length === 0}>
                {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</> : "Enviar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
