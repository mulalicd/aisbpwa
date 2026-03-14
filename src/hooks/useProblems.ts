import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Problem } from "@/lib/types";

export function useProblems(chapterNumber?: number) {
  return useQuery({
    queryKey: ["problems", chapterNumber],
    queryFn: async () => {
      let query = supabase.from("problems").select("*");
      if (chapterNumber) {
        query = query.eq("chapter_number", chapterNumber);
      }
      const { data, error } = await query.order("id");
      if (error) throw error;
      return data as unknown as Problem[];
    },
  });
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Problem | null;
    },
    enabled: !!id,
  });
}
