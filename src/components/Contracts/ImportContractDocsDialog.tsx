import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccountId } from "@/hooks/useAccountId";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface ImportContractDocsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

interface FileMatch {
  file: File;
  extractedCpf: string | null;
  extractedName: string | null;
  extractedAddress: string | null;
  contractId: string | null;
  contractNumber: string | null;
  tenantName: string | null;
  contactId: string | null;
  propertyId: string | null;
  propertyName: string | null;
  status: "pending" | "parsing" | "matched" | "unmatched" | "uploaded" | "error";
  errorMsg?: string;
}

// Normalize CPF to formatted pattern 000.000.000-00
function normalizeCpfFormat(rawCpf: string): string | null {
  const digits = rawCpf.replace(/\D/g, "");
  if (digits.length !== 11) return null;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function collectCpfCandidates(text: string): { cpf: string; index: number }[] {
  const results: { cpf: string; index: number }[] = [];
  const seen = new Set<string>();

  const add = (raw: string, index: number) => {
    const normalized = normalizeCpfFormat(raw);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    results.push({ cpf: normalized, index });
  };

  // Accepts spaces/noises from PDF extraction, e.g. "093 . 184 . 079 - 12"
  const relaxedCpfRegex = /\d{3}\s*\.?\s*\d{3}\s*\.?\s*\d{3}\s*[-–—]?\s*\d{2}/g;
  let m: RegExpExecArray | null;
  while ((m = relaxedCpfRegex.exec(text)) !== null) {
    add(m[0], m.index);
  }

  // CPF near CPF/CPF-MF keywords (handles "CPF/MF sob o nº" and variants)
  const cpfKeywordRegex = /CPF(?:\/MF)?[\s\S]{0,60}?(\d[\d.\-\s]{10,20})/gi;
  while ((m = cpfKeywordRegex.exec(text)) !== null) {
    add(m[1], m.index);
  }

  return results.sort((a, b) => a.index - b.index);
}

// Extract tenant CPF robustly for contracts with LOCADOR + LOCATÁRIO sections
function extractCpf(text: string): string | null {
  const normalizedText = text.replace(/\u00A0/g, " ");

  // Strategy 1 (BEST): Find "LOCATÁRIO:" label and get first CPF AFTER it
  const locatarioMatch = normalizedText.match(/LOCAT[ÁA]RI[OA]\s*:/i);
  if (locatarioMatch && locatarioMatch.index !== undefined) {
    const afterLocatario = normalizedText.substring(locatarioMatch.index);
    const cpfsAfter = collectCpfCandidates(afterLocatario);
    if (cpfsAfter.length > 0) {
      return cpfsAfter[0].cpf;
    }
  }

  // Strategy 2: section AFTER "e de outro" - get first CPF there
  const eDeOutroMatch = normalizedText.match(/e\s+de\s+outro/i);
  if (eDeOutroMatch && eDeOutroMatch.index !== undefined) {
    const afterEDeOutro = normalizedText.substring(eDeOutroMatch.index);
    const cpfsAfter = collectCpfCandidates(afterEDeOutro);
    if (cpfsAfter.length > 0) {
      return cpfsAfter[0].cpf;
    }
  }

  // Strategy 3: section between "e de outro" and "doravante ... LOCATÁRI(O/A)"
  const tenantSectionMatch = normalizedText.match(
    /e\s+de\s+outro(?:\s+lado)?\s*,?\s*([\s\S]{0,3500}?)doravante\s+denominad[oa]s?\s+locat[áa]ri[oa]/i
  );
  if (tenantSectionMatch) {
    const tenantCpfs = collectCpfCandidates(tenantSectionMatch[1]);
    if (tenantCpfs.length > 0) {
      return tenantCpfs[tenantCpfs.length - 1].cpf;
    }
  }

  // Strategy 4: fallback to last CPF in the document
  const allCpfs = collectCpfCandidates(normalizedText);
  if (allCpfs.length > 0) return allCpfs[allCpfs.length - 1].cpf;

  return null;
}

// Extract tenant name from contract text
function extractTenantName(text: string): string | null {
  // Strategy 1 (BEST): pattern after "LOCATÁRIO:" label
  const match = text.match(/LOCAT[ÁA]RI[OA]\s*[,:]\s*([^,]+)/i);
  if (match) {
    let name = match[1].trim();
    name = name.replace(/\s*(brasileiro|brasileira|cubano|cubana|solteiro|solteira|casado|casada|portador|portadora|inscrito|inscrita|outros).*/i, "").trim();
    if (name.length > 3 && name.length < 120) return name;
  }

  // Strategy 2: Extract from "e de outro [NOME], ..."
  const tenantSectionMatch = text.match(/e\s+de\s+outro(?:\s+lado)?\s+([^,]+)/i);
  if (tenantSectionMatch) {
    let name = tenantSectionMatch[1].trim();
    name = name.replace(/\s*(brasileiro|brasileira|cubano|cubana|portador|portadora).*/i, "").trim();
    if (name.length > 3 && name.length < 120) return name;
  }

  return null;
}

// Extract property address from contract text
function extractAddress(text: string): string | null {
  const normalizedText = text.replace(/\u00A0/g, " ");

  const patterns = [
    /im[óo]vel\s+(?:localizado|situado|sito|urbano[^,]*localizado)\s+(?:na|no|à|a)\s+([^,]{10,150})/i,
    /objeto\s+(?:da|do|desta)\s+(?:presente\s+)?loca[çc][ãa]o[^,]*(?:na|no|à|a)\s+([^,]{10,150})/i,
    /endere[çc]o[:\s]+([^,]{10,150})/i,
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      let addr = (match[1] || match[0]).trim();
      addr = addr.replace(/\s*(doravante|conforme|de\s+acordo|para\s+os|neste\s+ato).*/i, "").trim();
      addr = addr.replace(/\.+$/, "").trim();
      if (addr.length > 8 && addr.length < 200) return addr;
    }
  }

  // Fallback: find "Rua/Av/Alameda..." pattern
  const streetMatch = normalizedText.match(/((?:Rua|Avenida|Av\.?|Travessa|Alameda|Pra[çc]a)\s+[^,]{5,100},?\s*n[ºo°]?\s*\d+[^,]*)/i);
  if (streetMatch) {
    let addr = streetMatch[1].trim().replace(/\.+$/, "");
    if (addr.length > 8) return addr;
  }

  return null;
}

function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function addressSimilarity(extracted: string, propertyAddr: string): number {
  const a = normalizeForComparison(extracted);
  const b = normalizeForComparison(propertyAddr);

  if (a.includes(b) || b.includes(a)) return 0.9;

  const wordsA = new Set(a.split(" ").filter(w => w.length > 2));
  const wordsB = new Set(b.split(" ").filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let matches = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) matches++;
  }
  return matches / Math.max(wordsA.size, wordsB.size);
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  const pagesToRead = Math.min(pdf.numPages, 3);
  for (let i = 1; i <= pagesToRead; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

export function ImportContractDocsDialog({ open, onOpenChange, onComplete }: ImportContractDocsDialogProps) {
  const { user } = useAuth();
  const { accountId } = useAccountId();
  const [files, setFiles] = useState<FileMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"select" | "preview" | "done">("select");
  const [parseProgress, setParseProgress] = useState(0);

  const handleFilesSelected = useCallback(async (selectedFiles: FileList) => {
    if (!user?.id) return;
    setLoading(true);

    // Fetch all contacts with documents (CPFs)
    const { data: contacts, error: contactsErr } = await supabase
      .from("contacts")
      .select("id, name, document")
      .eq("user_id", user.id)
      .not("document", "is", null);

    if (contactsErr) {
      toast.error("Erro ao buscar contatos");
      setLoading(false);
      return;
    }

    // Fetch all contracts
    const { data: contracts, error: contractsErr } = await supabase
      .from("contracts")
      .select("id, contract_number, tenant_name, tenant_document")
      .eq("user_id", user.id);

    if (contractsErr) {
      toast.error("Erro ao buscar contratos");
      setLoading(false);
      return;
    }

    // Fetch all properties for address matching
    const { data: properties } = await supabase
      .from("properties")
      .select("id, name, address, city, state, number, neighborhood")
      .eq("user_id", user.id);

    // Normalize CPF for comparison
    const normalizeCpf = (cpf: string) => cpf.replace(/[^0-9]/g, "");

    // Build contact CPF index
    const contactByCpf = new Map<string, typeof contacts[0]>();
    contacts?.forEach((c) => {
      if (c.document) {
        contactByCpf.set(normalizeCpf(c.document), c);
      }
    });

    // Build contract by tenant_document index
    const contractByDoc = new Map<string, typeof contracts[0]>();
    contracts?.forEach((c) => {
      if (c.tenant_document) {
        contractByDoc.set(normalizeCpf(c.tenant_document), c);
      }
    });

    const fileMatches: FileMatch[] = Array.from(selectedFiles).map((file) => ({
      file,
      extractedCpf: null,
      extractedName: null,
      extractedAddress: null,
      contractId: null,
      contractNumber: null,
      tenantName: null,
      contactId: null,
      propertyId: null,
      propertyName: null,
      status: "pending" as const,
    }));

    setFiles(fileMatches);
    setStep("preview");

    // Parse PDFs in batches
    let parsed = 0;
    for (const fm of fileMatches) {
      fm.status = "parsing";
      setFiles([...fileMatches]);

      try {
        const text = await extractTextFromPdf(fm.file);
        
        // Debug: log extracted text and CPF candidates
        console.log(`[PDF DEBUG] File: ${fm.file.name}`);
        console.log(`[PDF DEBUG] Text (first 1500 chars):`, text.substring(0, 1500));
        console.log(`[PDF DEBUG] Has "e de outro":`, /e\s+de\s+outro/i.test(text));
        console.log(`[PDF DEBUG] Has "doravante denominad":`, /doravante\s+denominad/i.test(text));
        console.log(`[PDF DEBUG] Has "LOCATÁRI":`, /LOCAT[ÁA]RI[OA]/i.test(text));
        console.log(`[PDF DEBUG] All CPF candidates:`, collectCpfCandidates(text));
        
        const cpf = extractCpf(text);
        const name = extractTenantName(text);
        const addr = extractAddress(text);
        console.log(`[PDF DEBUG] Extracted CPF: ${cpf}, Name: ${name}, Address: ${addr}`);
        
        fm.extractedCpf = cpf;
        fm.extractedName = name;
        fm.extractedAddress = addr;

        // Try to match property by address
        if (addr && properties && properties.length > 0) {
          let bestScore = 0;
          let bestProp: typeof properties[0] | null = null;
          for (const prop of properties) {
            const fullAddr = [prop.address, prop.number, prop.neighborhood, prop.city, prop.state]
              .filter(Boolean).join(" ");
            const score = addressSimilarity(addr, fullAddr);
            if (score > bestScore) {
              bestScore = score;
              bestProp = prop;
            }
          }
          if (bestProp && bestScore >= 0.4) {
            fm.propertyId = bestProp.id;
            fm.propertyName = bestProp.name || bestProp.address;
            console.log(`[PDF DEBUG] Matched property: ${fm.propertyName} (score: ${bestScore.toFixed(2)})`);
          }
        }

        if (cpf) {
          const normalizedCpf = normalizeCpf(cpf);

          // Try to match contract by tenant_document
          const contract = contractByDoc.get(normalizedCpf);
          if (contract) {
            fm.contractId = contract.id;
            fm.contractNumber = contract.contract_number;
            fm.tenantName = contract.tenant_name;
            fm.status = "matched";
          } else {
            // Try to match contact by CPF
            const contact = contactByCpf.get(normalizedCpf);
            if (contact) {
              fm.contactId = contact.id;
              fm.tenantName = contact.name;
              // Try to find contract by tenant_name matching contact name
              const matchedContract = contracts?.find(
                (c) => c.tenant_name?.toLowerCase() === contact.name?.toLowerCase()
              );
              if (matchedContract) {
                fm.contractId = matchedContract.id;
                fm.contractNumber = matchedContract.contract_number;
                fm.status = "matched";
              } else {
                // Contact found but no contract linked
                fm.status = "matched";
                fm.tenantName = contact.name + " (contato encontrado, contrato será criado)";
              }
            } else {
              fm.status = "unmatched";
            }
          }
        } else {
          fm.status = "unmatched";
          fm.errorMsg = "CPF não encontrado no PDF";
        }
      } catch (err: any) {
        fm.status = "error";
        fm.errorMsg = "Erro ao ler PDF: " + (err.message || "desconhecido");
      }

      parsed++;
      setParseProgress(Math.round((parsed / fileMatches.length) * 100));
      setFiles([...fileMatches]);
    }

    // Sort: matched first
    fileMatches.sort((a, b) => {
      if (a.status === "matched" && b.status !== "matched") return -1;
      if (a.status !== "matched" && b.status === "matched") return 1;
      return 0;
    });
    setFiles([...fileMatches]);
    setLoading(false);
  }, [user?.id]);

  const handleUpload = async () => {
    const matchedFiles = files.filter((f) => f.status === "matched");
    if (matchedFiles.length === 0) {
      toast.error("Nenhum arquivo vinculado");
      return;
    }

    setUploading(true);
    setProgress(0);

    let uploaded = 0;
    let errors = 0;

    for (const fm of matchedFiles) {
      try {
        let contractId = fm.contractId;

        // If no contract but contact found, create a contract
        if (!contractId && fm.contactId && fm.extractedCpf) {
          const { data: newContract, error: createErr } = await supabase
            .from("contracts")
            .insert({
              user_id: user!.id,
              account_id: accountId || undefined,
              tenant_name: fm.extractedName || "Inquilino",
              tenant_document: fm.extractedCpf,
              property_id: fm.propertyId || undefined,
              rental_value: 0,
              start_date: new Date().toISOString().split("T")[0],
              status: "active",
            } as any)
            .select("id")
            .single();

          if (createErr) throw createErr;
          contractId = newContract.id;
        }

        if (!contractId) throw new Error("Sem contrato vinculado");

        const storagePath = `${user!.id}/${contractId}/${Date.now()}_${fm.file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("contract-documents")
          .upload(storagePath, fm.file, { contentType: fm.file.type });

        if (uploadError) throw uploadError;

        // Get existing documents and update contract
        const { data: contractData } = await supabase
          .from("contracts")
          .select("documents, property_id")
          .eq("id", contractId)
          .single();

        const existingDocs = Array.isArray((contractData as any)?.documents)
          ? (contractData as any).documents
          : [];

        const newDoc = {
          name: fm.file.name,
          path: storagePath,
          type: fm.file.type,
          size: fm.file.size,
          uploaded_at: new Date().toISOString(),
        };

        // Build update payload - include property_id if matched and not yet set
        const updatePayload: any = { documents: [...existingDocs, newDoc] };
        if (fm.propertyId && !contractData?.property_id) {
          updatePayload.property_id = fm.propertyId;
        }

        const { error: updateError } = await supabase
          .from("contracts")
          .update(updatePayload)
          .eq("id", contractId);

        if (updateError) throw updateError;

        fm.status = "uploaded";
        uploaded++;
      } catch (err: any) {
        fm.status = "error";
        fm.errorMsg = err.message;
        errors++;
      }

      setProgress(Math.round(((uploaded + errors) / matchedFiles.length) * 100));
      setFiles([...files]);
    }

    setUploading(false);
    setStep("done");
    toast.success(`${uploaded} documentos enviados${errors > 0 ? `, ${errors} erros` : ""}`);
    onComplete?.();
  };

  const matchedCount = files.filter((f) => f.status === "matched" || f.status === "uploaded").length;
  const unmatchedCount = files.filter((f) => f.status === "unmatched" || f.status === "error").length;
  const parsingCount = files.filter((f) => f.status === "parsing" || f.status === "pending").length;

  const handleClose = () => {
    setFiles([]);
    setStep("select");
    setProgress(0);
    setParseProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Importar Documentos de Contratos</DialogTitle>
          <DialogDescription>
            Faça upload dos PDFs. O sistema extrai o CPF do inquilino de cada PDF e vincula ao contato/contrato correspondente.
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
              <p className="text-xs text-muted-foreground mt-1">O sistema lerá cada PDF para extrair o CPF do inquilino</p>
              <input
                id="contract-docs-input"
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
              />
            </label>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              {parsingCount > 0 && (
                <Badge variant="secondary">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Lendo {parsingCount} PDFs...
                </Badge>
              )}
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
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

            {parsingCount > 0 && (
              <Progress value={parseProgress} className="w-full" />
            )}

            <ScrollArea className="h-[400px] border rounded-lg">
              <div className="p-2 space-y-1">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2 rounded text-sm ${
                      f.status === "matched" ? "bg-green-50 dark:bg-green-950/20" :
                      f.status === "uploaded" ? "bg-blue-50 dark:bg-blue-950/20" :
                      f.status === "parsing" || f.status === "pending" ? "bg-muted/30" :
                      f.status === "error" ? "bg-red-50 dark:bg-red-950/20" :
                      "bg-orange-50 dark:bg-orange-950/20"
                    }`}
                  >
                    <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{f.file.name}</p>
                      {f.status === "parsing" && (
                        <p className="text-xs text-muted-foreground">Lendo PDF...</p>
                      )}
                      {f.status === "matched" && (
                        <p className="text-xs text-muted-foreground">
                          CPF: {f.extractedCpf} → {f.tenantName}
                          {f.contractNumber && ` (Contrato #${f.contractNumber})`}
                          {f.propertyName && ` | 🏠 ${f.propertyName}`}
                        </p>
                      )}
                      {f.status === "unmatched" && (
                        <p className="text-xs text-destructive">
                          {f.extractedCpf 
                            ? `CPF ${f.extractedCpf} não encontrado nos contatos`
                            : f.errorMsg || "CPF não encontrado no PDF"
                          }
                        </p>
                      )}
                      {f.status === "error" && (
                        <p className="text-xs text-destructive">{f.errorMsg}</p>
                      )}
                      {f.status === "uploaded" && (
                        <p className="text-xs text-blue-600">Enviado com sucesso</p>
                      )}
                    </div>
                    {f.status === "matched" && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                    {f.status === "uploaded" && <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                    {f.status === "unmatched" && <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />}
                    {f.status === "error" && <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                    {(f.status === "parsing" || f.status === "pending") && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {uploading && <Progress value={progress} className="w-full" />}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose} disabled={uploading}>
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={uploading || matchedCount === 0 || parsingCount > 0}>
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
