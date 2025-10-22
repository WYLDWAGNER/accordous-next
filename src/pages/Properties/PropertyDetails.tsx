import { useParams, Link, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Edit, FileText, Trash2, MapPin, Building2, Calendar, User, Phone, Mail, 
  FileCheck, AlertCircle, Image, Camera, Home, DollarSign, Clock, 
  Shield, TrendingUp, Upload, Eye, UserPlus, Briefcase
} from "lucide-react";
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

  const { data: invoices } = useQuery({
    queryKey: ["property-invoices", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("property_id", id)
        .order("due_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const activeContract = contracts?.find(c => c.status === "active");
  const pendingInvoices = invoices?.filter(inv => inv.status === "pending") || [];

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
      rented: { variant: "secondary" as const, label: "Contratado" },
      maintenance: { variant: "outline" as const, label: "Manutenção" },
      unavailable: { variant: "destructive" as const, label: "Indisponível" },
    };

    return variants[status as keyof typeof variants] || variants.available;
  };

  const getInvoiceStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "outline" as const, label: "Pendente" },
      paid: { variant: "default" as const, label: "Pago" },
      overdue: { variant: "destructive" as const, label: "Vencido" },
      cancelled: { variant: "secondary" as const, label: "Cancelado" },
    };

    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={property.name} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Alertas de Pendência */}
            {pendingInvoices.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ops! Temos algumas faturas pendentes</strong>
                  <br />
                  Notamos que você possui {pendingInvoices.length} fatura(s) pendente(s). Para continuar aproveitando 
                  todos os recursos da plataforma, por favor, confira suas faturas.
                </AlertDescription>
              </Alert>
            )}

            {/* Identificação Completa */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold">{property.name}</h1>
                        <Badge variant={getStatusBadge(property.status).variant}>
                          {getStatusBadge(property.status).label}
                        </Badge>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span className="text-sm">
                          {property.address}{property.number && `, ${property.number}`}
                          {property.complement && ` ${property.complement}`}
                          {property.neighborhood && `, ${property.neighborhood}`} - {property.city}/{property.state}
                          {property.postal_code && ` - CEP: ${property.postal_code}`}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>{" "}
                          <span className="font-medium capitalize">{property.property_type}</span>
                        </div>
                        {property.classification && (
                          <div>
                            <span className="text-muted-foreground">Classificação:</span>{" "}
                            <span className="font-medium">{property.classification}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumo das Dimensões */}
                <div className="grid grid-cols-4 gap-4 py-4 border-t">
                  {property.useful_area && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Área Útil</p>
                      <p className="text-xl font-bold">{property.useful_area}m²</p>
                    </div>
                  )}
                  {property.total_area && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Área Total</p>
                      <p className="text-xl font-bold">{property.total_area}m²</p>
                    </div>
                  )}
                  {property.built_area && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Área Construção</p>
                      <p className="text-xl font-bold">{property.built_area}m²</p>
                    </div>
                  )}
                  {property.land_area && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Área Terreno</p>
                      <p className="text-xl font-bold">{property.land_area}m²</p>
                    </div>
                  )}
                </div>

                {/* Pessoas Vinculadas */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {property.owner_name && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-primary/10 p-2">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Proprietário</p>
                            <p className="font-semibold">{property.owner_name}</p>
                            {property.owner_contact && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" /> {property.owner_contact}
                              </p>
                            )}
                            {property.owner_email && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" /> {property.owner_email}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {activeContract && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-secondary/10 p-2">
                            <User className="h-5 w-5 text-secondary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Inquilino</p>
                            <p className="font-semibold">{activeContract.tenant_name}</p>
                            {activeContract.tenant_phone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" /> {activeContract.tenant_phone}
                              </p>
                            )}
                            {activeContract.tenant_email && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" /> {activeContract.tenant_email}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Botão Editar */}
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/imoveis/${id}/editar`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Informações do Imóvel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <UserPlus className="h-5 w-5" />
                <span className="text-xs">Vincular Pessoas</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <Upload className="h-5 w-5" />
                <span className="text-xs">Cadastrar Documentos</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <Home className="h-5 w-5" />
                <span className="text-xs">Anunciar Imóvel</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <Briefcase className="h-5 w-5" />
                <span className="text-xs">Ver Contrato</span>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Coluna Principal - 2/3 */}
              <div className="col-span-2 space-y-6">
                {/* Resumo do Contrato Vigente */}
                {activeContract ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5" />
                        Contrato Vigente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                          <p className="font-medium">Contrato de Locação</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Status</p>
                          <Badge variant="default">Vigente</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Início da Vigência</p>
                          <p className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(activeContract.start_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Fim da Vigência</p>
                          <p className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {activeContract.end_date ? new Date(activeContract.end_date).toLocaleDateString('pt-BR') : 'Indeterminado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Valor</p>
                          <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            R$ {Number(activeContract.rental_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Vencimento</p>
                          <p className="font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Dia {activeContract.payment_day}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Garantia</p>
                          <p className="font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {activeContract.guarantee_type || 'Sem Garantia'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Reajuste</p>
                          <p className="font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            {activeContract.adjustment_index || 'Não especificado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Método de Pagamento</p>
                          <p className="font-medium">{activeContract.payment_method === 'bank_transfer' ? 'Transferência Bancária' : activeContract.payment_method}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Cobrança Pré-Paga</p>
                          <p className="font-medium">{activeContract.pre_paid ? 'Sim' : 'Não'}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Link to={`/contratos/${activeContract.id}`}>
                          <Button variant="outline" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes do Contrato
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileCheck className="h-12 w-12 text-muted-foreground mb-3" />
                      <h3 className="font-semibold mb-2">Sem contrato vigente</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Este imóvel não possui um contrato ativo no momento.
                      </p>
                      <Button>Criar Novo Contrato</Button>
                    </CardContent>
                  </Card>
                )}

                {/* Tabela de Faturas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Histórico de Faturas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {invoices && invoices.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Método Pagamento</TableHead>
                            <TableHead>Referência</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Situação</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="text-sm">
                                {invoice.payment_method === 'bank_transfer' ? 'Transferência Bancária' : invoice.payment_method}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(invoice.reference_month).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell className="text-sm font-semibold">
                                R$ {Number(invoice.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getInvoiceStatusBadge(invoice.status).variant}>
                                  {getInvoiceStatusBadge(invoice.status).label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Link to={`/faturas/${invoice.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma fatura registrada</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Coluna Lateral - 1/3 */}
              <div className="space-y-6">
                {/* Fotos do Imóvel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Image className="h-5 w-5" />
                      Fotos do Imóvel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Nenhuma foto cadastrada</p>
                      <Button size="sm" variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Adicionar Fotos
                      </Button>
                    </div>
                    <Button variant="link" className="w-full mt-3">
                      <Camera className="mr-2 h-4 w-4" />
                      Solicitar Fotógrafo
                    </Button>
                  </CardContent>
                </Card>

                {/* Documentos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-5 w-5" />
                      Documentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Nenhum documento cadastrado</p>
                      <Button variant="outline" className="w-full" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Cadastrar Documento
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Visitas e Propostas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-5 w-5" />
                      Visitas e Propostas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Nenhuma visita registrada</p>
                      <Button variant="outline" className="w-full" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Agendar Visita
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Dados Cartoriais */}
                {property.registry_data && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileCheck className="h-5 w-5" />
                        Dados Cartoriais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{property.registry_data}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PropertyDetails;
