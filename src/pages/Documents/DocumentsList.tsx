import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, 
  FilePlus, 
  Paperclip, 
  Settings2,
  FileSignature,
  Home,
  Building2,
  User,
  Calendar,
  Eye
} from "lucide-react";

const contractTemplates = [
  "Contrato de Prestação de Serviços de Corretagem Imobiliária",
  "Contrato de locação de garagem – título de capitalização",
  "Recibo de Chaves e Rescisão Provisória",
  "Distrato de contrato de locação",
  "Locação de Imóvel Residencial",
  "Termo de Rescisão de Contrato de Locação",
  "Contrato de Comodato",
  "Contrato particular de promessa de compra e venda – À vista",
  "Contrato de Locação por temporada",
  "Contrato de sublocação de imóvel residencial/comercial",
];

const DocumentsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          properties (
            id,
            name,
            address,
            city,
            state,
            neighborhood
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const activeContracts = contracts.filter(c => c.status === "active");
  const closedContracts = contracts.filter(c => c.status !== "active");

  const filteredContracts = (list: typeof contracts) => {
    return list.filter(contract => {
      const matchesSearch = searchTerm === "" || 
        contract.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.properties?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
      const matchesType = typeFilter === "all"; // Can be extended later
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Documentos" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Tabs defaultValue="contratos" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="contratos">Contratos</TabsTrigger>
                <TabsTrigger value="encerrados">Contratos Encerrados</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="contratos" className="space-y-6 mt-6">
                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <FileSignature className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-base">Criar novo Contrato ou Acordo</CardTitle>
                      <CardDescription className="text-xs">
                        Utilizado para cobranças fixas ou parceladas
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <FilePlus className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-base">Novo Documento</CardTitle>
                      <CardDescription className="text-xs">
                        Para documentos relativos ao imóvel ou procurações
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Paperclip className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-base">Anexar documento</CardTitle>
                      <CardDescription className="text-xs">
                        Somente para guardar documentos do imóvel
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Settings2 className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-base">Personalizar documentos</CardTitle>
                      <CardDescription className="text-xs">
                        Cadastro de identidade visual para personalizar documentos
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                {/* Contract Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Criar a partir de um modelo de contrato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {contractTemplates.map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-auto py-3 px-3 flex flex-col items-center gap-2 text-center hover:bg-accent"
                        >
                          <FileText className="h-6 w-6" />
                          <span className="text-xs leading-tight">{template}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ver Contratos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        placeholder="Pesquisar por contrato"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Situação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="active">Vigente</SelectItem>
                          <SelectItem value="expired">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="rental">Locação</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Proprietário" />
                    </div>

                    {/* Contracts List */}
                    <div className="space-y-4 mt-6">
                      {isLoading ? (
                        <p className="text-center text-muted-foreground">Carregando...</p>
                      ) : filteredContracts(activeContracts).length === 0 ? (
                        <p className="text-center text-muted-foreground">Nenhum contrato encontrado</p>
                      ) : (
                        filteredContracts(activeContracts).map((contract) => (
                          <Card key={contract.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="space-y-4 flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-lg">
                                          # {contract.contract_number || contract.id.slice(0, 8)}
                                        </h3>
                                        <Badge variant="secondary">Contrato de Locação</Badge>
                                        <Badge className="bg-green-500 hover:bg-green-600">
                                          Vigente
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Dt. Início:</span>
                                        <span className="font-medium">
                                          {new Date(contract.start_date).toLocaleDateString("pt-BR")}
                                        </span>
                                      </div>
                                      {contract.end_date && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Calendar className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-muted-foreground">Dt. Término:</span>
                                          <span className="font-medium">
                                            {new Date(contract.end_date).toLocaleDateString("pt-BR")}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex items-start gap-2 text-sm">
                                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                          <p className="text-muted-foreground">Imóvel:</p>
                                          <p className="font-medium">{contract.properties?.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {contract.properties?.address}, {contract.properties?.neighborhood} - {contract.properties?.city}/{contract.properties?.state}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                                    <div className="flex items-start gap-2 text-sm">
                                      <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                      <div>
                                        <p className="text-muted-foreground">Inquilino:</p>
                                        <p className="font-medium">{contract.tenant_name}</p>
                                        {contract.tenant_email && (
                                          <p className="text-xs text-muted-foreground">
                                            {contract.tenant_email}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  variant="outline"
                                  onClick={() => navigate(`/imoveis/${contract.property_id}`)}
                                  className="whitespace-nowrap"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="encerrados" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contratos Encerrados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {closedContracts.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum contrato encerrado encontrado
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {closedContracts.map((contract) => (
                          <Card key={contract.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{contract.tenant_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {contract.properties?.name}
                                  </p>
                                </div>
                                <Badge variant="secondary">{contract.status}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentos" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos</CardTitle>
                    <CardDescription>
                      Gerencie documentos relacionados aos seus imóveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      Funcionalidade em desenvolvimento
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentsList;
