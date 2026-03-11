import { useState, useCallback } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Upload, FileSpreadsheet, Users, FileText, Receipt,
  CheckCircle2, XCircle, AlertCircle, ArrowLeft, Trash2, AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccountId } from "@/hooks/useAccountId";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ── Types ──────────────────────────────────────────────────

interface ContactRow {
  legacyId: string;
  name: string;
  document: string;
  rg: string;
  email: string;
  phone: string;
  cellphone: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  birthDate: string;
  nationality: string;
  maritalStatus: string;
  profession: string;
  status?: "pending" | "success" | "error" | "duplicate";
  message?: string;
}

interface InvoiceRow {
  invoiceNumber: string;
  contractNumber: string;
  referenceMonth: string;
  dueDate: string;
  amount: number;
  paymentStatus: string;
  status?: "pending" | "success" | "error";
  message?: string;
}

interface ContractRow {
  contractNumber: string;
  invoiceCount: number;
  firstDueDate: string;
  avgAmount: number;
  status?: "pending" | "success" | "error" | "duplicate";
  message?: string;
  generatedId?: string;
}

type ImportStep = "upload" | "preview" | "importing" | "done";

// ── Helpers ────────────────────────────────────────────────

function parseDateBR(dateStr: string): string | null {
  if (!dateStr) return null;
  const clean = String(dateStr).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

  const match = clean.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (!match) return null;

  let day = Number(match[1]);
  let month = Number(match[2]);
  let year = Number(match[3]);

  if (year < 100) year += 2000;

  // Heurística para formato US (MM/DD/YYYY) quando aparecer
  if (month > 12 && day <= 12) {
    const tmp = day;
    day = month;
    month = tmp;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseRefMonth(refStr: string): string | null {
  if (!refStr) return null;
  const clean = String(refStr).trim().toLowerCase();

  const normalized = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const parts = normalized.split("/");
  if (parts.length !== 2) return null;

  const monthMap: Record<string, number> = {
    jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
    jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
  };

  const monthPart = parts[0];
  const yearPart = parts[1];

  let month = Number(monthPart);
  if (!Number.isFinite(month) || month <= 0) {
    month = monthMap[monthPart] || 0;
  }

  let year = Number(yearPart);
  if (year < 100) year += 2000;

  if (!month || month < 1 || month > 12 || !year) return null;

  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function parseBRLValue(val: any): number {
  if (typeof val === "number") return val;
  if (!val) return 0;

  let str = String(val)
    .replace(/R\$/gi, "")
    .replace(/\u00A0/g, "")
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "");

  if (!str) return 0;

  const hasComma = str.includes(",");
  const hasDot = str.includes(".");

  if (hasComma && hasDot) {
    // O último separador define a casa decimal
    if (str.lastIndexOf(",") > str.lastIndexOf(".")) {
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  } else if (hasComma) {
    str = str.replace(",", ".");
  }

  const parsed = Number(str);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizePaymentStatus(value: string): "Pago" | "Não pago" | "" {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!normalized) return "";
  if (normalized.includes("nao pago") || normalized.includes("não pago") || normalized.includes("pendente")) return "Não pago";
  if (normalized.includes("pago")) return "Pago";
  return "";
}

function parseCsvLine(line: string, delimiter: string = ","): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(v => v.replace(/^"|"$/g, ""));
}

function detectCsvDelimiter(headerLine: string): string {
  const semicolons = (headerLine.match(/;/g) || []).length;
  const commas = (headerLine.match(/,/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

// ── Component ──────────────────────────────────────────────

const ImportConciliacao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { accountId, loading: accountLoading } = useAccountId();

  const [step, setStep] = useState<ImportStep>("upload");
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("");
  const [clearBeforeImport, setClearBeforeImport] = useState(false);

  const [contactsFile, setContactsFile] = useState<string | null>(null);
  const [invoicesFile, setInvoicesFile] = useState<string | null>(null);

  // ── Parse Contacts CSV ──

  const handleContactsFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setContactsFile(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          toast.error("Arquivo CSV vazio ou inválido");
          return;
        }

        const delimiter = detectCsvDelimiter(lines[0]);
        const parsed: ContactRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i], delimiter);
          if (!cols[1]) continue;

          parsed.push({
            legacyId: cols[0] || "",
            name: cols[1] || "",
            document: cols[3] || "",       // CPF/CNPJ
            rg: cols[4] || "",
            email: cols[5] || "",
            phone: cols[6] || "",
            cellphone: cols[7] || "",
            address: cols[8] || "",
            cep: cols[9] || "",
            city: cols[10] || "",
            state: cols[11] || "",
            birthDate: cols[12] || "",
            nationality: cols[13] || "",
            maritalStatus: cols[14] || "",
            profession: cols[15] || "",
            status: "pending",
          });
        }

        setContacts(parsed);
        toast.success(`${parsed.length} contatos carregados`);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao processar CSV de contatos");
      }
    };
    reader.readAsText(file, "UTF-8");
  }, []);

  // ── Parse Invoices XLSX ──

  const handleInvoicesFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInvoicesFile(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1, raw: false });

        // Find header row (contains "Contrato")
        let headerIdx = -1;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i];
          if (row && row.some((c: any) => String(c).includes("Contrato"))) {
            headerIdx = i;
            break;
          }
        }

        if (headerIdx === -1) {
          toast.error("Formato de faturas não reconhecido");
          return;
        }

        const parsedInvoices: InvoiceRow[] = [];
        const contractMap = new Map<string, { count: number; amounts: number[]; firstDue: string }>();

        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[0]) continue;

          const invoiceNum = String(row[0] || "").trim();
          const contractNum = String(row[1] || "").trim();
          const refMonth = String(row[2] || "").trim();

          // Handle date (Excel serial or string)
          let dueDate = "";
          if (typeof row[3] === "number") {
            const d = XLSX.SSF.parse_date_code(row[3]);
            dueDate = `${String(d.d).padStart(2, "0")}/${String(d.m).padStart(2, "0")}/${d.y}`;
          } else {
            dueDate = String(row[3] || "").trim();
          }

          // Amount - robust for "1357,8", "1357.8", "R$ 1.357,80"
          let amount = parseBRLValue(String(row[4] || ""));
          if (amount <= 0 && row[5]) {
            amount = parseBRLValue(`${String(row[4] || "")} ${String(row[5] || "")}`);
          }

          // Status - supports "Pago", "Não pago" and "Nao pago"
          let payStatus = "";
          for (let c = 4; c < (row.length || 0); c++) {
            const parsedStatus = normalizePaymentStatus(String(row[c] || ""));
            if (parsedStatus) {
              payStatus = parsedStatus;
              break;
            }
          }

          if (!invoiceNum || amount <= 0) continue;

          parsedInvoices.push({
            invoiceNumber: invoiceNum,
            contractNumber: contractNum,
            referenceMonth: refMonth,
            dueDate,
            amount,
            paymentStatus: payStatus,
            status: "pending",
          });

          // Build contracts map
          if (contractNum) {
            const existing = contractMap.get(contractNum);
            if (existing) {
              existing.count++;
              existing.amounts.push(amount);
            } else {
              contractMap.set(contractNum, { count: 1, amounts: [amount], firstDue: dueDate });
            }
          }
        }

        setInvoices(parsedInvoices);

        // Build contracts list
        const parsedContracts: ContractRow[] = Array.from(contractMap.entries()).map(([num, data]) => ({
          contractNumber: num,
          invoiceCount: data.count,
          firstDueDate: data.firstDue,
          avgAmount: data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length,
          status: "pending" as const,
        }));
        setContracts(parsedContracts);

        toast.success(`${parsedInvoices.length} faturas e ${parsedContracts.length} contratos identificados`);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao processar XLSX de faturas");
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  // ── Can proceed? ──

  const canPreview = contacts.length > 0 || invoices.length > 0;

  // ── Clear existing data ──

  const clearExistingData = async () => {
    if (!accountId || !user) return;
    setCurrentPhase("Limpando dados existentes...");

    // Delete in order: invoices → lancamentos → contracts → contacts
    await supabase.from("lancamentos_financeiros").delete().eq("account_id", accountId);
    await supabase.from("invoices").delete().eq("account_id", accountId);
    await supabase.from("contracts").delete().eq("account_id", accountId);
    await supabase.from("contacts").delete().eq("account_id", accountId);

    toast.info("Dados anteriores removidos");
  };

  // ── Start Import ──

  const startImport = async () => {
    if (!accountId || !user) {
      toast.error("Usuário ou conta não encontrados");
      return;
    }

    setStep("importing");
    const totalSteps = contacts.length + contracts.length + invoices.length + (clearBeforeImport ? 1 : 0);
    let completed = 0;

    // PHASE 0: Clear if requested
    if (clearBeforeImport) {
      await clearExistingData();
      completed++;
      setProgress(Math.round((completed / totalSteps) * 100));
    }

    // PHASE 1: Import Contacts
    if (contacts.length > 0) {
      setCurrentPhase("Importando contatos...");
      const updatedContacts = [...contacts];

      // Batch insert in chunks of 50
      const BATCH_SIZE = 50;
      for (let batch = 0; batch < updatedContacts.length; batch += BATCH_SIZE) {
        const chunk = updatedContacts.slice(batch, batch + BATCH_SIZE);
        const insertData = chunk.map(c => ({
          user_id: user.id,
          account_id: accountId,
          name: c.name,
          document: c.document || null,
          phone: c.cellphone || c.phone || null,
          email: c.email || null,
          address: c.address || null,
          contact_type: "inquilino",
          status: "active",
          notes: [
            c.rg ? `RG: ${c.rg}` : "",
            c.birthDate ? `Nascimento: ${c.birthDate}` : "",
            c.nationality ? `Nacionalidade: ${c.nationality}` : "",
            c.maritalStatus ? `Estado Civil: ${c.maritalStatus}` : "",
            c.profession ? `Profissão: ${c.profession}` : "",
            c.legacyId ? `ID legado: ${c.legacyId}` : "",
          ].filter(Boolean).join(" | ") || null,
        }));

        const { error } = await supabase.from("contacts").insert(insertData);

        for (let i = 0; i < chunk.length; i++) {
          const idx = batch + i;
          if (error) {
            // If batch fails, try individual inserts
            const { error: singleErr } = await supabase.from("contacts").insert(insertData[i]);
            updatedContacts[idx] = {
              ...updatedContacts[idx],
              status: singleErr ? "error" : "success",
              message: singleErr?.message,
            };
          } else {
            updatedContacts[idx] = { ...updatedContacts[idx], status: "success" };
          }
          completed++;
        }

        setProgress(Math.round((completed / totalSteps) * 100));
        setContacts([...updatedContacts]);
      }
    }

    // PHASE 2: Import Contracts
    const contractIdMap = new Map<string, string>();
    if (contracts.length > 0) {
      setCurrentPhase("Importando contratos...");
      const updatedContracts = [...contracts];

      for (let i = 0; i < updatedContracts.length; i++) {
        const ct = updatedContracts[i];
        try {
          // Check duplicate
          const { data: existing } = await supabase
            .from("contracts")
            .select("id")
            .eq("account_id", accountId)
            .eq("contract_number", ct.contractNumber)
            .maybeSingle();

          if (existing) {
            contractIdMap.set(ct.contractNumber, existing.id);
            updatedContracts[i] = { ...ct, status: "duplicate", message: "Já existe", generatedId: existing.id };
            completed++;
            setProgress(Math.round((completed / totalSteps) * 100));
            setContracts([...updatedContracts]);
            continue;
          }

          const startDate = parseDateBR(ct.firstDueDate) || new Date().toISOString().split("T")[0];

          const { data, error } = await supabase.from("contracts").insert({
            user_id: user.id,
            account_id: accountId,
            contract_number: ct.contractNumber,
            tenant_name: `Contrato ${ct.contractNumber}`,
            rental_value: ct.avgAmount,
            start_date: startDate,
            status: "active",
            payment_day: parseInt(startDate.split("-")[2]) || 5,
          }).select("id").single();

          if (error) throw error;
          contractIdMap.set(ct.contractNumber, data.id);
          updatedContracts[i] = { ...ct, status: "success", generatedId: data.id };
        } catch (err: any) {
          updatedContracts[i] = { ...ct, status: "error", message: err.message };
        }
        completed++;
        setProgress(Math.round((completed / totalSteps) * 100));
        setContracts([...updatedContracts]);
      }
    }

    // PHASE 3: Import Invoices (batch)
    if (invoices.length > 0) {
      setCurrentPhase("Importando faturas...");
      const updatedInvoices = [...invoices];

      const BATCH_SIZE = 50;
      for (let batch = 0; batch < updatedInvoices.length; batch += BATCH_SIZE) {
        const chunk = updatedInvoices.slice(batch, batch + BATCH_SIZE);
        const insertData = chunk.map(inv => {
          const contractId = contractIdMap.get(inv.contractNumber) || null;
          const dueDate = parseDateBR(inv.dueDate) || new Date().toISOString().split("T")[0];
          const refMonth = parseRefMonth(inv.referenceMonth) || dueDate;
          const isPaid = inv.paymentStatus === "Pago";
          const isPastDue = new Date(dueDate) < new Date();
          const invoiceStatus = isPaid ? "paid" : (isPastDue ? "overdue" : "pending");

          return {
            user_id: user.id,
            account_id: accountId,
            invoice_number: inv.invoiceNumber,
            contract_id: contractId,
            total_amount: inv.amount,
            rental_amount: inv.amount,
            due_date: dueDate,
            reference_month: refMonth,
            issue_date: dueDate,
            status: invoiceStatus,
            payment_date: isPaid ? dueDate : null,
          };
        });

        const { error } = await supabase.from("invoices").insert(insertData);

        for (let i = 0; i < chunk.length; i++) {
          const idx = batch + i;
          if (error) {
            updatedInvoices[idx] = { ...updatedInvoices[idx], status: "error", message: error.message };
          } else {
            updatedInvoices[idx] = { ...updatedInvoices[idx], status: "success" };
          }
          completed++;
        }

        setProgress(Math.round((completed / totalSteps) * 100));
        setInvoices([...updatedInvoices]);
      }
    }

    setStep("done");
    setCurrentPhase("Importação concluída!");
    toast.success("Migração concluída com sucesso!");
  };

  // ── Status helpers ──

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error": return <XCircle className="h-4 w-4 text-destructive" />;
      case "duplicate": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const countByStatus = (items: { status?: string }[]) => ({
    success: items.filter(i => i.status === "success").length,
    error: items.filter(i => i.status === "error").length,
    duplicate: items.filter(i => i.status === "duplicate").length,
    pending: items.filter(i => i.status === "pending").length,
  });

  // ── Render ───────────────────────────────────────────────

  return (
    <AppLayout title="Migração de Backup">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/configuracoes")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Migração de Backup Completo</h1>
            <p className="text-muted-foreground text-sm">
              Importe contatos (CSV) e faturas (XLSX) do sistema anterior.
            </p>
          </div>
        </div>

        {/* ── Upload Step ── */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contacts CSV */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Contatos (CSV)
                  </CardTitle>
                  <CardDescription>
                    Arquivo contacts_*.csv exportado do sistema anterior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    {contactsFile ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm font-medium">{contactsFile}</p>
                        <p className="text-xs text-muted-foreground">{contacts.length} contatos</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Selecionar CSV</p>
                      </>
                    )}
                    <input type="file" accept=".csv,.txt" className="hidden" onChange={handleContactsFile} />
                  </label>
                </CardContent>
              </Card>

              {/* Invoices XLSX */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Receipt className="h-5 w-5" />
                    Faturas (XLSX)
                  </CardTitle>
                  <CardDescription>
                    Arquivo Relação_de_Faturas.xlsx exportado do sistema anterior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    {invoicesFile ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm font-medium">{invoicesFile}</p>
                        <p className="text-xs text-muted-foreground">{invoices.length} faturas / {contracts.length} contratos</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Selecionar XLSX</p>
                      </>
                    )}
                    <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleInvoicesFile} />
                  </label>
                </CardContent>
              </Card>
            </div>

            {/* Clear option */}
            {canPreview && (
              <Card className="border-destructive/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trash2 className="h-5 w-5 text-destructive" />
                      <div>
                        <Label htmlFor="clear-toggle" className="font-medium">Limpar dados existentes antes de importar</Label>
                        <p className="text-xs text-muted-foreground">
                          Remove contatos, contratos, faturas e lançamentos atuais
                        </p>
                      </div>
                    </div>
                    <Switch id="clear-toggle" checked={clearBeforeImport} onCheckedChange={setClearBeforeImport} />
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!canPreview}
              onClick={() => setStep("preview")}
            >
              Pré-visualizar dados ({contacts.length} contatos, {invoices.length} faturas)
            </Button>
          </div>
        )}

        {/* ── Preview Step ── */}
        {step === "preview" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{contacts.length}</p>
                      <p className="text-sm text-muted-foreground">Contatos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{contracts.length}</p>
                      <p className="text-sm text-muted-foreground">Contratos (extraídos)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{invoices.length}</p>
                      <p className="text-sm text-muted-foreground">Faturas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {clearBeforeImport && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atenção!</AlertTitle>
                <AlertDescription>
                  Todos os dados existentes (contatos, contratos, faturas, lançamentos) serão removidos antes da importação.
                </AlertDescription>
              </Alert>
            )}

            {/* Data Preview */}
            <Tabs defaultValue="contatos">
              <TabsList>
                <TabsTrigger value="contatos">Contatos ({contacts.length})</TabsTrigger>
                <TabsTrigger value="contratos">Contratos ({contracts.length})</TabsTrigger>
                <TabsTrigger value="faturas">Faturas ({invoices.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="contatos">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF/CNPJ</TableHead>
                            <TableHead>Celular</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Cidade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contacts.slice(0, 30).map((c, i) => (
                            <TableRow key={i}>
                              <TableCell>{getStatusIcon(c.status)}</TableCell>
                              <TableCell className="font-medium">{c.name}</TableCell>
                              <TableCell className="text-xs">{c.document}</TableCell>
                              <TableCell className="text-xs">{c.cellphone || c.phone}</TableCell>
                              <TableCell className="text-xs max-w-40 truncate">{c.email}</TableCell>
                              <TableCell className="text-xs">{c.city}/{c.state}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {contacts.length > 30 && (
                        <p className="p-3 text-xs text-muted-foreground text-center">
                          Mostrando 30 de {contacts.length} contatos
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contratos">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Nº Contrato</TableHead>
                            <TableHead>Qtd Faturas</TableHead>
                            <TableHead>Valor Médio</TableHead>
                            <TableHead>Primeiro Venc.</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contracts.slice(0, 30).map((ct, i) => (
                            <TableRow key={i}>
                              <TableCell>{getStatusIcon(ct.status)}</TableCell>
                              <TableCell className="font-medium">{ct.contractNumber}</TableCell>
                              <TableCell>{ct.invoiceCount}</TableCell>
                              <TableCell>R$ {ct.avgAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                              <TableCell className="text-xs">{ct.firstDueDate}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {contracts.length > 30 && (
                        <p className="p-3 text-xs text-muted-foreground text-center">
                          Mostrando 30 de {contracts.length} contratos
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faturas">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Nº Fatura</TableHead>
                            <TableHead>Contrato</TableHead>
                            <TableHead>Competência</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Pgto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.slice(0, 30).map((inv, i) => (
                            <TableRow key={i}>
                              <TableCell>{getStatusIcon(inv.status)}</TableCell>
                              <TableCell className="font-medium text-xs">{inv.invoiceNumber}</TableCell>
                              <TableCell className="text-xs">{inv.contractNumber}</TableCell>
                              <TableCell className="text-xs">{inv.referenceMonth}</TableCell>
                              <TableCell className="text-xs">{inv.dueDate}</TableCell>
                              <TableCell className="text-xs">R$ {inv.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                              <TableCell>
                                <Badge variant={inv.paymentStatus === "Pago" ? "default" : "secondary"} className="text-xs">
                                  {inv.paymentStatus}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {invoices.length > 30 && (
                        <p className="p-3 text-xs text-muted-foreground text-center">
                          Mostrando 30 de {invoices.length} faturas
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("upload")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button className="flex-1" size="lg" onClick={startImport} disabled={accountLoading}>
                {clearBeforeImport ? "Limpar e Importar Tudo" : "Iniciar Importação"}
              </Button>
            </div>
          </>
        )}

        {/* ── Importing / Done Step ── */}
        {(step === "importing" || step === "done") && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{currentPhase}</p>
                  <Badge variant={step === "done" ? "default" : "secondary"}>
                    {progress}%
                  </Badge>
                </div>
                <Progress value={progress} className="h-3" />
              </CardContent>
            </Card>

            {/* Results summary */}
            {step === "done" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contacts.length > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" /> Contatos
                        </h3>
                        {(() => { const s = countByStatus(contacts); return (
                          <div className="space-y-1 text-sm">
                            <p className="text-green-600">✓ {s.success} importados</p>
                            {s.duplicate > 0 && <p className="text-yellow-600">⚠ {s.duplicate} duplicados</p>}
                            {s.error > 0 && <p className="text-destructive">✗ {s.error} erros</p>}
                          </div>
                        ); })()}
                      </CardContent>
                    </Card>
                  )}
                  {contracts.length > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Contratos
                        </h3>
                        {(() => { const s = countByStatus(contracts); return (
                          <div className="space-y-1 text-sm">
                            <p className="text-green-600">✓ {s.success} importados</p>
                            {s.duplicate > 0 && <p className="text-yellow-600">⚠ {s.duplicate} duplicados</p>}
                            {s.error > 0 && <p className="text-destructive">✗ {s.error} erros</p>}
                          </div>
                        ); })()}
                      </CardContent>
                    </Card>
                  )}
                  {invoices.length > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <Receipt className="h-4 w-4" /> Faturas
                        </h3>
                        {(() => { const s = countByStatus(invoices); return (
                          <div className="space-y-1 text-sm">
                            <p className="text-green-600">✓ {s.success} importadas</p>
                            {s.error > 0 && <p className="text-destructive">✗ {s.error} erros</p>}
                          </div>
                        ); })()}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate("/configuracoes")}>
                    Voltar às Configurações
                  </Button>
                  <Button onClick={() => navigate("/contatos")}>
                    Ver Contatos Importados
                  </Button>
                  <Button onClick={() => navigate("/faturas")}>
                    Ver Faturas Importadas
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ImportConciliacao;
