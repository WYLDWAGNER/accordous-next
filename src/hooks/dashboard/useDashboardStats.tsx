import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = (userId: string | undefined, accountId: string | null) => {
  return useQuery({
    queryKey: ["dashboard-stats", userId, accountId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const filterColumn = accountId ? "account_id" : "user_id";
      const filterValue = accountId || userId;

      const { count: totalProperties } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq(filterColumn, filterValue);

      const { count: activeContracts } = await supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq(filterColumn, filterValue)
        .eq("status", "active");

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
    enabled: !!userId,
  });
};
