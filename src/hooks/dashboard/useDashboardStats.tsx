import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccountId } from "@/hooks/useAccountId";

export const useDashboardStats = () => {
  const { user } = useAuth();
  const { accountId, loading: accountLoading } = useAccountId();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id, accountId],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      // Build query filter based on account_id or user_id
      const filterColumn = accountId ? "account_id" : "user_id";
      const filterValue = accountId || user.id;

      // Buscar total de propriedades
      const { count: totalProperties } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq(filterColumn, filterValue);

      // Buscar contratos ativos
      const { count: activeContracts } = await supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq(filterColumn, filterValue)
        .eq("status", "active");

      // Buscar receita do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyInvoices } = await supabase
        .from("invoices")
        .select("total_amount")
        .eq(filterColumn, filterValue)
        .eq("status", "paid")
        .gte("payment_date", startOfMonth.toISOString());

      const monthlyRevenue = monthlyInvoices?.reduce(
        (sum, inv) => sum + Number(inv.total_amount || 0),
        0
      ) || 0;

      // Buscar faturas pendentes
      const { count: pendingInvoices } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq(filterColumn, filterValue)
        .in("status", ["pending", "overdue"]);

      return {
        totalProperties: totalProperties || 0,
        activeContracts: activeContracts || 0,
        monthlyRevenue,
        pendingInvoices: pendingInvoices || 0,
      };
    },
    enabled: !!user?.id && !accountLoading,
  });
};
