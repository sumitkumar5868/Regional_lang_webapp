# Regional Language Multimodal AI Frontend

A modern React + Vite frontend for a regional-language multimodal AI experience. The app captures a live camera frame, sends it to an AI backend, and displays translated text, gesture insights, confidence, and voice-ready output.

## Features

- Live webcam capture with permission handling
- Front/rear camera fallback logic
- Real-time AI toggle
- Regional language selection
- AI result panel with detection and confidence
- Session history using Supabase
- Backend health check and easy endpoint configuration
- FastAPI demo backend included for local testing

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- FastAPI (demo backend)

## Project Structure

```text
project/
├── src/
│   ├── components/
│   ├── lib/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── backend_server.py
├── .env
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── README.md
└── supabase/
```

## Prerequisites

- Node.js 18+
- npm
- Python 3.11+
- A webcam for camera testing

## 1) Install frontend dependencies

```bash
npm install
```

## 2) Run the frontend

```bash
npm run dev -- --host 0.0.0.0
```

Then open:

```text
http://localhost:5173
```

## 3) Run the demo backend

```bash
python backend_server.py
```

The backend is available at:

- http://localhost:8000/health
- http://localhost:8000/predict

## Environment variables

The app uses Vite environment variables from `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_BACKEND_URL=http://localhost:8000/predict
VITE_AI_HEALTH_URL=http://localhost:8000/health
```

## Backend response format

The frontend expects a JSON payload like this:

```json
{
  "text": "नमस्ते",
  "translation": "Hello",
  "emoji": "👋",
  "gesture": "hello",
  "confidence": 0.96,
  "audio": ""
}
```

The app also supports some alternate field names such as:

- `regional_text`
- `english`
- `gesture_name`
- `audio_url`

## Camera behavior

The app asks for camera access from the browser and handles common device issues such as:

- camera permission rejection
- no webcam attached
- unsupported camera constraints
- rear/front camera fallback problems

For local development, the page should be served from `localhost` or over HTTPS.

## Notes

- The included backend is a lightweight demo and can be replaced with your real AI model service.
- Supabase is used for saved session history and can be disabled or replaced if needed.
- The app expects a real webcam device in a real browser environment to function fully.

## Useful commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
tsc --noEmit -p tsconfig.app.json
```

## License

This project is provided for educational and demo purposes.
