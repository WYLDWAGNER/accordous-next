import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Checkout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Licença Expirada</CardTitle>
          <CardDescription>
            Sua licença expirou. Renove para continuar usando o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Plano: 30 dias
            </p>
            <p className="text-2xl font-bold">R$ 99,00/mês</p>
          </div>
          <Button className="w-full" size="lg">
            Renovar Licença
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;