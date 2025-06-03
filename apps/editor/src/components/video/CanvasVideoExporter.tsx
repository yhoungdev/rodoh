import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import "./CanvasVideoExporter.css";
import useEditorStore from "@/store/editor.store";
import { applyCanvasBackground } from "@/utils/draw-canvas-color.ts";
import VideoWaveform from "../modules/VideoWaveform";
import VideoController from "@/components/modules/video-controller.tsx";

interface CanvasVideoExporterProps {
  videoSrc: string;
  fileName: string;
  clickEvents?: { time: number; x: number; y: number }[];
}

interface HTMLVideoElementWithCapture extends HTMLVideoElement {
  captureStream(): MediaStream;
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

  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const videoRef = useRef<HTMLVideoElementWithCapture>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const exportAnimationRef = useRef<number | null>(null);

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

  const drawCanvasFrame = useCallback(
    (video: HTMLVideoElement, canvas: HTMLCanvasElement, forExport = false) => {
      const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: false,
        willReadFrequently: true,
      });

      if (!ctx || !video || video.readyState < 2) return;

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

      applyCanvasBackground(ctx, canvas, selectedBackground);

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
    },
    [selectedBackground, editorBg, clickEvents, aspectRatio],
  );

  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.paused || video.ended) return;

    drawCanvasFrame(video, canvas, false);
    animationFrameRef.current = requestAnimationFrame(drawFrame);
  }, [drawCanvasFrame]);

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

        const baseURL = "https:";
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
  }, [setConversionProgress]);

  const getVideoQualitySettings = (quality: "high" | "medium" | "low") => {
    switch (quality) {
      case "high":
        return {
          videoBitsPerSecond: 8000000,
          mimeType: "video/webm;codecs=vp9",
        };
      case "medium":
        return {
          videoBitsPerSecond: 4000000,
          mimeType: "video/webm;codecs=vp9",
        };
      case "low":
        return {
          videoBitsPerSecond: 2000000,
          mimeType: "video/webm;codecs=vp9",
        };
      default:
        return {
          videoBitsPerSecond: 4000000,
          mimeType: "video/webm;codecs=vp9",
        };
    }
  };

  const startExport = async () => {
    if (!videoRef.current || !canvasRef.current || isExporting) return;

    try {
      storeStartExport?.();

      setIsExporting(true);
      setExportProgress(0);
      recordedChunksRef.current = [];

      const video = videoRef.current;
      const canvas = canvasRef.current;

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

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      await new Promise<void>((resolve) => {
        const checkReady = () => {
          if (video.readyState >= 3) {
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });

      drawCanvasFrame(video, canvas, true);

      const stream = canvas.captureStream(30);
      canvasStreamRef.current = stream;

      if (video && typeof video.captureStream === "function") {
        try {
          const videoStream = video.captureStream();
          const audioTracks = videoStream.getAudioTracks();
          if (audioTracks.length > 0) {
            audioTracks.forEach((track) => {
              stream.addTrack(track);
            });
            console.log("Added audio tracks:", audioTracks.length);
          } else {
            console.warn("No audio tracks found in video");
          }
        } catch (audioError) {
          console.warn("Could not capture audio:", audioError);
        }
      }

      const qualitySettings = getVideoQualitySettings(exportQuality);
      console.log("Using quality settings:", qualitySettings);

      try {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          ...qualitySettings,
          audioBitsPerSecond: 128000,
        });
      } catch (mrError) {
        console.error(
          "MediaRecorder creation failed with vp9, falling back to basic webm",
          mrError,
        );
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`Received chunk of size: ${event.data.size} bytes`);
          recordedChunksRef.current.push(event.data);
        } else {
          console.warn("Received empty data chunk");
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          if (recordedChunksRef.current.length === 0) {
            console.error("No chunks recorded");
            setIsExporting(false);
            setExportProgress(0);
            return;
          }

          console.log(`Total chunks: ${recordedChunksRef.current.length}`);

          const mimeType =
            exportFormat === "mp4" ? "video/webm" : `video/${exportFormat}`;
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });

          console.log(
            `Created blob of type ${mimeType}, size: ${blob.size} bytes`,
          );
          setRecordedBlob(blob);

          if (blob.size < 1000) {
            console.error("Blob is too small, recording likely failed");
            setIsExporting(false);
            setExportProgress(0);
            return;
          }

          if (exportFormat === "mp4" && ffmpegRef.current && ffmpegLoaded) {
            setConversionProgress(0);
            const webmUrl = URL.createObjectURL(blob);

            const inputFileName = "input.webm";
            const outputFileName = "output.mp4";

            await ffmpegRef.current.writeFile(
              inputFileName,
              await fetchFile(webmUrl),
            );

            await ffmpegRef.current.exec([
              "-i",
              inputFileName,
              "-c:v",
              "libx264",
              "-preset",
              "medium",
              "-crf",
              exportQuality === "high"
                ? "18"
                : exportQuality === "medium"
                  ? "23"
                  : "28",
              "-c:a",
              "aac",
              "-b:a",
              "128k",
              outputFileName,
            ]);

            const data = await ffmpegRef.current.readFile(outputFileName);
            const uint8Array = new Uint8Array(data as ArrayBuffer);
            const mp4Blob = new Blob([uint8Array], { type: "video/mp4" });

            console.log(`MP4 conversion complete, size: ${mp4Blob.size} bytes`);

            if (mp4Blob.size < 1000) {
              console.error("MP4 blob is too small, conversion likely failed");
              setIsExporting(false);
              setExportProgress(0);
              return;
            }

            const mp4Url = URL.createObjectURL(mp4Blob);

            await ffmpegRef.current.deleteFile(inputFileName);
            await ffmpegRef.current.deleteFile(outputFileName);
            URL.revokeObjectURL(webmUrl);

            setExportedVideoURL(mp4Url);
            setRecordedBlob(mp4Blob);
          } else {
            const url = URL.createObjectURL(blob);
            setExportedVideoURL(url);
          }

          setIsExporting(false);
          setExportProgress(100);
        } catch (error) {
          console.error("Error processing video:", error);
          setIsExporting(false);
          setExportProgress(0);
        }
      };

      mediaRecorderRef.current.onerror = (error) => {
        console.error("MediaRecorder error:", error);
        setIsExporting(false);
        setExportProgress(0);
      };

      video.currentTime = 0;
      video.muted = true;

      console.log("Starting MediaRecorder...");
      mediaRecorderRef.current.start(1000);

      await video.play();
      console.log("Video playback started");

      const recordingProcess = () => {
        if (!video || !canvasRef.current || !mediaRecorderRef.current) {
          return;
        }

        if (video.ended || mediaRecorderRef.current.state === "inactive") {
          console.log("Video ended or recorder inactive");
          return;
        }

        drawCanvasFrame(video, canvasRef.current, true);

        const progress = Math.round((video.currentTime / video.duration) * 100);
        setExportProgress(progress);

        if (progress % 10 === 0) {
          console.log(
            `Export progress: ${progress}%, time: ${video.currentTime}/${video.duration}`,
          );
        }

        if (!video.paused && !video.ended) {
          exportAnimationRef.current = requestAnimationFrame(recordingProcess);
        } else {
          console.log("Video paused or ended, stopping recording");

          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
          ) {
            try {
              mediaRecorderRef.current.stop();
            } catch (e) {
              console.error("Error stopping MediaRecorder:", e);
            }
          }
        }
      };

      exportAnimationRef.current = requestAnimationFrame(recordingProcess);

      video.onended = () => {
        console.log("Video ended event triggered");
        if (exportAnimationRef.current) {
          cancelAnimationFrame(exportAnimationRef.current);
          exportAnimationRef.current = null;
        }

        setTimeout(() => {
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
          ) {
            console.log("Stopping MediaRecorder after video ended");
            mediaRecorderRef.current.stop();
          }
          video.muted = isMuted;
        }, 500);
      };
    } catch (error) {
      console.error("Error starting export:", error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const stopExport = () => {
    storeStopExport();

    if (exportAnimationRef.current) {
      cancelAnimationFrame(exportAnimationRef.current);
      exportAnimationRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.muted = isMuted;
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (exportAnimationRef.current) {
        cancelAnimationFrame(exportAnimationRef.current);
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
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
        className="hidden-video"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
        crossOrigin="anonymous"
      />

      <div className="canvas-container" data-aspect-ratio={aspectRatio}>
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
              <Button
                onClick={stopExport}
                variant="outline"
                size="sm"
                style={{ marginTop: "10px" }}
              >
                Cancel Export
              </Button>
            </div>
          </div>
        )}
      </div>
      <VideoController
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        currentTime={currentTime}
        duration={duration}
        formatTime={formatTime}
        isMuted={isMuted}
        toggleMute={toggleMute}
        volume={volume}
        handleVolumeChange={handleVolumeChange}
        isExporting={isExporting}
      />
    </div>
  );
};

export default CanvasVideoExporter;
