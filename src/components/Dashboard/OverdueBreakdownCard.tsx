import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, ChevronDown, ChevronRight, Eye, Gavel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OverdueBucket } from "@/hooks/dashboard/useOverdueBreakdown";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface OverdueBreakdownCardProps {
  buckets: OverdueBucket[];
  totalOverdue: number;
  totalCount: number;
  isLoading?: boolean;
}

const getSeverityColor = (minDays: number) => {
  if (minDays <= 3) return "bg-yellow-500/15 text-yellow-700 border-yellow-300";
  if (minDays <= 5) return "bg-orange-500/15 text-orange-700 border-orange-300";
  if (minDays <= 15) return "bg-orange-600/15 text-orange-800 border-orange-400";
  if (minDays <= 30) return "bg-red-500/15 text-red-700 border-red-300";
  if (minDays <= 45) return "bg-red-600/15 text-red-800 border-red-400";
  return "bg-red-700/15 text-red-900 border-red-500";
};

const getSeverityBadge = (minDays: number) => {
  if (minDays <= 5) return "secondary";
  if (minDays <= 15) return "outline";
  if (minDays <= 30) return "destructive";
  return "destructive";
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const OverdueBreakdownCard = ({
  buckets,
  totalOverdue,
  totalCount,
  isLoading,
}: OverdueBreakdownCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openBucket, setOpenBucket] = useState<string | null>(null);

  if (isLoading) return null;

  const activeBuckets = buckets.filter((b) => b.count > 0);

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cobranças em Atraso por Período
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{totalCount} cobranças</p>
            <p className="text-sm font-bold text-destructive">{formatCurrency(totalOverdue)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {activeBuckets.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhuma cobrança em atraso 🎉
          </div>
        ) : (
          <>
            {/* Summary bars */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              {buckets.map((bucket) => (
                <button
                  key={bucket.label}
                  onClick={() =>
                    bucket.count > 0 &&
                    setOpenBucket(openBucket === bucket.label ? null : bucket.label)
                  }
                  className={`rounded-lg border p-3 text-center transition-all ${
                    bucket.count > 0
                      ? `${getSeverityColor(bucket.minDays)} cursor-pointer hover:shadow-md`
                      : "bg-muted/30 text-muted-foreground opacity-50 cursor-default"
                  } ${openBucket === bucket.label ? "ring-2 ring-destructive/50" : ""}`}
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide">{bucket.label}</p>
                  <p className="text-xl font-bold mt-1">{bucket.count}</p>
                  {bucket.count > 0 && (
                    <p className="text-[10px] mt-0.5 font-medium">{formatCurrency(bucket.total)}</p>
                  )}
                </button>
              ))}
            </div>

            {/* Detail table for selected bucket */}
            {openBucket && (
              <div className="border rounded-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Detalhes: {openBucket}
                  </span>
                  <div className="flex items-center gap-2">
                    {buckets.find((b) => b.label === openBucket)?.minDays! >= 30 && (
                      <Badge variant="destructive" className="text-[10px] gap-1">
                        <Gavel className="h-3 w-3" />
                        Considerar cobrança jurídica
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenBucket(null)}
                      className="h-6 w-6 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                </div>

                {isMobile ? (
                  <div className="p-3 space-y-2">
                    {buckets
                      .find((b) => b.label === openBucket)
                      ?.invoices.map((inv: any) => (
                        <div
                          key={inv.id}
                          className="border rounded-lg p-3 space-y-1 bg-background"
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm">
                              {inv.contract?.tenant_name || "N/A"}
                            </p>
                            <Badge variant="destructive" className="text-[10px]">
                              {inv.daysOverdue}d
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {inv.property?.name || "-"}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">
                              {formatCurrency(Number(inv.total_amount))}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => navigate(`/faturas/${inv.id}`)}
                            >
                              <Eye className="h-3 w-3 mr-1" /> Ver
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Imóvel</TableHead>
                        <TableHead className="text-center">Dias em atraso</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buckets
                        .find((b) => b.label === openBucket)
                        ?.invoices.map((inv: any) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-medium">
                              {inv.contract?.tenant_name || "N/A"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {inv.property?.name || "-"}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={getSeverityBadge(inv.daysOverdue)}
                                className="text-xs"
                              >
                                {inv.daysOverdue} dias
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(inv.due_date).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(Number(inv.total_amount))}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/faturas/${inv.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
