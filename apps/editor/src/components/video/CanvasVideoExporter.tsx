import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Settings } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import "./CanvasVideoExporter.css";
import useEditorStore from "@/store/editor.store";

interface CanvasVideoExporterProps {
  videoSrc: string;
  fileName: string;
  clickEvents?: { time: number; x: number; y: number }[];
}

const CanvasVideoExporter: React.FC<CanvasVideoExporterProps> = ({
  videoSrc,
  fileName,
  clickEvents = [],
}) => {
  const {
    aspectRatio,
    selectedBackground,
    editorBg,
    exportFormat,
    exportQuality,
    isExporting,
    setIsExporting,
    exportProgress,
    setExportProgress,
    exportedVideoURL,
    setExportedVideoURL,
    conversionProgress,
    setConversionProgress,
    startExport: storeStartExport,
    stopExport: storeStopExport,
    downloadExportedVideo: storeDownloadVideo,
  } = useEditorStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.paused || video.ended) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: false,
      willReadFrequently: true,
    });

    if (!ctx) return;

    let canvasWidth = video.videoWidth;
    let canvasHeight = video.videoHeight;

    if (aspectRatio !== "original") {
      const [widthRatio, heightRatio] = aspectRatio.split(":").map(Number);
      const targetRatio = widthRatio / heightRatio;
      const videoRatio = video.videoWidth / video.videoHeight;

      if (Math.abs(targetRatio - videoRatio) > 0.01) {
        if (targetRatio > videoRatio) {
          canvasWidth = Math.round(canvasHeight * targetRatio);
        } else {
          canvasHeight = Math.round(canvasWidth / targetRatio);
        }
      }
    }

    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log(canvas.width, canvas.height);

    if (
      selectedBackground &&
      selectedBackground.type === "gradient" &&
      selectedBackground.gradient
    ) {
      if (selectedBackground.gradient.includes("from-")) {
        let startColor = "#3b82f6";
        let endColor = "#2563eb";

        if (selectedBackground.gradient.includes("from-rose-500")) {
          startColor = "#f43f5e";
          endColor = selectedBackground.gradient.includes("to-orange-500")
            ? "#f97316"
            : "#f43f5e";
        } else if (selectedBackground.gradient.includes("from-blue-500")) {
          startColor = "#3b82f6";
          endColor = selectedBackground.gradient.includes("to-cyan-500")
            ? "#06b6d4"
            : "#3b82f6";
        } else if (selectedBackground.gradient.includes("from-violet-500")) {
          startColor = "#8b5cf6";
          endColor = selectedBackground.gradient.includes("to-purple-500")
            ? "#a855f7"
            : "#8b5cf6";
        } else if (selectedBackground.gradient.includes("from-emerald-500")) {
          startColor = "#10b981";
          endColor = selectedBackground.gradient.includes("to-teal-500")
            ? "#14b8a6"
            : "#10b981";
        } else if (selectedBackground.gradient.includes("from-pink-500")) {
          startColor = "#ec4899";
          endColor = selectedBackground.gradient.includes("to-rose-500")
            ? "#f43f5e"
            : "#ec4899";
        } else if (selectedBackground.gradient.includes("from-amber-500")) {
          startColor = "#f59e0b";
          endColor = selectedBackground.gradient.includes("to-yellow-500")
            ? "#eab308"
            : "#f59e0b";
        }

        const gradient = ctx.createLinearGradient(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);
        ctx.fillStyle = gradient;
      } else if (selectedBackground.gradient.includes("linear-gradient")) {
        const gradientStr = selectedBackground.gradient;
        const directionMatch = gradientStr.match(/to (right|left|bottom|top)/);
        const colorMatches = gradientStr.match(/#[a-f\d]+/gi);

        if (colorMatches && colorMatches.length >= 2) {
          let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

          if (directionMatch) {
            if (directionMatch[0].includes("to right")) {
              gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            } else if (directionMatch[0].includes("to left")) {
              gradient = ctx.createLinearGradient(canvas.width, 0, 0, 0);
            } else if (directionMatch[0].includes("to bottom")) {
              gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            } else if (directionMatch[0].includes("to top")) {
              gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            }
          }

          gradient.addColorStop(0, colorMatches[0]);
          gradient.addColorStop(1, colorMatches[1]);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = selectedBackground.color;
        }
      } else {
        ctx.fillStyle = selectedBackground.color;
      }
    } else if (selectedBackground && selectedBackground.type === "solid") {
      if (selectedBackground.color.startsWith("bg-")) {
        if (selectedBackground.color === "bg-white") {
          ctx.fillStyle = "#ffffff";
        } else if (selectedBackground.color === "bg-slate-900") {
          ctx.fillStyle = "#0f172a";
        } else if (selectedBackground.color === "bg-zinc-800") {
          ctx.fillStyle = "#27272a";
        } else if (selectedBackground.color === "bg-blue-600") {
          ctx.fillStyle = "#2563eb";
        } else if (selectedBackground.color === "bg-green-600") {
          ctx.fillStyle = "#16a34a";
        } else if (selectedBackground.color === "bg-red-600") {
          ctx.fillStyle = "#dc2626";
        } else {
          ctx.fillStyle = "#000000";
        }
      } else {
        ctx.fillStyle = selectedBackground.color;
      }
    } else {
      ctx.fillStyle = "#f8f9fa";
    }

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaleFactor = 0.9;
    const scaledWidth = canvas.width * scaleFactor;
    const scaledHeight = canvas.height * scaleFactor;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = 10;

    ctx.drawImage(
      video,
      0,
      0,
      video.videoWidth,
      video.videoHeight,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight,
    );

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    if (clickEvents.length > 0) {
      const currentClickEvents = clickEvents.filter(
        (event) => Math.abs(event.time - video.currentTime) < 0.1,
      );

      if (currentClickEvents.length > 0) {
        const recentClick = currentClickEvents[currentClickEvents.length - 1];

        const cursorSize = 30;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(
          offsetX + recentClick.x * scaledWidth,
          offsetY + recentClick.y * scaledHeight,
          cursorSize / 2,
          0,
          2 * Math.PI,
        );
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(
            offsetX + recentClick.x * scaledWidth,
            offsetY + recentClick.y * scaledHeight,
            cursorSize / 2 + i * 5,
            0,
            2 * Math.PI,
          );
          ctx.globalAlpha = 0.3 / i;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }

    animationFrameRef.current = requestAnimationFrame(drawFrame);
  }, [selectedBackground, editorBg, clickEvents, aspectRatio]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, drawFrame]);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        setFfmpegLoading(true);
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on("log", ({ message }) => {
          console.log(message);
        });

        ffmpeg.on("progress", ({ progress }) => {
          setConversionProgress(Math.round(progress * 100));
        });

        const baseURL = "https";
        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript",
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm",
          ),
        });

        setFfmpegLoaded(true);
        setFfmpegLoading(false);
      } catch (error) {
        console.error("Failed to load FFmpeg:", error);
        setFfmpegLoading(false);
      }
    };

    loadFFmpeg();

    return () => {
      if (ffmpegRef.current) {
        ffmpegRef.current.terminate();
      }
    };
  }, []);

  const startExport = async () => {
    if (!videoRef.current || !canvasRef.current || isExporting) return;

    try {
      storeStartExport();
      setIsExporting(true);
      setExportProgress(0);
      recordedChunksRef.current = [];

      videoRef.current.currentTime = 0;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      canvasStreamRef.current = canvasRef.current.captureStream(60);

      try {
        if (
          videoRef.current &&
          typeof videoRef.current.captureStream === "function"
        ) {
          const videoStream = videoRef.current.captureStream();
          const audioTracks = videoStream.getAudioTracks();

          if (audioTracks.length > 0) {
            audioTracks.forEach((track: MediaStreamTrack) => {
              canvasStreamRef.current?.addTrack(track);
            });
          }
        }
      } catch (err) {
        console.warn("Could not capture audio stream from video:", err);
      }

      const options: MediaRecorderOptions = {
        videoBitsPerSecond:
          exportQuality === "high"
            ? 8000000
            : exportQuality === "medium"
              ? 4000000
              : 2000000,
      };

      if (exportFormat === "webm") {
        options.mimeType = "video/webm;codecs=vp9";
      } else {
        options.mimeType = "video/webm";
      }

      const mediaRecorder = new MediaRecorder(canvasStreamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        let finalBlob;

        if (exportFormat === "webm") {
          finalBlob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });
        } else if (exportFormat === "mp4") {
          const webmBlob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });

          if (ffmpegLoaded && ffmpegRef.current) {
            try {
              const inputFileName = "input.webm";
              const outputFileName = "output.mp4";

              setConversionProgress(0);

              await ffmpegRef.current.writeFile(
                inputFileName,
                await fetchFile(webmBlob),
              );

              const bitrateFlag =
                exportQuality === "high"
                  ? "8M"
                  : exportQuality === "medium"
                    ? "4M"
                    : "2M";

              await ffmpegRef.current.exec([
                "-i",
                inputFileName,
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-crf",
                "22",
                "-b:v",
                bitrateFlag,
                "-c:a",
                "aac",
                "-strict",
                "experimental",
                outputFileName,
              ]);

              const outputData =
                await ffmpegRef.current.readFile(outputFileName);

              finalBlob = new Blob([outputData.buffer], { type: "video/mp4" });

              await ffmpegRef.current.deleteFile(inputFileName);
              await ffmpegRef.current.deleteFile(outputFileName);
            } catch (error) {
              console.error("Error converting to MP4:", error);

              finalBlob = webmBlob;
              alert("Failed to convert to MP4. Falling back to WebM format.");
            }
          } else {
            finalBlob = webmBlob;
            alert("FFmpeg not loaded. Falling back to WebM format.");
          }
        }

        const url = URL.createObjectURL(finalBlob);
        setExportedVideoURL(url);
        setIsExporting(false);
        setExportProgress(100);

        if (canvasStreamRef.current) {
          canvasStreamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      const startRecordingProcess = () => {
        const recordingDrawFrame = () => {
          drawFrame();
          if (
            videoRef.current &&
            !videoRef.current.paused &&
            !videoRef.current.ended
          ) {
            requestAnimationFrame(recordingDrawFrame);

            if (videoRef.current.duration) {
              const progress =
                (videoRef.current.currentTime / videoRef.current.duration) *
                100;
              setExportProgress(Math.round(progress));
            }
          }
        };

        recordingDrawFrame();
        mediaRecorder.start(1000);
      };

      await videoRef.current.play();
      startRecordingProcess();

      videoRef.current.onended = () => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
        if (videoRef.current) {
          videoRef.current.onended = null;
        }
      };
    } catch (error) {
      console.error("Error starting export:", error);
      setIsExporting(false);
    }
  };

  const stopExport = () => {
    storeStopExport();

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const downloadExportedVideo = () => {
    storeDownloadVideo();

    if (!exportedVideoURL) return;

    const a = document.createElement("a");
    a.href = exportedVideoURL;

    const extension = exportFormat === "mp4" ? "mp4" : "webm";
    a.download = `${fileName.split(".")[0]}_exported.${extension}`;
    a.click();
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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

      if (exportedVideoURL) {
        URL.revokeObjectURL(exportedVideoURL);
      }
    };
  }, [exportedVideoURL]);

  return (
    <div className="simple-video-editor">
      <video
        ref={videoRef}
        src={videoSrc}
        className="hidden-video "
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
      />

      {/* Canvas container */}
      <div className="canvas-container" data-aspect-ratio={aspectRatio}>
        {/*{ffmpegLoading && (*/}
        {/*  <div className="loading-indicator">*/}
        {/*    <Loader size={16} className="spinner" />*/}
        {/*    Loading converter...*/}
        {/*  </div>*/}
        {/*)}*/}
        <canvas ref={canvasRef} className="video-canvas" />

        {isExporting && (
          <div className="export-overlay">
            <div className="export-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${exportFormat === "mp4" && conversionProgress > 0 ? conversionProgress : exportProgress}%`,
                  }}
                />
              </div>
              <div className="progress-text">
                {exportFormat === "mp4" && conversionProgress > 0
                  ? `Converting to MP4: ${conversionProgress}%`
                  : `Exporting: ${exportProgress}%`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main controls */}
      <div className="control-bar">
        <div className="playback-controls">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            disabled={isExporting}
            className="control-button"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>

          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div className="flex-spacer"></div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            disabled={isExporting}
            className="control-button"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>

          <div className="volume-slider">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              disabled={isExporting}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className="settings-button"
            title="Video settings"
          >
            <Settings size={20} />
          </Button>
        </div>

        {/* Seek bar */}
        <input
          type="range"
          className="seek-slider"
          min="0"
          max={duration}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          disabled={isExporting}
        />
      </div>
    </div>
  );
};

export default CanvasVideoExporter;
