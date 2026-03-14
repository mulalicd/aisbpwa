export interface Industry {
  id: number;
  chapter_number: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export interface Problem {
  id: string;
  chapter_number: number;
  title: string;
  severity: string;
  confidence: number;
  promptability: number;
  budget: string;
  timeline: string;
  narrative_hook: string;
  sections: Record<string, string>;
  prompt: string | null;
  failure_modes: Array<{
    number: number;
    title: string;
    symptom: string;
    root_cause: string;
    recovery: string;
  }>;
  roi_data: Record<string, unknown>;
  asmp_ids: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const INDUSTRY_SLUGS: Record<number, string> = {
  1: "logistics",
  2: "education",
  3: "hr",
  4: "manufacturing",
  5: "retail",
  6: "healthcare",
  7: "finance",
  8: "marketing",
  9: "it",
  10: "sustainability",
};
