import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

const plans: Record<string, Plan> = {
  comeco: {
    id: "comeco",
    name: "COMEÇO",
    price: 149,
    features: [
      "1 usuário",
      "Até 10 imóveis cadastrados",
      "Gestão básica de contratos",
      "Suporte técnico 1:1",
      "Integração com WhatsApp",
      "IA para atendimento básico",
    ],
  },
  impulso: {
    id: "impulso",
    name: "IMPULSO",
    price: 299,
    features: [
      "5 usuários",
      "Até 50 imóveis cadastrados",
      "Gestão completa de contratos",
      "Integração com equipe de suporte",
      "Suporte técnico 1:1",
      "IA avançada para qualificação",
    ],
  },
  escalavel: {
    id: "escalavel",
    name: "ESCALÁVEL",
    price: 369,
    features: [
      "10 usuários",
      "Até 150 imóveis cadastrados",
      "Gestão avançada de contratos",
      "Suporte técnico 1:1",
      "IA completa para conversão",
    ],
  },
  profissional: {
    id: "profissional",
    name: "PROFISSIONAL",
    price: 739,
    features: [
      "25 usuários",
      "Imóveis ilimitados",
      "Gestão empresarial completa",
      "IA completa personalizada",
      "Consultoria dedicada",
    ],
  },
};

export default function CheckoutPlan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saveInfo, setSaveInfo] = useState(false);

  const planId = searchParams.get("plan") || "comeco";
  const selectedPlan = plans[planId];

  const [formData, setFormData] = useState({
    email: user?.email || "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardholderName: "",
    country: "Brasil",
  });

  useEffect(() => {
    if (!selectedPlan) {
      navigate("/plans");
    }
  }, [selectedPlan, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular processamento de pagamento
    setTimeout(() => {
      toast({
        title: "Pagamento processado!",
        description: "Sua assinatura foi ativada com sucesso.",
      });
      navigate("/");
      setLoading(false);
    }, 2000);
  };

  if (!selectedPlan) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Selecione o seu plano
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">{user?.email}</span>
            <Button
              variant="outline"
              onClick={signOut}
              className="bg-transparent border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              Sair
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plan Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 sticky top-8">
              <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
                Plano - {selectedPlan.name}
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedPlan.name}
              </h2>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-bold text-white">R$</span>
                <span className="text-5xl font-bold text-white">
                  {selectedPlan.price}
                </span>
                <span className="text-slate-400">/mês</span>
              </div>

              <div className="space-y-3">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="bg-blue-600 rounded-full p-1 mt-0.5">
                      <Check className="text-white" size={12} />
                    </div>
                    <span className="text-sm text-slate-200">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-slate-900 p-3 rounded-lg">
                  <CreditCard className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Assinar Plano {selectedPlan.name}
                  </h3>
                  <p className="text-slate-400">
                    R$ {selectedPlan.price.toFixed(2)} por mês
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-slate-200">Forma de pagamento</Label>
                  
                  <div className="flex items-center gap-2 text-slate-200">
                    <div className="bg-slate-900 p-2 rounded">
                      <CreditCard size={20} />
                    </div>
                    <span>Cartão</span>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-slate-200">
                        Número do cartão
                      </Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 1234 1234 1234"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, cardNumber: e.target.value })
                        }
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="text-slate-200">
                          Validade (MM/AA)
                        </Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM / AA"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            setFormData({ ...formData, expiryDate: e.target.value })
                          }
                          required
                          className="bg-slate-900/50 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc" className="text-slate-200">
                          CVC
                        </Label>
                        <Input
                          id="cvc"
                          placeholder="CVC"
                          value={formData.cvc}
                          onChange={(e) =>
                            setFormData({ ...formData, cvc: e.target.value })
                          }
                          required
                          className="bg-slate-900/50 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardholderName" className="text-slate-200">
                        Nome do titular do cartão
                      </Label>
                      <Input
                        id="cardholderName"
                        placeholder="Nome completo"
                        value={formData.cardholderName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardholderName: e.target.value,
                          })
                        }
                        required
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-slate-200">
                        País ou região
                      </Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          setFormData({ ...formData, country: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Brasil">Brasil</SelectItem>
                          <SelectItem value="Portugal">Portugal</SelectItem>
                          <SelectItem value="EUA">Estados Unidos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveInfo"
                    checked={saveInfo}
                    onCheckedChange={(checked) =>
                      setSaveInfo(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="saveInfo"
                    className="text-sm text-slate-200 cursor-pointer"
                  >
                    Salvar informações para futuras compras
                  </label>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-300">
                    Ao clicar em "Assinar", você autoriza cobranças recorrentes
                    no valor de <strong>R$ {selectedPlan.price.toFixed(2)}</strong> a
                    cada mês até o cancelamento.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl"
                  disabled={loading}
                >
                  {loading ? "Processando..." : "Assinar agora"}
                </Button>

                <div className="text-center text-xs text-slate-400 space-y-1">
                  <p>
                    Powered by{" "}
                    <span className="text-blue-400 font-semibold">Stripe</span>
                  </p>
                  <div className="flex justify-center gap-4">
                    <a href="#" className="hover:text-slate-200">
                      Termos
                    </a>
                    <a href="#" className="hover:text-slate-200">
                      Privacidade
                    </a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
