// ============================================================
// API SERVICE — isolated integration layer
// ------------------------------------------------------------
// The UI never talks to the backend directly. It calls these
// helpers. Adjust mapAIResponse() to match your backend shape.
// ============================================================

import {
  AI_BACKEND_URL,
  HEALTH_ENDPOINT,
  REQUEST_CONFIG,
  DEFAULT_EMPTY_RESULT,
} from "./config";

export interface AIResult {
  text: string;
  translation: string;
  audio: string;
  emoji: string;
  gesture: string;
  confidence: number; // 0..1
}

export type AIStatus =
  | "Ready"
  | "Analyzing"
  | "Understanding gesture"
  | "Generating response"
  | "Complete"
  | "Backend unavailable"
  | "Error";

export class AIError extends Error {
  kind: "network" | "backend" | "invalid";
  constructor(kind: AIError["kind"], message: string) {
    super(message);
    this.kind = kind;
  }
}

// ------------------------------------------------------------
// mapAIResponse — adapt your backend payload to the UI shape.
// Edit this function if your backend field names differ.
// ------------------------------------------------------------
export function mapAIResponse(response: unknown): AIResult {
  const r = (response ?? {}) as Record<string, unknown>;

  const text = String(r.text ?? r.regional_text ?? r.regionalText ?? "");
  const translation = String(r.translation ?? r.english ?? "");
  const audio = String(r.audio ?? r.audio_url ?? r.audioUrl ?? "");
  const emoji = String(r.emoji ?? "");
  const gesture = String(r.gesture ?? r.gesture_name ?? r.gestureName ?? "");
  const rawConf = r.confidence ?? r.confidence_score ?? r.score ?? 0;
  let confidence = typeof rawConf === "number" ? rawConf : Number(rawConf);
  if (!Number.isFinite(confidence)) confidence = 0;
  // Normalize to 0..1 if backend sends 0..100
  if (confidence > 1) confidence = confidence / 100;

  return { text, translation, audio, emoji, gesture, confidence };
}

// ------------------------------------------------------------
// sendFrameToBackend — POSTs a captured frame to the AI backend
// ------------------------------------------------------------
export async function sendFrameToBackend(
  image: string,
  language: string
): Promise<AIResult> {
  if (!AI_BACKEND_URL || AI_BACKEND_URL === "YOUR_AI_BACKEND_URL") {
    // No backend configured yet — surface a clear error instead of mocking.
    throw new AIError("backend", "AI backend URL not configured.");
  }

  const body: Record<string, string> = {};
  body[REQUEST_CONFIG.imageField] = image;
  body[REQUEST_CONFIG.languageField] = language;

  let res: Response;
  try {
    res = await fetch(AI_BACKEND_URL, {
      method: REQUEST_CONFIG.method,
      headers: REQUEST_CONFIG.headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new AIError("network", "Connection lost.");
  }

  if (!res.ok) {
    throw new AIError("backend", "AI backend unavailable.");
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new AIError("invalid", "Unable to process AI response.");
  }

  try {
    return mapAIResponse(data);
  } catch {
    throw new AIError("invalid", "Unable to process AI response.");
  }
}

// ------------------------------------------------------------
// checkBackendHealth — optional connectivity probe
// ------------------------------------------------------------
export async function checkBackendHealth(): Promise<boolean> {
  if (!HEALTH_ENDPOINT) {
    // If no health endpoint is set, we can't confirm — report offline.
    return false;
  }
  try {
    const res = await fetch(HEALTH_ENDPOINT, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export { DEFAULT_EMPTY_RESULT };
