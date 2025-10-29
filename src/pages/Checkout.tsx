import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Mail, HelpCircle, CheckCircle2 } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema.",
    });
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Licença Expirada</CardTitle>
          <CardDescription>
            Sua licença expirou. Renove para continuar usando o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Plano Mensal</p>
              <p className="text-3xl font-bold">R$ 99,00<span className="text-base font-normal text-muted-foreground">/mês</span></p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">O plano inclui:</p>
              <ul className="space-y-2">
                {[
                  "Gestão completa de imóveis",
                  "Contratos e faturas ilimitados",
                  "Relatórios e documentos",
                  "Suporte prioritário",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button className="w-full" size="lg">
            Renovar Licença
          </Button>

          <Separator />

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.open('mailto:suporte@seudominio.com', '_blank')}
            >
              <Mail className="mr-2 h-4 w-4" />
              Contatar Suporte
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('https://seudominio.com/ajuda', '_blank')}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Central de Ajuda
            </Button>

            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Após a renovação, sua licença será ativada automaticamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;