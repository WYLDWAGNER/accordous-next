import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Plataforma de Gestão de Imóveis</CardTitle>
          <CardDescription>Bem-vindo, {user?.user_metadata?.full_name || user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Acesso Ativo</h2>
            <p className="text-muted-foreground">
              Você está conectado à plataforma de gestão de imóveis e contratos de locação.
              O sistema está pronto para uso.
            </p>
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-medium mb-2">Próximos Passos:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Cadastre seus imóveis</li>
                <li>Registre contratos de locação</li>
                <li>Gerencie faturas e cobranças</li>
                <li>Acompanhe documentos e relatórios</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
