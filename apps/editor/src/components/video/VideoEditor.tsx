import {
  useState,
  useRef,
  useEffect,
  useCallback,
  MouseEvent,
  WheelEvent,
  TouchEvent,
} from "react";
import "./VideoEditor.css";
import { useStore } from "@/store";

interface VideoEditorProps {
  src: string;
  fileName: string;
  clickEvents?: VideoClickEvent[];
}

interface VideoClickEvent {
  time: number;
  x: number;
  y: number;
}

interface Background {
  id: string;
  name: string;
  color: string;
}

interface ZoomPanSettings {
  autoZoom: boolean;
  scale: number;
  duration: number;
  holdTime: number;
  easing: string;
}

const backgrounds: Background[] = [
  { id: "bg-1", name: "Classic", color: "#f3f4f6" },
  { id: "bg-2", name: "Dark", color: "#1f2937" },
  { id: "bg-3", name: "Midnight", color: "#111827" },
  { id: "bg-4", name: "Ocean", color: "#0c4a6e" },
  { id: "bg-5", name: "Forest", color: "#064e3b" },
  { id: "bg-6", name: "Sunset", color: "#7c2d12" },
  { id: "bg-7", name: "Lavender", color: "#581c87" },
  { id: "bg-8", name: "Rose", color: "#9f1239" },
];

const VideoEditor: React.FC<VideoEditorProps> = ({
  src,
  fileName,
  clickEvents = [],
}) => {
  const clickEventsRef = useRef<VideoClickEvent[]>(clickEvents);
  const [selectedBackground, setSelectedBackground] = useState<Background>(
    backgrounds[0],
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationText, setNotificationText] = useState<string>("");
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [currentScale, setCurrentScale] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [manualZoom, setManualZoom] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const notificationTimeoutRef = useRef<number | null>(null);
  const zoomTimeoutRef = useRef<number | null>(null);

  const zoomSettings = useStore(
    (state) => state.editorSettings.zoomPan,
  ) as ZoomPanSettings;

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`,
          );
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
    }
  };

  const handleBackgroundChange = useCallback((bg: Background) => {
    setSelectedBackground(bg);
    setNotificationText(`Background changed to ${bg.name}`);
    setShowNotification(true);

    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }

    notificationTimeoutRef.current = window.setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  }, []);

  const resetView = () => {
    setCurrentScale(1);
    setPosition({ x: 0, y: 0 });
    setManualZoom(false);

    if (videoContainerRef.current) {
      videoContainerRef.current.style.transition = `transform ${zoomSettings.duration}ms ${zoomSettings.easing}`;

      setTimeout(() => {
        if (videoContainerRef.current) {
          videoContainerRef.current.style.transition = "";
        }
      }, zoomSettings.duration);
    }
  };

  const autoZoomToPoint = useCallback(
    (x: number, y: number) => {
      if (!videoContainerRef.current || !zoomSettings.autoZoom || manualZoom)
        return;

      setIsZooming(true);
      setZoomPosition({ x, y });
      setCurrentScale(zoomSettings.scale);

      if (videoContainerRef.current) {
        videoContainerRef.current.style.transition = `transform ${zoomSettings.duration}ms ${zoomSettings.easing}`;
      }

      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }

      zoomTimeoutRef.current = window.setTimeout(() => {
        if (videoContainerRef.current) {
          videoContainerRef.current.style.transition = `transform ${zoomSettings.duration}ms ${zoomSettings.easing}`;
        }
        setCurrentScale(1);
        setZoomPosition({ x: 0, y: 0 });

        setTimeout(() => {
          if (videoContainerRef.current) {
            videoContainerRef.current.style.transition = "";
          }
          setIsZooming(false);
        }, zoomSettings.duration);
      }, zoomSettings.holdTime);
    },
    [zoomSettings, manualZoom],
  );

  const handleZoomIn = () => {
    const newScale = Math.min(currentScale + 0.1, 5);
    setCurrentScale(newScale);
    setManualZoom(true);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(1, currentScale - 0.1);
    if (newScale === 1) {
      resetView();
    } else {
      setCurrentScale(newScale);
      setManualZoom(true);
    }
  };

  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;

    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (
    touches: React.TouchList,
  ): { x: number; y: number } => {
    if (touches.length < 2) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }

    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleWheel = (e: WheelEvent) => {
    if (isZooming) return;

    e.preventDefault();

    const delta = e.deltaY * -0.005;
    const newScale = Math.min(Math.max(1, currentScale + delta), 5);

    if (videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / currentScale;
      const y = (e.clientY - rect.top) / currentScale;

      const newX = position.x - (x * (newScale - currentScale)) / newScale;
      const newY = position.y - (y * (newScale - currentScale)) / newScale;

      setCurrentScale(newScale);
      setPosition({ x: newX, y: newY });

      if (newScale > 1) {
        setManualZoom(true);
      } else {
        setManualZoom(false);
      }
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (isZooming) return;

    if (currentScale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isZooming) return;

    if (isDragging && currentScale > 1) {
      const dx = (e.clientX - dragStart.x) / currentScale;
      const dy = (e.clientY - dragStart.y) / currentScale;

      setPosition({
        x: position.x - dx,
        y: position.y - dy,
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (isZooming) return;

    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      setTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isZooming) return;

    if (e.touches.length === 1 && isDragging && currentScale > 1) {
      const dx = (e.touches[0].clientX - dragStart.x) / currentScale;
      const dy = (e.touches[0].clientY - dragStart.y) / currentScale;

      setPosition({
        x: position.x - dx,
        y: position.y - dy,
      });

      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && touchDistance !== null) {
      const newDistance = getTouchDistance(e.touches);
      const deltaScale = (newDistance - touchDistance) * 0.01;

      const newScale = Math.min(Math.max(1, currentScale + deltaScale), 5);
      setTouchDistance(newDistance);

      if (videoContainerRef.current) {
        const rect = videoContainerRef.current.getBoundingClientRect();
        const touchCenter = getTouchCenter(e.touches);
        const x = (touchCenter.x - rect.left) / currentScale;
        const y = (touchCenter.y - rect.top) / currentScale;

        const newX = position.x - (x * (newScale - currentScale)) / newScale;
        const newY = position.y - (y * (newScale - currentScale)) / newScale;

        setCurrentScale(newScale);
        setPosition({ x: newX, y: newY });

        if (newScale > 1) {
          setManualZoom(true);
        } else {
          setManualZoom(false);
        }
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      setTouchDistance(null);
    }

    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      if (
        !zoomSettings.autoZoom ||
        isZooming ||
        clickEventsRef.current.length === 0 ||
        manualZoom
      )
        return;

      const currentTime = videoElement.currentTime;
      const tolerance = 0.2;

      const clickEvent = clickEventsRef.current.find(
        (event) => Math.abs(event.time - currentTime) < tolerance,
      );

      if (clickEvent) {
        autoZoomToPoint(clickEvent.x, clickEvent.y);
      }
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [autoZoomToPoint, isZooming, zoomSettings.autoZoom, manualZoom]);

  useEffect(() => {
    const handleTestZoom = () => {
      const x = Math.random();
      const y = Math.random();
      autoZoomToPoint(x, y);
    };

    window.addEventListener("rodoh:test-zoom", handleTestZoom as EventListener);

    return () => {
      window.removeEventListener(
        "rodoh:test-zoom",
        handleTestZoom as EventListener,
      );
    };
  }, [autoZoomToPoint]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
      if (zoomTimeoutRef.current) {
        window.clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="video-editor">
      <div className="video-editor-toolbar">
        <div className="background-selector">
          <div className="background-label">Background:</div>
          <div className="background-options">
            {backgrounds.map((bg) => (
              <div
                key={bg.id}
                className={`background-option ${selectedBackground.id === bg.id ? "selected" : ""}`}
                style={{ backgroundColor: bg.color }}
                onClick={() => handleBackgroundChange(bg)}
                title={bg.name}
              >
                {selectedBackground.id === bg.id && (
                  <div className="selected-indicator" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="zoom-controls">
          <button
            className="editor-action-button zoom-button"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            -
          </button>
          <div className="zoom-level">{Math.round(currentScale * 100)}%</div>
          <button
            className="editor-action-button zoom-button"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button
            className="editor-action-button reset-button"
            onClick={resetView}
            title="Reset View"
          >
            Reset
          </button>
        </div>
        <div className="editor-actions">
          <button className="editor-action-button" onClick={toggleFullscreen}>
            {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </button>
          <a
            href={src}
            download={fileName}
            className="editor-action-button download-button"
          >
            Download
          </a>
        </div>
      </div>

      <div
        ref={containerRef}
        className="video-canvas"
        style={{ backgroundColor: selectedBackground.color }}
      >
        {showNotification && (
          <div className="background-notification">{notificationText}</div>
        )}
        <div
          ref={videoContainerRef}
          className={`video-container ${currentScale > 1 ? "grabbable" : ""} ${isDragging ? "grabbing" : ""}`}
          style={{
            transform: isZooming
              ? `scale(${currentScale}) translate(${((0.5 - zoomPosition.x) * 100) / currentScale}%, ${((0.5 - zoomPosition.y) * 100) / currentScale}%)`
              : `scale(${currentScale}) translate(${-position.x}px, ${-position.y}px)`,
            transformOrigin: "center",
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <video ref={videoRef} src={src} controls className="video-player" />
        </div>
        <div className="background-previews">
          {backgrounds.map((bg) => (
            <div
              key={`preview-${bg.id}`}
              className={`background-preview ${selectedBackground.id === bg.id ? "active" : ""}`}
              style={{ backgroundColor: bg.color }}
              onClick={() => handleBackgroundChange(bg)}
              title={`Switch to ${bg.name} background`}
            />
          ))}
        </div>
      </div>

      <div className="video-editor-info">
        <div className="selected-background">
          <span>Current background: </span>
          <strong>{selectedBackground.name}</strong>
        </div>
        <div className="video-instructions">
          <p>
            Click on any background color to change the canvas background. You
            can also select backgrounds from the sidebar.
          </p>
          {clickEventsRef.current.length > 0 && (
            <p className="mt-2">
              Video contains {clickEventsRef.current.length} click events that
              can be used for auto-zoom interactions.
            </p>
          )}
          {zoomSettings.autoZoom && (
            <p className="mt-2">
              Auto-zoom is enabled ({zoomSettings.scale.toFixed(1)}x) with{" "}
              {zoomSettings.duration}ms animation duration.
            </p>
          )}
          <p className="mt-2">
            <strong>Tip:</strong> Use mouse wheel to zoom in/out, click and drag
            to pan when zoomed in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
