import { useParams, Link, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, FileText, Trash2, MapPin, Building2, Calendar, User, Phone, Mail, FileCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: contracts } = useQuery({
    queryKey: ["property-contracts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("property_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Imóvel não encontrado" />
          <main className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Imóvel não encontrado</h3>
                <p className="text-gray-500 text-center mb-4">
                  O imóvel que você está procurando não existe ou foi removido.
                </p>
                <Button onClick={() => navigate("/imoveis")}>Voltar para lista</Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      available: { variant: "default" as const, label: "Disponível" },
      rented: { variant: "secondary" as const, label: "Alugado" },
      maintenance: { variant: "outline" as const, label: "Manutenção" },
      unavailable: { variant: "destructive" as const, label: "Indisponível" },
    };

    return variants[status as keyof typeof variants] || variants.available;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={property.name} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold mb-2">{property.name}</h1>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {property.address}, {property.number} - {property.neighborhood}
                          <br />
                          {property.city}/{property.state} - {property.postal_code}
                        </span>
                      </div>
                      <Badge variant={getStatusBadge(property.status).variant}>
                        {getStatusBadge(property.status).label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/imoveis/${property.id}/editar`}>
                      <Button variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </Link>
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Relatório
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="contracts">Contratos ({contracts?.length || 0})</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                {/* Características */}
                <Card>
                  <CardHeader>
                    <CardTitle>Características do Imóvel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Tipo</p>
                        <p className="font-medium capitalize">{property.property_type}</p>
                      </div>
                      {property.classification && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Classificação</p>
                          <p className="font-medium">{property.classification}</p>
                        </div>
                      )}
                      {property.useful_area && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Área Útil</p>
                          <p className="font-medium">{property.useful_area}m²</p>
                        </div>
                      )}
                      {property.total_area && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Área Total</p>
                          <p className="font-medium">{property.total_area}m²</p>
                        </div>
                      )}
                      {property.construction_year && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Ano de Construção</p>
                          <p className="font-medium">{property.construction_year}</p>
                        </div>
                      )}
                    </div>

                    {property.registry_data && (
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-500 mb-2">Dados Cartoriais</p>
                        <p className="text-gray-700">{property.registry_data}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Proprietário */}
                {(property.owner_name || property.owner_contact || property.owner_email) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dados do Proprietário</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {property.owner_name && (
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{property.owner_name}</span>
                          </div>
                        )}
                        {property.owner_contact && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{property.owner_contact}</span>
                          </div>
                        )}
                        {property.owner_email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{property.owner_email}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="contracts">
                {contracts && contracts.length > 0 ? (
                  <div className="space-y-4">
                    {contracts.map((contract) => (
                      <Card key={contract.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold">{contract.tenant_name}</h3>
                                <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                                  {contract.status === "active" ? "Ativo" : "Inativo"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                Vigência: {new Date(contract.start_date).toLocaleDateString()} até{" "}
                                {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : "Indeterminado"}
                              </p>
                              <p className="text-lg font-semibold text-green-600">
                                R$ {Number(contract.rental_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
                              </p>
                            </div>
                            <Link to={`/contratos/${contract.id}`}>
                              <Button variant="outline" size="sm">
                                Ver Detalhes
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <FileCheck className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum contrato vinculado</h3>
                      <p className="text-gray-500 text-center mb-4">
                        Este imóvel ainda não possui contratos de locação.
                      </p>
                      <Button>Criar Novo Contrato</Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Em desenvolvimento</h3>
                    <p className="text-gray-500 text-center">
                      A funcionalidade de documentos estará disponível em breve.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Em desenvolvimento</h3>
                    <p className="text-gray-500 text-center">
                      O histórico de atividades estará disponível em breve.
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

export default PropertyDetails;
