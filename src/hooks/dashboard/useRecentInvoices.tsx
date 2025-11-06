import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useRecentInvoices = (limit = 5) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-invoices", user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          property:properties(name),
          contract:contracts(tenant_name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    },
    enabled: !!user?.id,
  });
};
