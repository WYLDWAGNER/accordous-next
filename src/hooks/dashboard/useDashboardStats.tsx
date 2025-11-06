import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      // Buscar total de propriedades
      const { count: totalProperties } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Buscar contratos ativos
      const { count: activeContracts } = await supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active");

      // Buscar receita do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyInvoices } = await supabase
        .from("invoices")
        .select("total_amount")
        .eq("user_id", user.id)
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
        .eq("user_id", user.id)
        .eq("status", "pending");

      return {
        totalProperties: totalProperties || 0,
        activeContracts: activeContracts || 0,
        monthlyRevenue,
        pendingInvoices: pendingInvoices || 0,
      };
    },
    enabled: !!user?.id,
  });
};
