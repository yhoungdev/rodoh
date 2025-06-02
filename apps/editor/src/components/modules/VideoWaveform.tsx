import { useEffect, useRef, useState, useCallback } from "react";

interface VideoWaveformProps {
  videoElement: HTMLVideoElement | null;
  currentTime: number;
  onTimeUpdate?: (time: number) => void;
  timestampInterval?: number;
  className?: string;
}

const VideoWaveform = ({
  videoElement,
  currentTime,
  onTimeUpdate,
  timestampInterval = 10,
  className = "",
}: VideoWaveformProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timestampsRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  const formatTimeString = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleTimestampClick = useCallback(
    (event: MouseEvent) => {
      try {
        const target = event.target as HTMLDivElement;
        const clickedTime = parseFloat(target.dataset.time || "0");
        if (!isNaN(clickedTime) && onTimeUpdate) {
          onTimeUpdate(clickedTime);
        }
      } catch (err) {
        console.error("Error handling timestamp click:", err);
      }
    },
    [onTimeUpdate],
  );

  useEffect(() => {
    if (!videoElement) {
      setError("Video element not found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!timestampsRef.current || !waveformRef.current) return;

      const duration = videoElement.duration || 0;
      const interval = Math.ceil(duration / timestampInterval);
      const timestamps = [];
      const waveformBars = [];

      for (let i = 0; i <= duration; i += interval) {
        const timeString = formatTimeString(i);
        const position = (i / duration) * 100;
        timestamps.push(
          `<div class="timestamp" style="left: ${position}%" data-time="${i}">${timeString}</div>`,
        );

        // Generate random heights for waveform visualization
        const barCount = 3;
        const bars = [];
        for (let j = 0; j < barCount; j++) {
          const height = 20 + Math.random() * 60;
          bars.push(
            `<div class="waveform-bar" style="height: ${height}%"></div>`,
          );
        }
        waveformBars.push(
          `<div class="waveform-group" style="left: ${position}%">${bars.join("")}</div>`,
        );
      }

      timestampsRef.current.innerHTML = timestamps.join("");
      waveformRef.current.innerHTML = waveformBars.join("");

      timestampsRef.current
        .querySelectorAll(".timestamp")
        .forEach((timestampDiv) => {
          timestampDiv.addEventListener(
            "click",
            handleTimestampClick as EventListener,
          );
        });

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to initialize timestamps: ${errorMessage}`);
      setIsLoading(false);
    }

    return () => {
      timestampsRef.current
        ?.querySelectorAll(".timestamp")
        .forEach((timestampDiv) => {
          timestampDiv.removeEventListener(
            "click",
            handleTimestampClick as EventListener,
          );
        });
    };
  }, [videoElement, timestampInterval, handleTimestampClick, formatTimeString]);

  const progressStyle = {
    width: `${(currentTime / (videoElement?.duration || 1)) * 100}%`,
  };

  return (
    <div className={`video-waveform-container ${className}`.trim()}>
      {isLoading && <div className="loading">Loading timestamps...</div>}
      {error && <div className="error">{error}</div>}
      <div className="waveform-wrapper">
        <div ref={waveformRef} className="waveform" />
        <div className="progress-overlay" style={progressStyle} />
      </div>
      <div ref={timestampsRef} className="timestamps" />
      <style jsx>{`
        .video-waveform-container {
          position: relative;
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 8px;
        }

        .waveform-wrapper {
          position: relative;
          width: 100%;
          height: 60px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
          overflow: hidden;
        }

        .waveform {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .waveform-group {
          position: absolute;
          display: flex;
          gap: 1px;
          transform: translateX(-50%);
        }

        .waveform-bar {
          width: 2px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 1px;
        }

        .progress-overlay {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(37, 99, 235, 0.2),
            transparent
          );
          pointer-events: none;
          transition: width 0.1s linear;
        }

        .timestamps {
          position: relative;
          width: 100%;
          height: 20px;
          margin-top: 4px;
        }

        .timestamp {
          position: absolute;
          transform: translateX(-50%);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          font-family: monospace;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .timestamp:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(37, 99, 235, 0.2);
        }

        .loading,
        .error {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
        }

        .loading {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }

        .error {
          background: rgba(220, 38, 38, 0.1);
          color: rgb(220, 38, 38);
        }
      `}</style>
    </div>
  );
};

export default VideoWaveform;
