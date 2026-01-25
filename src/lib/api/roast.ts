import { supabase } from "@/integrations/supabase/client";

export interface RoastItem {
  category: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "good";
}

export interface RoastResult {
  success: boolean;
  score?: number;
  roasts?: RoastItem[];
  metadata?: {
    title?: string;
    url?: string;
  };
  error?: string;
}

export async function roastPage(url: string): Promise<RoastResult> {
  const { data, error } = await supabase.functions.invoke('roast-page', {
    body: { url },
  });

  if (error) {
    console.error('Error calling roast-page function:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to analyze page' 
    };
  }

  return data;
}
