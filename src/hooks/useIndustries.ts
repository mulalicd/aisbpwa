import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Industry } from "@/lib/types";

export function useIndustries() {
  return useQuery({
    queryKey: ["industries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industries")
        .select("*")
        .order("chapter_number");
      if (error) throw error;
      return data as Industry[];
    },
  });
}
