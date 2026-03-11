import { useState, useCallback } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, Users, FileText, Receipt, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccountId } from "@/hooks/useAccountId";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ContactRow {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  activeContract: string;
  status?: "pending" | "success" | "error" | "duplicate";
  message?: string;
}

interface ContractRow {
  contractNumber: string;
  tenantName: string;
  rentalValue: number;
  earliestDueDate: string;
  status?: "pending" | "success" | "error" | "duplicate";
  message?: string;
  generatedId?: string;
}

interface InvoiceRow {
  invoiceNumber: string;
  contractNumber: string;
  tenantName: string;
  amount: number;
  referenceMonth: string;
  dueDate: string;
  paymentStatus: string;
  status?: "pending" | "success" | "error";
  message?: string;
}

type ImportStep = "upload" | "preview" | "importing" | "done";

const ImportConciliacao = () => {
  const navigate = useNavigate();
  const { accountId, loading: accountLoading } = useAccountId();
  const [step, setStep] = useState<ImportStep>("upload");
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("");

  const parseDateBR = (dateStr: string): string | null => {
    if (!dateStr) return null;
    // Handle DD/MM/YYYY
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return null;
  };

  const parseRefMonth = (refStr: string): string | null => {
    if (!refStr) return null;
    // Handle MM/YYYY
    const parts = refStr.split("/");
    if (parts.length === 2) {
      const [month, year] = parts;
      return `${year}-${month.padStart(2, "0")}-01`;
    }
    return null;
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Parse Page 5: Fonte_Inquilinos (contacts)
        const inquilinosSheet = workbook.Sheets[workbook.SheetNames[4]]; // 5th sheet
        if (inquilinosSheet) {
          const rows = XLSX.utils.sheet_to_json<any>(inquilinosSheet, { header: 1 });
          const parsed: ContactRow[] = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[1]) continue; // skip empty
            parsed.push({
              id: String(row[0] || ""),
              name: String(row[1] || ""),
              document: String(row[2] || ""),
              phone: String(row[3] || ""),
              email: String(row[4] || ""),
              address: String(row[5] || ""),
              birthDate: String(row[6] || ""),
              activeContract: String(row[7] || ""),
              status: "pending",
            });
          }
          setContacts(parsed);
        }

        // Parse Page 4: Fonte_Faturas (invoices + contracts)
        const faturasSheet = workbook.Sheets[workbook.SheetNames[3]]; // 4th sheet
        if (faturasSheet) {
          const rows = XLSX.utils.sheet_to_json<any>(faturasSheet, { header: 1 });
          const parsedInvoices: InvoiceRow[] = [];
          const contractMap = new Map<string, ContractRow>();

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[0]) continue;

            const contractNum = String(row[1] || "");
            const tenantName = String(row[2] || "");
            const amount = Number(row[3] || 0);
            const refMonth = String(row[4] || "");
            const dueDate = String(row[5] || "");
            const payStatus = String(row[6] || "");

            parsedInvoices.push({
              invoiceNumber: String(row[0]),
              contractNumber: contractNum,
              tenantName,
              amount,
              referenceMonth: refMonth,
              dueDate,
              paymentStatus: payStatus,
              status: "pending",
            });

            // Build unique contracts
            if (contractNum && !contractMap.has(contractNum)) {
              contractMap.set(contractNum, {
                contractNumber: contractNum,
                tenantName,
                rentalValue: amount,
                earliestDueDate: dueDate,
                status: "pending",
              });
            }
          }

          setInvoices(parsedInvoices);
          setContracts(Array.from(contractMap.values()));
        }

        setStep("preview");
        toast.success(`Arquivo processado: ${contacts.length || "?"} contatos, faturas e contratos identificados`);
      } catch (err) {
        console.error("Erro ao processar arquivo:", err);
        toast.error("Erro ao processar o arquivo XLSX");
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const startImport = async () => {
    if (!accountId) {
      toast.error("Account ID não encontrado");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setStep("importing");
    const totalSteps = contacts.length + contracts.length + invoices.length;
    let completed = 0;

    // PHASE 1: Import Contacts
    setCurrentPhase("Importando contatos...");
    const updatedContacts = [...contacts];
    for (let i = 0; i < updatedContacts.length; i++) {
      const c = updatedContacts[i];
      try {
        // Check if document already exists
        if (c.document) {
          const { data: existing } = await supabase
            .from("contacts")
            .select("id")
            .eq("account_id", accountId)
            .eq("document", c.document)
            .maybeSingle();

          if (existing) {
            updatedContacts[i] = { ...c, status: "duplicate", message: "CPF já cadastrado" };
            completed++;
            setProgress(Math.round((completed / totalSteps) * 100));
            setContacts([...updatedContacts]);
            continue;
          }
        }

        const { error } = await supabase.from("contacts").insert({
          user_id: user.id,
          account_id: accountId,
          name: c.name,
          document: c.document || null,
          phone: c.phone || null,
          email: c.email || null,
          address: c.address || null,
          contact_type: "inquilino",
          status: "active",
          notes: c.birthDate ? `Data de nascimento: ${c.birthDate}` : null,
        });

        if (error) throw error;
        updatedContacts[i] = { ...c, status: "success" };
      } catch (err: any) {
        updatedContacts[i] = { ...c, status: "error", message: err.message };
      }
      completed++;
      setProgress(Math.round((completed / totalSteps) * 100));
      setContacts([...updatedContacts]);
    }

    // PHASE 2: Import Contracts
    setCurrentPhase("Importando contratos...");
    const updatedContracts = [...contracts];
    const contractIdMap = new Map<string, string>(); // contractNumber -> UUID

    for (let i = 0; i < updatedContracts.length; i++) {
      const ct = updatedContracts[i];
      try {
        // Check if contract_number already exists
        const { data: existing } = await supabase
          .from("contracts")
          .select("id")
          .eq("account_id", accountId)
          .eq("contract_number", ct.contractNumber)
          .maybeSingle();

        if (existing) {
          contractIdMap.set(ct.contractNumber, existing.id);
          updatedContracts[i] = { ...ct, status: "duplicate", message: "Contrato já existe", generatedId: existing.id };
          completed++;
          setProgress(Math.round((completed / totalSteps) * 100));
          setContracts([...updatedContracts]);
          continue;
        }

        const startDate = parseDateBR(ct.earliestDueDate) || new Date().toISOString().split("T")[0];

        const { data, error } = await supabase.from("contracts").insert({
          user_id: user.id,
          account_id: accountId,
          contract_number: ct.contractNumber,
          tenant_name: ct.tenantName,
          rental_value: ct.rentalValue,
          start_date: startDate,
          status: "active",
          payment_day: new Date(startDate).getDate() || 5,
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

    // PHASE 3: Import Invoices
    setCurrentPhase("Importando faturas...");
    const updatedInvoices = [...invoices];

    for (let i = 0; i < updatedInvoices.length; i++) {
      const inv = updatedInvoices[i];
      try {
        const contractId = contractIdMap.get(inv.contractNumber) || null;
        const dueDate = parseDateBR(inv.dueDate);
        const refMonth = parseRefMonth(inv.referenceMonth);

        if (!dueDate || !refMonth) {
          updatedInvoices[i] = { ...inv, status: "error", message: "Data inválida" };
          completed++;
          setProgress(Math.round((completed / totalSteps) * 100));
          setInvoices([...updatedInvoices]);
          continue;
        }

        // Determine status
        const isPastDue = new Date(dueDate) < new Date();
        const invoiceStatus = inv.paymentStatus === "Pago" ? "paid" : (isPastDue ? "overdue" : "pending");

        const { error } = await supabase.from("invoices").insert({
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
          notes: `Importado da conciliação. Inquilino: ${inv.tenantName}`,
        });

        if (error) throw error;
        updatedInvoices[i] = { ...inv, status: "success" };
      } catch (err: any) {
        updatedInvoices[i] = { ...inv, status: "error", message: err.message };
      }
      completed++;
      setProgress(Math.round((completed / totalSteps) * 100));
      setInvoices([...updatedInvoices]);
    }

    setStep("done");
    setCurrentPhase("Importação concluída!");
    toast.success("Importação concluída com sucesso!");
  };

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

  return (
    <AppLayout title="Importar Conciliação">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/configuracoes")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Importar Conciliação</h1>
            <p className="text-muted-foreground text-sm">
              Importe contatos, contratos e faturas a partir da planilha de conciliação XLSX.
            </p>
          </div>
        </div>

        {/* Upload Step */}
        {step === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Upload da Planilha
              </CardTitle>
              <CardDescription>
                Selecione o arquivo XLSX da conciliação (faturas × inquilinos).
                O sistema irá processar as abas Fonte_Inquilinos e Fonte_Faturas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Clique para selecionar o arquivo .xlsx</p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </CardContent>
          </Card>
        )}

        {/* Preview Step */}
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
                      <p className="text-sm text-muted-foreground">Contatos (Inquilinos)</p>
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
                      <p className="text-sm text-muted-foreground">Contratos</p>
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
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF/CNPJ</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contacts.slice(0, 20).map((c, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{c.name}</TableCell>
                              <TableCell>{c.document}</TableCell>
                              <TableCell>{c.phone}</TableCell>
                              <TableCell className="max-w-48 truncate">{c.email}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {contacts.length > 20 && (
                        <p className="text-center text-sm text-muted-foreground py-2">
                          ... e mais {contacts.length - 20} contatos
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
                            <TableHead>Nº Contrato</TableHead>
                            <TableHead>Inquilino</TableHead>
                            <TableHead>Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contracts.map((ct, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{ct.contractNumber}</TableCell>
                              <TableCell>{ct.tenantName}</TableCell>
                              <TableCell>R$ {ct.rentalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                            <TableHead>Nº Fatura</TableHead>
                            <TableHead>Contrato</TableHead>
                            <TableHead>Inquilino</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Competência</TableHead>
                            <TableHead>Vencimento</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.slice(0, 20).map((inv, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                              <TableCell>{inv.contractNumber}</TableCell>
                              <TableCell>{inv.tenantName}</TableCell>
                              <TableCell>R$ {inv.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell>{inv.referenceMonth}</TableCell>
                              <TableCell>{inv.dueDate}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {invoices.length > 20 && (
                        <p className="text-center text-sm text-muted-foreground py-2">
                          ... e mais {invoices.length - 20} faturas
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep("upload"); setContacts([]); setContracts([]); setInvoices([]); }}>
                Cancelar
              </Button>
              <Button onClick={startImport} disabled={accountLoading || !accountId}>
                <Upload className="h-4 w-4 mr-2" />
                Iniciar Importação ({contacts.length} contatos + {contracts.length} contratos + {invoices.length} faturas)
              </Button>
            </div>
          </>
        )}

        {/* Importing / Done Steps */}
        {(step === "importing" || step === "done") && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{step === "done" ? "Importação Concluída" : "Importando..."}</CardTitle>
                <CardDescription>{currentPhase}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">{progress}%</p>

                {/* Results summary */}
                {step === "done" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {[
                      { label: "Contatos", stats: countByStatus(contacts) },
                      { label: "Contratos", stats: countByStatus(contracts) },
                      { label: "Faturas", stats: countByStatus(invoices) },
                    ].map(({ label, stats }) => (
                      <div key={label} className="rounded-lg border p-4 space-y-2">
                        <h3 className="font-semibold">{label}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="default">{stats.success} importados</Badge>
                          {stats.duplicate > 0 && <Badge variant="secondary">{stats.duplicate} duplicados</Badge>}
                          {stats.error > 0 && <Badge variant="destructive">{stats.error} erros</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed results */}
            <Tabs defaultValue="contatos">
              <TabsList>
                <TabsTrigger value="contatos">Contatos</TabsTrigger>
                <TabsTrigger value="contratos">Contratos</TabsTrigger>
                <TabsTrigger value="faturas">Faturas</TabsTrigger>
              </TabsList>

              <TabsContent value="contatos">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10"></TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Resultado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contacts.map((c, i) => (
                            <TableRow key={i}>
                              <TableCell>{getStatusIcon(c.status)}</TableCell>
                              <TableCell className="font-medium">{c.name}</TableCell>
                              <TableCell>{c.document}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{c.message || (c.status === "success" ? "OK" : "")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                            <TableHead className="w-10"></TableHead>
                            <TableHead>Nº Contrato</TableHead>
                            <TableHead>Inquilino</TableHead>
                            <TableHead>Resultado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contracts.map((ct, i) => (
                            <TableRow key={i}>
                              <TableCell>{getStatusIcon(ct.status)}</TableCell>
                              <TableCell className="font-medium">{ct.contractNumber}</TableCell>
                              <TableCell>{ct.tenantName}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{ct.message || (ct.status === "success" ? "OK" : "")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                            <TableHead className="w-10"></TableHead>
                            <TableHead>Nº Fatura</TableHead>
                            <TableHead>Contrato</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Resultado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((inv, i) => (
                            <TableRow key={i}>
                              <TableCell>{getStatusIcon(inv.status)}</TableCell>
                              <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                              <TableCell>{inv.contractNumber}</TableCell>
                              <TableCell>R$ {inv.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{inv.message || (inv.status === "success" ? "OK" : "")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {step === "done" && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/configuracoes")}>
                  Voltar às Configurações
                </Button>
                <Button onClick={() => navigate("/contatos")}>
                  Ver Contatos
                </Button>
                <Button variant="outline" onClick={() => navigate("/faturas")}>
                  Ver Faturas
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ImportConciliacao;
