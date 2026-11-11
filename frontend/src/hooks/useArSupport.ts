import { useEffect, useState } from "react";

export interface ArSupport {
  camera: boolean;
  webxr: boolean;
  mindar: boolean;
  loading: boolean;
}

export function useArSupport(): ArSupport {
  const [state, setState] = useState<ArSupport>({
    camera: false, webxr: false, mindar: false, loading: true,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const camera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      let webxr = false;
      if ("xr" in navigator) {
        try {
          webxr = await (navigator as any).xr.isSessionSupported("immersive-ar");
        } catch {
          webxr = false;
        }
      }
      // MindAR is loaded from CDN at runtime; assume available if camera exists
      const mindar = camera;
      if (mounted) setState({ camera, webxr, mindar, loading: false });
    })();
    return () => { mounted = false; };
  }, []);

  return state;
}