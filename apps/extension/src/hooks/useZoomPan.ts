import { useEffect, useRef } from "react";

interface ZoomConfig {
  scale: number;
  duration: number;
  ease: string;
}

export const useZoomPan = (isRecording: boolean) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const zoomToPoint = (
    x: number,
    y: number,
    config: ZoomConfig = {
      scale: 1.5,
      duration: 500,
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  ) => {
    if (!overlayRef.current) return;

    const overlay = overlayRef.current;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const originX = (x / viewportWidth) * 100;
    const originY = (y / viewportHeight) * 100;

    overlay.style.transformOrigin = `${originX}% ${originY}%`;
    overlay.style.transition = `transform ${config.duration}ms ${config.ease}`;
    overlay.style.transform = `scale(${config.scale})`;
  };

  const resetZoom = () => {
    if (!overlayRef.current) return;

    const overlay = overlayRef.current;
    overlay.style.transition = "transform 300ms ease-out";
    overlay.style.transform = "scale(1)";
  };

  useEffect(() => {
    if (!isRecording) return;

    const handleClick = (e: MouseEvent) => {
      zoomToPoint(e.clientX, e.clientY);

      setTimeout(resetZoom, 1500);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isRecording]);

  return { overlayRef };
};
