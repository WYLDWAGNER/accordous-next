import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportPropertiesDialog } from "@/components/Properties/ImportPropertiesDialog";
import { ImportContactsDialog } from "@/components/Contacts/ImportContactsDialog";
import { Building2, Users } from "lucide-react";

const GeneralSettings = () => {
  return (
    <AppLayout title="Configurações Gerais">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações Gerais</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua conta e importações de dados.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Importação de Dados
            </CardTitle>
            <CardDescription>
              Importe imóveis e contatos em lote através de arquivos CSV.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Imóveis</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cadastre múltiplos imóveis de uma vez usando uma planilha CSV.
                </p>
                <ImportPropertiesDialog />
              </div>

              <div className="flex-1 rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Contatos / Inquilinos</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Importe seus contatos e inquilinos em lote via CSV.
                </p>
                <ImportContactsDialog />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default GeneralSettings;
