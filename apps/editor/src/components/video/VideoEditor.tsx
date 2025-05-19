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
  hasWebcam?: boolean;
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
  gradient?: string;
  type: "solid" | "gradient";
}

interface ZoomPanSettings {
  autoZoom: boolean;
  scale: number;
  duration: number;
  holdTime: number;
  easing: string;
}

const backgrounds: Background[] = [
  { id: "bg-1", name: "Classic", color: "#f3f4f6", type: "solid" },
  { id: "bg-2", name: "Dark", color: "#1f2937", type: "solid" },
  { id: "bg-3", name: "Midnight", color: "#111827", type: "solid" },
  { id: "bg-4", name: "Ocean", color: "#0c4a6e", type: "solid" },
  { id: "bg-5", name: "Forest", color: "#064e3b", type: "solid" },
  { id: "bg-6", name: "Sunset", color: "#7c2d12", type: "solid" },
  { id: "bg-7", name: "Lavender", color: "#581c87", type: "solid" },
  { id: "bg-8", name: "Rose", color: "#9f1239", type: "solid" },
  {
    id: "bg-9",
    name: "Cosmic",
    color: "#000000",
    gradient: "linear-gradient(135deg, #0c0c2c 0%, #302b63 50%, #24243e 100%)",
    type: "gradient",
  },
  {
    id: "bg-10",
    name: "Sunrise",
    color: "#ffa500",
    gradient: "linear-gradient(to right, #ff8c00, #ff0080)",
    type: "gradient",
  },
  {
    id: "bg-11",
    name: "Aurora",
    color: "#00cc99",
    gradient: "linear-gradient(to right, #00cc99, #6600ff)",
    type: "gradient",
  },
  {
    id: "bg-12",
    name: "Nebula",
    color: "#663399",
    gradient: "linear-gradient(45deg, #663399, #ff3366, #3366ff)",
    type: "gradient",
  },
  {
    id: "bg-13",
    name: "Fire Ice",
    color: "#ff4136",
    gradient: "linear-gradient(to bottom, #ff4136, #0074d9)",
    type: "gradient",
  },
];

const VideoEditor: React.FC<VideoEditorProps> = ({
  src,
  fileName,
  clickEvents = [],
  hasWebcam = false,
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
  const [showWebcam, setShowWebcam] = useState<boolean>(hasWebcam);
  const [webcamPosition, setWebcamPosition] = useState<
    "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
  >("bottomRight");
  const [webcamSize, setWebcamSize] = useState<"small" | "medium" | "large">(
    "small",
  );
  const [showWebcamInRecording, setShowWebcamInRecording] =
    useState<boolean>(true);
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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const webcamContainerRef = useRef<HTMLDivElement>(null);
  const notificationTimeoutRef = useRef<number | null>(null);
  const zoomTimeoutRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

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

  const toggleWebcam = async () => {
    if (showWebcam) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((track) => track.stop());
        webcamStreamRef.current = null;
      }
      setShowWebcam(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          webcamStreamRef.current = stream;
          setShowWebcam(true);
          setNotificationText("Webcam activated");
          setShowNotification(true);

          if (notificationTimeoutRef.current) {
            window.clearTimeout(notificationTimeoutRef.current);
          }

          notificationTimeoutRef.current = window.setTimeout(() => {
            setShowNotification(false);
          }, 2000);
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setNotificationText("Failed to access webcam");
        setShowNotification(true);
      }
    }
  };

  const changeWebcamPosition = (
    position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight",
  ) => {
    setWebcamPosition(position);
  };

  const changeWebcamSize = () => {
    const sizes: ("small" | "medium" | "large")[] = [
      "small",
      "medium",
      "large",
    ];
    const currentIndex = sizes.indexOf(webcamSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setWebcamSize(sizes[nextIndex]);
  };

  const toggleWebcamInRecording = () => {
    setShowWebcamInRecording(!showWebcamInRecording);
  };

  const startRecording = async () => {
    if (!containerRef.current || !videoRef.current) return;

    try {
      if (hasWebcam && !showWebcam) {
        await toggleWebcam();
      }

      recordedChunksRef.current = [];

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: false,
        willReadFrequently: true,
      });
      const videoElement = videoRef.current;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      canvasStreamRef.current = canvas.captureStream(60);

      const mediaRecorder = new MediaRecorder(canvasStreamRef.current, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 8000000,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        setNotificationText("Video saved successfully!");
        setShowNotification(true);

        if (notificationTimeoutRef.current) {
          window.clearTimeout(notificationTimeoutRef.current);
        }

        notificationTimeoutRef.current = window.setTimeout(() => {
          setShowNotification(false);
        }, 2000);
      };

      const drawFrame = () => {
        if (!ctx || !videoElement || !videoContainerRef.current) return;

        if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
          videoElement.requestVideoFrameCallback(drawFrame);
        } else {
          requestAnimationFrame(drawFrame);
        }

        if (!videoElement.paused && !videoElement.ended) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (
            selectedBackground.type === "gradient" &&
            selectedBackground.gradient
          ) {
            const gradient = ctx.createLinearGradient(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const gradientStr = selectedBackground.gradient;
            const matches = gradientStr.match(/rgba?\([\d\s,.]+\)|#[a-f\d]+/gi);

            if (matches && matches.length >= 2) {
              gradient.addColorStop(0, matches[0]);
              gradient.addColorStop(1, matches[1]);
              ctx.fillStyle = gradient;
            } else {
              ctx.fillStyle = selectedBackground.color;
            }
          } else {
            ctx.fillStyle = selectedBackground.color;
          }

          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(currentScale, currentScale);

          if (isZooming) {
            const offsetX =
              ((0.5 - zoomPosition.x) * canvas.width) / currentScale;
            const offsetY =
              ((0.5 - zoomPosition.y) * canvas.height) / currentScale;
            ctx.translate(offsetX, offsetY);
          } else {
            ctx.translate(-position.x, -position.y);
          }

          ctx.translate(
            -canvas.width / 2 / currentScale,
            -canvas.height / 2 / currentScale,
          );
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          if (showWebcam && showWebcamInRecording && webcamRef.current) {
            const webcamEl = webcamRef.current;

            if (webcamEl.videoWidth && webcamEl.videoHeight) {
              ctx.save();
              ctx.resetTransform();

              const sizeMultiplier =
                webcamSize === "small"
                  ? 0.2
                  : webcamSize === "medium"
                    ? 0.3
                    : 0.4;
              const webcamWidth = canvas.width * sizeMultiplier;
              const webcamHeight =
                (webcamWidth / webcamEl.videoWidth) * webcamEl.videoHeight;

              let webcamX = 0;
              let webcamY = 0;
              const padding = 20;

              switch (webcamPosition) {
                case "topLeft":
                  webcamX = padding;
                  webcamY = padding;
                  break;
                case "topRight":
                  webcamX = canvas.width - webcamWidth - padding;
                  webcamY = padding;
                  break;
                case "bottomLeft":
                  webcamX = padding;
                  webcamY = canvas.height - webcamHeight - padding;
                  break;
                case "bottomRight":
                  webcamX = canvas.width - webcamWidth - padding;
                  webcamY = canvas.height - webcamHeight - padding;
                  break;
              }

              ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
              ctx.fillRect(
                webcamX - 5,
                webcamY - 5,
                webcamWidth + 10,
                webcamHeight + 10,
              );
              ctx.drawImage(
                webcamEl,
                webcamX,
                webcamY,
                webcamWidth,
                webcamHeight,
              );
              ctx.restore();
            }
          }

          ctx.restore();
        }
      };

      videoElement.currentTime = 0;

      const startRecordingProcess = () => {
        drawFrame();
        mediaRecorder.start();
        setIsRecording(true);
        setNotificationText("Recording started...");
        setShowNotification(true);
      };

      if (videoElement.readyState >= videoElement.HAVE_ENOUGH_DATA) {
        await videoElement.play();
        startRecordingProcess();
      } else {
        videoElement.oncanplaythrough = async () => {
          await videoElement.play();
          startRecordingProcess();
          videoElement.oncanplaythrough = null;
        };
      }

      videoElement.onended = () => {
        stopRecording();
      };
    } catch (error) {
      console.error("Error starting recording:", error);
      setNotificationText("Failed to start recording");
      setShowNotification(true);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (canvasStreamRef.current) {
      canvasStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const downloadRecordedVideo = () => {
    if (!recordedVideo) return;

    const a = document.createElement("a");
    a.href = recordedVideo;
    a.download = `${fileName.split(".")[0]}_with_effects.webm`;
    a.click();
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

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (canvasStreamRef.current) {
        canvasStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (recordedVideo) {
        URL.revokeObjectURL(recordedVideo);
      }
    };
  }, [recordedVideo]);

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
                style={{
                  backgroundColor: bg.color,
                  background: bg.type === "gradient" ? bg.gradient : bg.color,
                }}
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
          {hasWebcam && (
            <button
              className={`editor-action-button ${showWebcam ? "active" : ""}`}
              onClick={toggleWebcam}
            >
              {showWebcam ? "Disable Webcam" : "Enable Webcam"}
            </button>
          )}
          {showWebcam && (
            <>
              <button
                className="editor-action-button"
                onClick={changeWebcamSize}
                title="Change webcam size"
              >
                Webcam {webcamSize}
              </button>
              <button
                className={`editor-action-button ${showWebcamInRecording ? "active" : ""}`}
                onClick={toggleWebcamInRecording}
                title="Toggle webcam visibility in recording"
              >
                {showWebcamInRecording ? "Hide In Video" : "Show In Video"}
              </button>
            </>
          )}
          <a
            href={src}
            download={fileName}
            className="editor-action-button download-button"
          >
            Download
          </a>
          {!isRecording && !recordedVideo && (
            <button
              className="editor-action-button"
              onClick={startRecording}
              disabled={isRecording}
            >
              Save Pro 💾
            </button>
          )}
          {isRecording && (
            <button
              className="editor-action-button recording"
              onClick={stopRecording}
            >
              Stop Recording
            </button>
          )}
          {recordedVideo && (
            <button
              className="editor-action-button download-button"
              onClick={downloadRecordedVideo}
            >
              Download Pro Video 💾
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="video-canvas"
        style={{
          backgroundColor: selectedBackground.color,
          background:
            selectedBackground.type === "gradient"
              ? selectedBackground.gradient
              : selectedBackground.color,
        }}
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

        {showWebcam && (
          <div
            ref={webcamContainerRef}
            className={`webcam-container ${webcamSize} ${webcamPosition}`}
          >
            <div className="webcam-controls">
              <button
                className="webcam-control-button"
                onClick={() => changeWebcamPosition("topLeft")}
                title="Move to top left"
              >
                ↖
              </button>
              <button
                className="webcam-control-button"
                onClick={() => changeWebcamPosition("topRight")}
                title="Move to top right"
              >
                ↗
              </button>
              <button
                className="webcam-control-button"
                onClick={() => changeWebcamPosition("bottomLeft")}
                title="Move to bottom left"
              >
                ↙
              </button>
              <button
                className="webcam-control-button"
                onClick={() => changeWebcamPosition("bottomRight")}
                title="Move to bottom right"
              >
                ↘
              </button>
              <button
                className="webcam-control-button"
                onClick={changeWebcamSize}
                title="Change size"
              >
                ⚲
              </button>
            </div>
            <video
              ref={webcamRef}
              autoPlay
              playsInline
              muted
              className="webcam-video"
            />
          </div>
        )}
        <div className="background-previews">
          {backgrounds.map((bg) => (
            <div
              key={`preview-${bg.id}`}
              className={`background-preview ${selectedBackground.id === bg.id ? "active" : ""}`}
              style={{
                backgroundColor: bg.color,
                background: bg.type === "gradient" ? bg.gradient : bg.color,
              }}
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
          {hasWebcam && (
            <p className="mt-2">
              <strong>Webcam:</strong> You can toggle the webcam with the button
              above, and use the controls to change its position and size.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
