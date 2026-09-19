// ============================================================
// useCamera — camera lifecycle hook
// ------------------------------------------------------------
// Wraps navigator.mediaDevices.getUserMedia safely so camera
// APIs are only touched after mount, inside effects.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";

export interface CameraState {
  active: boolean;
  starting: boolean;
  error: string | null;
  facingMode: "user" | "environment";
  supported: boolean;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({
    active: false,
    starting: false,
    error: null,
    facingMode: "user",
    supported: typeof navigator !== "undefined" && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia,
  });

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setState((s) => ({ ...s, active: false, starting: false }));
  }, []);

  const start = useCallback(
    async (facing: "user" | "environment" = state.facingMode) => {
      setState((s) => ({ ...s, starting: true, error: null }));
      // Release any prior stream before requesting a new one.
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const hasSecureContext = typeof window !== "undefined" && window.isSecureContext;
      const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setState({ active: false, starting: false, error: "Camera not supported in this browser. HTTPS is required for camera access.", facingMode: facing, supported: false });
        return;
      }
      if (!hasSecureContext && !isLocalhost) {
        setState({ active: false, starting: false, error: "Camera access requires HTTPS or localhost. Open this page from localhost or enable secure context.", facingMode: facing, supported: false });
        return;
      }

      try {
        const requestCamera = async (requestFacing: "user" | "environment" | null) => {
          const constraints: MediaStreamConstraints = {
            audio: false,
            video: requestFacing
              ? {
                  facingMode: requestFacing,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }
              : true,
          };
          return navigator.mediaDevices.getUserMedia(constraints);
        };

        let stream: MediaStream;
        try {
          stream = await requestCamera(facing);
        } catch (firstError) {
          // Some devices fail when a specific facing-mode is requested; retry with default camera.
          stream = await requestCamera(null).catch(() => {
            throw firstError;
          });
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await new Promise<void>((resolve) => {
            if (video.readyState >= 1) return resolve();
            video.addEventListener("loadedmetadata", () => resolve(), { once: true });
          });
          await video.play().catch(() => undefined);
        }
        setState({ active: true, starting: false, error: null, facingMode: facing, supported: true });
      } catch (err) {
        const e = err as DOMException;
        let msg = "Camera access is required.";
        if (e?.name === "NotAllowedError") msg = "Camera permission denied. Please allow camera access in your browser settings.";
        else if (e?.name === "NotFoundError") msg = "No camera device found. Connect a webcam or check your browser permissions.";
        else if (e?.name === "NotReadableError") msg = "Camera is in use by another application.";
        else if (e?.name === "OverconstrainedError") msg = "Your camera does not support the selected mode. Trying the default camera instead.";
        setState({ active: false, starting: false, error: msg, facingMode: facing, supported: true });
      }
    },
    [state.facingMode]
  );

  const switchCamera = useCallback(() => {
    const next = state.facingMode === "user" ? "environment" : "user";
    if (state.active) start(next);
    else setState((s) => ({ ...s, facingMode: next }));
  }, [state.facingMode, state.active, start]);

  // Cleanup on unmount — never leave streams open.
  useEffect(() => () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Return base64 JPEG — adjust if your backend needs raw bytes / png.
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  return { videoRef, state, start, stop, switchCamera, captureFrame };
}
