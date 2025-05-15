import {
  useRef,
  useState,
  useEffect,
  MouseEvent,
  WheelEvent,
  TouchEvent,
} from "react";
import "./ZoomableVideo.css";

interface ZoomableVideoProps {
  src: string;
  fileName: string;
}

const ZOOM_STEP = 0.1;

const ZoomableVideo: React.FC<ZoomableVideoProps> = ({ src, fileName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + ZOOM_STEP, 5);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.5, scale - ZOOM_STEP);
    setScale(newScale);
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
    e.preventDefault();

    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);

    if (containerRef.current && videoRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      const newX = position.x - (x * (newScale - scale)) / newScale;
      const newY = position.y - (y * (newScale - scale)) / newScale;

      setScale(newScale);
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && scale > 1) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;

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
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      setTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging && scale > 1) {
      const dx = (e.touches[0].clientX - dragStart.x) / scale;
      const dy = (e.touches[0].clientY - dragStart.y) / scale;

      setPosition({
        x: position.x - dx,
        y: position.y - dy,
      });

      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && touchDistance !== null) {
      const newDistance = getTouchDistance(e.touches);
      const deltaScale = (newDistance - touchDistance) * 0.01;

      const newScale = Math.min(Math.max(0.5, scale + deltaScale), 5);
      setTouchDistance(newDistance);

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const touchCenter = getTouchCenter(e.touches);
        const x = (touchCenter.x - rect.left) / scale;
        const y = (touchCenter.y - rect.top) / scale;

        const newX = position.x - (x * (newScale - scale)) / newScale;
        const newY = position.y - (y * (newScale - scale)) / newScale;

        setScale(newScale);
        setPosition({ x: newX, y: newY });
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
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  const handleDoubleClick = () => {
    setShowControls(!showControls);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="video-controls">
        <button onClick={resetView} className="control-button">
          Reset View
        </button>
        <div className="zoom-controls">
          <button
            onClick={handleZoomOut}
            className="zoom-button"
            title="Zoom Out"
          >
            -
          </button>
          <div className="zoom-level">{Math.round(scale * 100)}%</div>
          <button
            onClick={handleZoomIn}
            className="zoom-button"
            title="Zoom In"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`zoomable-video-container ${scale > 1 ? "grabbable" : ""} ${isDragging ? "grabbing" : ""}`}
        style={{
          width: "100%",
          maxWidth: "800px",
          height: "450px",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video
          ref={videoRef}
          src={src}
          controls={showControls}
          className="zoomable-video"
          style={{
            transform: `scale(${scale}) translate(${-position.x}px, ${-position.y}px)`,
            transformOrigin: "center",
          }}
        />
        <div className="hint-text">
          {showControls
            ? "Double-click to hide controls"
            : "Double-click to show controls"}
        </div>
      </div>

      <a href={src} download={fileName} className="download-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="download-icon"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        Download Recording
      </a>

      <div className="instructions">
        <p>
          <strong>Instructions:</strong>
        </p>
        <ul>
          <li>Use mouse wheel or +/- buttons to zoom in/out</li>
          <li>Click and drag (or touch and drag) to pan when zoomed in</li>
          <li>Pinch to zoom on touch devices</li>
          <li>Double-click (or double-tap) to toggle video controls</li>
        </ul>
      </div>
    </div>
  );
};

export default ZoomableVideo;
