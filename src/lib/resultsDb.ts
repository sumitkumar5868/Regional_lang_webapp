// ============================================================
// results_db — persistence for AI analysis results
// ------------------------------------------------------------
// Single-tenant (no auth): the anon-key client reads and writes
// its own data. All operations go through the Supabase client.
// ============================================================

import { supabase } from "./supabase";
import type { AIResult } from "./api";

export interface StoredResult {
  id: string;
  emoji: string;
  gesture: string;
  regional_text: string;
  translation: string;
  confidence: number;
  audio_url: string | null;
  language: string;
  created_at: string;
}

// ---- Insert a new AI result ----------------------------------
export async function saveResult(
  result: AIResult,
  language: string,
  imageData?: string
): Promise<StoredResult | null> {
  const { data, error } = await supabase
    .from("ai_results")
    .insert({
      emoji: result.emoji,
      gesture: result.gesture,
      regional_text: result.text,
      translation: result.translation,
      confidence: result.confidence,
      audio_url: result.audio || null,
      language,
      image_data: imageData ?? null,
    })
    .select()
    .single();

  if (error) {
    console.warn("Failed to save AI result:", error.message);
    return null;
  }
  return data as StoredResult;
}

// ---- Fetch recent results (newest first) --------------------
export async function fetchRecentResults(limit = 12): Promise<StoredResult[]> {
  const { data, error } = await supabase
    .from("ai_results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Failed to fetch AI results:", error.message);
    return [];
  }
  return (data ?? []) as StoredResult[];
}

// ---- Delete a single result ---------------------------------
export async function deleteResult(id: string): Promise<boolean> {
  const { error } = await supabase.from("ai_results").delete().eq("id", id);
  if (error) {
    console.warn("Failed to delete AI result:", error.message);
    return false;
  }
  return true;
}

// ---- Clear all results --------------------------------------
export async function clearAllResults(): Promise<boolean> {
  const { error } = await supabase.from("ai_results").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.warn("Failed to clear AI results:", error.message);
    return false;
  }
  return true;
}
