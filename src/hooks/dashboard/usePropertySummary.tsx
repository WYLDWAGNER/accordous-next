import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const usePropertySummary = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["property-summary", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data: properties, error } = await supabase
        .from("properties")
        .select("status")
        .eq("user_id", user.id);

      if (error) throw error;

      // Contar por status
      const statusCount = properties?.reduce(
        (acc, prop) => {
          const status = prop.status || "available";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ) || {};

      const total = properties?.length || 0;

      return {
        total,
        available: statusCount.available || 0,
        rented: statusCount.rented || 0,
        maintenance: statusCount.maintenance || 0,
        reserved: statusCount.reserved || 0,
      };
    },
    enabled: !!user?.id,
  });
};
