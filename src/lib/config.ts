// ============================================================
// AI CAMERA — CONFIGURATION
// ------------------------------------------------------------
// Defaults point to a typical local AI backend used by FastAPI/
// Python apps. Override them in .env with VITE_AI_BACKEND_URL and
// VITE_AI_HEALTH_URL when your backend is hosted elsewhere.
// ============================================================

export const AI_BACKEND_URL =
  import.meta.env.VITE_AI_BACKEND_URL || "http://localhost:8000/predict";

// Optional health-check endpoint. Set to "" to disable.
export const HEALTH_ENDPOINT =
  import.meta.env.VITE_AI_HEALTH_URL || "http://localhost:8000/health";

// Real-time AI interval (ms) between captures.
export const FRAME_INTERVAL = 2000;

// ============================================================
// REQUEST SHAPE — adjust to match your backend API contract
// ============================================================
export const REQUEST_CONFIG = {
  method: "POST" as const,
  headers: {
    "Content-Type": "application/json",
    // Add any public headers your backend expects here.
    // NEVER put secret API keys here — use a secure proxy.
  },
  // Field names the frontend will send in the JSON body.
  imageField: "image", // field that carries the base64/frame data
  languageField: "language", // field that carries the selected language code
};

// ============================================================
// SUPPORTED LANGUAGES — configurable list
// ============================================================
export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "or", label: "Odia", nativeLabel: "ଓଡ଼ିଆ" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
  { code: "en", label: "English", nativeLabel: "English" },
];

// ============================================================
// DEFAULT FALLBACKS while no backend is connected
// ============================================================
export const DEFAULT_EMPTY_RESULT = {
  text: "",
  translation: "",
  audio: "",
  emoji: "",
  gesture: "",
  confidence: 0,
};
