import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccountId } from "@/hooks/useAccountId";

export const useRecentInvoices = (limit = 5) => {
  const { user } = useAuth();
  const { accountId, loading: accountLoading } = useAccountId();

  return useQuery({
    queryKey: ["recent-invoices", user?.id, accountId, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const filterColumn = accountId ? "account_id" : "user_id";
      const filterValue = accountId || user.id;

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          property:properties(name),
          contract:contracts(tenant_name)
        `)
        .eq(filterColumn, filterValue)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    },
    enabled: !!user?.id && !accountLoading,
  });
};
