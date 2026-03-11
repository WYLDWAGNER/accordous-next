import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ImportContractDocsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

interface FileMatch {
  file: File;
  extractedNumber: string | null;
  contractId: string | null;
  contractNumber: string | null;
  tenantName: string | null;
  status: "pending" | "matched" | "unmatched" | "uploaded" | "error";
  errorMsg?: string;
}

export function ImportContractDocsDialog({ open, onOpenChange, onComplete }: ImportContractDocsDialogProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"select" | "preview" | "done">("select");

  const extractContractNumber = (filename: string): string | null => {
    // Match patterns like: contrato_9401_xxx.pdf, contrato-9401.pdf, 9401.pdf, etc.
    const patterns = [
      /contrato[_\-\s]*(\d+)/i,
      /^(\d{4,6})/,
      /[_\-](\d{4,6})[_\-\.]/,
    ];
    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleFilesSelected = useCallback(async (selectedFiles: FileList) => {
    if (!user?.id) return;
    setLoading(true);

    // Fetch all contracts for the user
    const { data: contracts, error } = await supabase
      .from("contracts")
      .select("id, contract_number, tenant_name")
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erro ao buscar contratos");
      setLoading(false);
      return;
    }

    const fileMatches: FileMatch[] = [];

    for (const file of Array.from(selectedFiles)) {
      const extractedNumber = extractContractNumber(file.name);
      let matchedContract = null;

      if (extractedNumber && contracts) {
        matchedContract = contracts.find(
          (c) => c.contract_number === extractedNumber
        );
      }

      fileMatches.push({
        file,
        extractedNumber,
        contractId: matchedContract?.id || null,
        contractNumber: matchedContract?.contract_number || null,
        tenantName: matchedContract?.tenant_name || null,
        status: matchedContract ? "matched" : "unmatched",
      });
    }

    // Sort: matched first, then unmatched
    fileMatches.sort((a, b) => {
      if (a.status === "matched" && b.status !== "matched") return -1;
      if (a.status !== "matched" && b.status === "matched") return 1;
      return 0;
    });

    setFiles(fileMatches);
    setStep("preview");
    setLoading(false);
  }, [user?.id]);

  const handleUpload = async () => {
    const matchedFiles = files.filter((f) => f.status === "matched");
    if (matchedFiles.length === 0) {
      toast.error("Nenhum arquivo vinculado a contratos");
      return;
    }

    setUploading(true);
    setProgress(0);

    let uploaded = 0;
    let errors = 0;

    for (const fileMatch of matchedFiles) {
      try {
        const ext = fileMatch.file.name.split(".").pop() || "pdf";
        const storagePath = `${user!.id}/${fileMatch.contractId}/${Date.now()}_${fileMatch.file.name}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("contract-documents")
          .upload(storagePath, fileMatch.file, { contentType: fileMatch.file.type });

        if (uploadError) throw uploadError;

        // Get existing documents from contract
        const { data: contractData } = await supabase
          .from("contracts")
          .select("documents")
          .eq("id", fileMatch.contractId!)
          .single();

        const existingDocs = Array.isArray((contractData as any)?.documents) 
          ? (contractData as any).documents 
          : [];

        const newDoc = {
          name: fileMatch.file.name,
          path: storagePath,
          type: fileMatch.file.type,
          size: fileMatch.file.size,
          uploaded_at: new Date().toISOString(),
        };

        // Update contract documents
        const { error: updateError } = await supabase
          .from("contracts")
          .update({ documents: [...existingDocs, newDoc] } as any)
          .eq("id", fileMatch.contractId!);

        if (updateError) throw updateError;

        fileMatch.status = "uploaded";
        uploaded++;
      } catch (err: any) {
        fileMatch.status = "error";
        fileMatch.errorMsg = err.message;
        errors++;
      }

      setProgress(Math.round(((uploaded + errors) / matchedFiles.length) * 100));
      setFiles([...files]);
    }

    setUploading(false);
    setStep("done");
    toast.success(`${uploaded} documentos enviados com sucesso${errors > 0 ? `, ${errors} erros` : ""}`);
    onComplete?.();
  };

  const matchedCount = files.filter((f) => f.status === "matched" || f.status === "uploaded").length;
  const unmatchedCount = files.filter((f) => f.status === "unmatched").length;

  const handleClose = () => {
    setFiles([]);
    setStep("select");
    setProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Importar Documentos de Contratos</DialogTitle>
          <DialogDescription>
            Faça upload dos PDFs. O sistema vincula automaticamente ao contrato pelo número no nome do arquivo (ex: contrato_9401_xxx.pdf → contrato #9401).
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4">
            <label
              htmlFor="contract-docs-input"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Clique ou arraste os PDFs aqui</p>
              <p className="text-xs text-muted-foreground mt-1">Aceita múltiplos arquivos PDF</p>
              <input
                id="contract-docs-input"
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
              />
            </label>
            {loading && <p className="text-center text-sm text-muted-foreground">Analisando arquivos...</p>}
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {matchedCount} vinculados
              </Badge>
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                {unmatchedCount} sem correspondência
              </Badge>
              <Badge variant="secondary">
                {files.length} total
              </Badge>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <div className="p-2 space-y-1">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2 rounded text-sm ${
                      f.status === "matched" ? "bg-green-50 dark:bg-green-950/20" :
                      f.status === "uploaded" ? "bg-blue-50 dark:bg-blue-950/20" :
                      f.status === "error" ? "bg-red-50 dark:bg-red-950/20" :
                      "bg-muted/30"
                    }`}
                  >
                    <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{f.file.name}</p>
                      {f.status === "matched" && (
                        <p className="text-xs text-muted-foreground">
                          → Contrato #{f.contractNumber} • {f.tenantName}
                        </p>
                      )}
                      {f.status === "unmatched" && (
                        <p className="text-xs text-destructive">
                          Nº "{f.extractedNumber || "?"}" não encontrado nos contratos
                        </p>
                      )}
                      {f.status === "error" && (
                        <p className="text-xs text-destructive">{f.errorMsg}</p>
                      )}
                    </div>
                    {f.status === "matched" && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                    {f.status === "uploaded" && <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                    {f.status === "unmatched" && <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />}
                    {f.status === "error" && <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {uploading && <Progress value={progress} className="w-full" />}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose} disabled={uploading}>
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={uploading || matchedCount === 0}>
                {uploading ? `Enviando... ${progress}%` : `Enviar ${matchedCount} documentos`}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold">Upload concluído!</h3>
            <p className="text-muted-foreground">
              {files.filter(f => f.status === "uploaded").length} documentos vinculados com sucesso.
              {files.filter(f => f.status === "error").length > 0 && (
                <> {files.filter(f => f.status === "error").length} erros.</>
              )}
            </p>
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
