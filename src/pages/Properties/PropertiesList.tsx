import { useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Building2, MapPin, Eye, Edit, Trash2, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PropertiesList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const filteredProperties = properties?.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        <Header title="Imóveis" />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Actions Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, endereço ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="rented">Alugado</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="unavailable">Indisponível</SelectItem>
              </SelectContent>
            </Select>

            <Link to="/imoveis/novo">
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Novo Imóvel
              </Button>
            </Link>
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                <p className="mt-4 text-muted-foreground">Carregando imóveis...</p>
              </div>
            </div>
          ) : filteredProperties && filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-50 p-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{property.name}</h3>
                          <p className="text-sm text-gray-500">{property.property_type}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(property.status).variant}>
                        {getStatusBadge(property.status).label}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {property.address}, {property.number} - {property.neighborhood}
                          <br />
                          {property.city}/{property.state}
                        </span>
                      </div>

                      {property.useful_area && (
                        <p className="text-sm text-gray-600">
                          Área útil: <span className="font-medium">{property.useful_area}m²</span>
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Link to={`/imoveis/${property.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </Button>
                      </Link>
                      <Link to={`/imoveis/${property.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum imóvel encontrado</h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Comece cadastrando seu primeiro imóvel"}
                </p>
                <Link to="/imoveis/novo">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Imóvel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default PropertiesList;
