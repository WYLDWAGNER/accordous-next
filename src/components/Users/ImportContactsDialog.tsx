import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccountId } from "@/hooks/useAccountId";
import { useToast } from "@/hooks/use-toast";

interface CsvRow {
  [key: string]: string;
}

const REQUIRED_FIELDS = ["name", "contact_type"];

const FIELD_LABELS: Record<string, string> = {
  name: "Nome",
  contact_type: "Tipo (inquilino, proprietario, fiador, etc)",
  document: "CPF/CNPJ",
  phone: "Telefone",
  email: "Email",
  address: "Endereço",
  company: "Empresa",
  status: "Status (active, inactive)",
  notes: "Observações",
};

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(/[;,](?=(?:[^"]*"[^"]*")*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, "").toLowerCase().replace(/\s+/g, "_"));

  return lines.slice(1).map(line => {
    const values = line.split(/[;,](?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ""));
    const row: CsvRow = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
}

export function ImportContactsDialog({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const { accountId } = useAccountId();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCsv(text);
      if (rows.length > 0) {
        setCsvData(rows);
        setHeaders(Object.keys(rows[0]));
        setResult(null);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "O arquivo CSV não contém dados válidos.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const missingFields = REQUIRED_FIELDS.filter(f => !headers.includes(f));

  const handleImport = async () => {
    if (!user || missingFields.length > 0) return;
    setImporting(true);
    let success = 0;
    let errors = 0;

    for (const row of csvData) {
      const contact = {
        user_id: user.id,
        account_id: accountId,
        name: row.name || "",
        contact_type: row.contact_type || "inquilino",
        document: row.document || null,
        phone: row.phone || null,
        email: row.email || null,
        address: row.address || null,
        company: row.company || null,
        status: row.status || "active",
        notes: row.notes || null,
      };

      const { error } = await supabase.from("contacts").insert(contact);
      if (error) {
        console.error("Error importing contact:", error);
        errors++;
      } else {
        success++;
      }
    }

    setResult({ success, errors });
    setImporting(false);
    onSuccess?.();

    toast({
      title: "Importação concluída",
      description: `${success} contato(s) importado(s)${errors > 0 ? `, ${errors} erro(s)` : ""}.`,
      variant: errors > 0 ? "destructive" : "default",
    });
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCsvData([]);
      setHeaders([]);
      setResult(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const templateHeaders = Object.keys(FIELD_LABELS).join(";");
    const exampleRow = "João Silva;inquilino;123.456.789-00;(41) 99999-9999;joao@email.com;Rua das Flores 123;Empresa X;active;Observações aqui";
    const csv = `${templateHeaders}\n${exampleRow}`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_contatos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Contatos via CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Baixar modelo CSV
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Colunas obrigatórias: <strong>{REQUIRED_FIELDS.map(f => FIELD_LABELS[f] || f).join(", ")}</strong>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
          </div>

          {missingFields.length > 0 && csvData.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Colunas obrigatórias ausentes: <strong>{missingFields.join(", ")}</strong>
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant={result.errors > 0 ? "destructive" : "default"}>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {result.success} contato(s) importado(s) com sucesso
                {result.errors > 0 && `, ${result.errors} erro(s)`}.
              </AlertDescription>
            </Alert>
          )}

          {csvData.length > 0 && (
            <>
              <p className="text-sm font-medium">
                Pré-visualização ({csvData.length} registro(s)):
              </p>
              <div className="border rounded-md overflow-x-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.slice(0, 6).map(h => (
                        <TableHead key={h} className="text-xs whitespace-nowrap">
                          {FIELD_LABELS[h] || h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 10).map((row, i) => (
                      <TableRow key={i}>
                        {headers.slice(0, 6).map(h => (
                          <TableCell key={h} className="text-xs py-1">
                            {row[h] || "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {csvData.length > 10 && (
                <p className="text-xs text-muted-foreground">
                  Mostrando 10 de {csvData.length} registros.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={csvData.length === 0 || missingFields.length > 0 || importing || !!result}
          >
            {importing ? "Importando..." : `Importar ${csvData.length} contato(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
