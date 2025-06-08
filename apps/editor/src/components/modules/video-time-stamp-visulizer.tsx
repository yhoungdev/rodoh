import React, { useEffect, useRef, useState } from "react";
import {
  Scissors,
  Clock,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Camera,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Button,
} from "@repo/ui/src";
import { v4 as uuidv4 } from "uuid";

interface VideoTimelapseProps {
  currentTime: number;
  duration: number;
  formatTime: (time: number) => string;
  isExporting?: boolean;
  onSeek?: (time: number) => void;
  onTrimChange?: (start: number, end: number) => void;
}

interface TimestampFrame {
  id: string;
  time: number;
  imageUrl?: string;
  color: string;
}

const VideoTimelapse = ({
  currentTime,
  duration,
  formatTime,
  isExporting = false,
  onSeek,
  onTrimChange,
}: VideoTimelapseProps) => {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);
  const [timelapseFrames, setTimelapseFrames] = useState<TimestampFrame[]>([]);
  const [captureInterval, setCaptureInterval] = useState(5);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(
    null,
  );
  const [timelapseZoom, setTimelapseZoom] = useState(1);
  const [viewOffset, setViewOffset] = useState(0);
  const frameStripRef = useRef<HTMLDivElement>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const safeFormatTime = (time: number) => {
    if (!time || isNaN(time) || !isFinite(time)) {
      return "00:00";
    }
    return formatTime(time);
  };

  useEffect(() => {
    if (duration && isFinite(duration) && duration > 0) {
      if (trimEnd === 0 || trimEnd > duration) {
        setTrimEnd(duration);
      }

      if (timelapseFrames.length === 0) {
        generateTimelapseFrames(duration);
      }
    }
  }, [duration, trimEnd, timelapseFrames.length]);

  useEffect(() => {
    if (timelapseFrames.length > 0 && currentTime > 0) {
      let closestIndex = 0;
      let closestDiff = Math.abs(timelapseFrames[0].time - currentTime);

      timelapseFrames.forEach((frame, index) => {
        const diff = Math.abs(frame.time - currentTime);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = index;
        }
      });

      setSelectedFrameIndex(closestIndex);
    }
  }, [currentTime, timelapseFrames]);

  useEffect(() => {
    if (onTrimChange && isTrimming) {
      onTrimChange(trimStart, trimEnd);
    }
  }, [trimStart, trimEnd, isTrimming, onTrimChange]);

  const generateTimelapseFrames = (totalDuration: number) => {
    const frames: TimestampFrame[] = [];

    for (let time = 0; time < totalDuration; time += captureInterval) {
      const hue = (time / totalDuration) * 360;
      frames.push({
        id: uuidv4(),
        time,
        color: `hsl(${hue}, 70%, 60%)`,
      });
    }

    if (
      frames.length === 0 ||
      frames[frames.length - 1].time < totalDuration - 1
    ) {
      frames.push({
        id: uuidv4(),
        time: totalDuration,
        color: `hsl(360, 70%, 60%)`,
      });
    }

    setTimelapseFrames(frames);
  };

  const handleTrimStartSet = () => {
    const newTrimStart = currentTime;
    setTrimStart(newTrimStart);
    if (onTrimChange) {
      onTrimChange(newTrimStart, trimEnd);
    }
  };

  const handleTrimEndSet = () => {
    const newTrimEnd = currentTime;
    setTrimEnd(newTrimEnd);
    if (onTrimChange) {
      onTrimChange(trimStart, newTrimEnd);
    }
  };

  const toggleTrimming = () => {
    setIsTrimming(!isTrimming);
    if (!isTrimming) {
      setTrimStart(0);
      setTrimEnd(duration || 0);
      if (onTrimChange) {
        onTrimChange(0, duration || 0);
      }
    }
  };

  const resetTrim = () => {
    setTrimStart(0);
    setTrimEnd(duration || 0);
    if (onTrimChange) {
      onTrimChange(0, duration || 0);
    }
  };

  const jumpToTrimStart = () => {
    seekToTime(trimStart);
  };

  const jumpToTrimEnd = () => {
    seekToTime(trimEnd);
  };

  const seekToTime = (time: number) => {
    if (onSeek) {
      onSeek(time);
    }
  };

  const jumpToFrame = (index: number) => {
    if (index >= 0 && index < timelapseFrames.length) {
      setSelectedFrameIndex(index);
      seekToTime(timelapseFrames[index].time);
    }
  };

  const captureFrame = () => {
    const hue = (currentTime / duration) * 360;
    const newFrame: TimestampFrame = {
      id: uuidv4(),
      time: currentTime,
      color: `hsl(${hue}, 70%, 60%)`,
    };

    const newFrames = [...timelapseFrames];
    let insertIndex = newFrames.length;
    for (let i = 0; i < newFrames.length; i++) {
      if (newFrames[i].time > currentTime) {
        insertIndex = i;
        break;
      }
    }

    newFrames.splice(insertIndex, 0, newFrame);
    setTimelapseFrames(newFrames);
    setSelectedFrameIndex(insertIndex);
  };

  const deleteFrame = (index: number) => {
    const newFrames = [...timelapseFrames];
    newFrames.splice(index, 1);
    setTimelapseFrames(newFrames);

    if (selectedFrameIndex === index) {
      setSelectedFrameIndex(null);
    } else if (selectedFrameIndex !== null && selectedFrameIndex > index) {
      setSelectedFrameIndex(selectedFrameIndex - 1);
    }
  };

  const regenerateFrames = () => {
    generateTimelapseFrames(duration);
  };

  const updateCaptureInterval = (interval: number) => {
    setCaptureInterval(interval);
    generateTimelapseFrames(duration);
  };

  const zoomIn = () => {
    setTimelapseZoom((prev) => Math.min(prev * 1.5, 5));
  };

  const zoomOut = () => {
    setTimelapseZoom((prev) => Math.max(prev / 1.5, 1));
  };

  const resetZoom = () => {
    setTimelapseZoom(1);
    setViewOffset(0);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (timelapseZoom > 1) {
      const step = 0.1;
      const newOffset =
        direction === "left"
          ? Math.max(0, viewOffset - step)
          : Math.min(1 - 1 / timelapseZoom, viewOffset + step);
      setViewOffset(newOffset);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameStripRef.current || isExporting || !duration) return;

    const rect = frameStripRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;

    const visibleTimeStart = viewOffset * duration;
    const visibleTimeEnd = visibleTimeStart + duration / timelapseZoom;
    const clickedTime =
      visibleTimeStart + percentage * (visibleTimeEnd - visibleTimeStart);

    let closestIndex = 0;
    let closestDiff = Math.abs(timelapseFrames[0].time - clickedTime);

    timelapseFrames.forEach((frame, index) => {
      const diff = Math.abs(frame.time - clickedTime);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = index;
      }
    });

    jumpToFrame(closestIndex);
  };

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameStripRef.current || !duration) return;

    const rect = frameStripRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;

    const visibleTimeStart = viewOffset * duration;
    const visibleTimeEnd = visibleTimeStart + duration / timelapseZoom;
    const hoverTime =
      visibleTimeStart + percentage * (visibleTimeEnd - visibleTimeStart);

    setHoveredTime(Math.min(Math.max(0, hoverTime), duration));
  };

  const handleTimelineLeave = () => {
    setHoveredTime(null);
  };

  const getFramePosition = (time: number) => {
    if (!duration) return "0%";

    const visibleTimeStart = viewOffset * duration;
    const visibleDuration = duration / timelapseZoom;

    const percentage = ((time - visibleTimeStart) / visibleDuration) * 100;
    return `${Math.max(0, Math.min(100, percentage))}%`;
  };

  const isFrameVisible = (time: number) => {
    const visibleTimeStart = viewOffset * duration;
    const visibleTimeEnd = visibleTimeStart + duration / timelapseZoom;

    return time >= visibleTimeStart && time <= visibleTimeEnd;
  };

  const getTimeMarkers = () => {
    if (!duration) return [];

    const visibleDuration = duration / timelapseZoom;
    const visibleStartTime = viewOffset * duration;
    const visibleEndTime = visibleStartTime + visibleDuration;

    const interval = Math.max(1, Math.floor(visibleDuration / 10));
    const startTime = Math.floor(visibleStartTime / interval) * interval;

    const markers = [];
    for (let time = startTime; time <= visibleEndTime; time += interval) {
      if (time >= 0 && time <= duration) {
        markers.push(time);
      }
    }

    return markers;
  };

  return (
    <div className="timelapse-container">
      <div className="controls-wrapper flex items-center justify-between gap-2 mb-2">
        <div className="left-controls flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTrimming}
                  disabled={isExporting || !duration}
                  className={isTrimming ? "bg-red-900/20" : ""}
                >
                  <Scissors
                    size={16}
                    className={isTrimming ? "text-red-400" : ""}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Trim Mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={captureFrame}
                  disabled={isExporting || !duration}
                >
                  <Camera size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Capture Frame</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="zoom-controls flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            disabled={timelapseZoom >= 5 || !timelapseFrames.length}
            className="h-6 w-6"
          >
            <ZoomIn size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            disabled={timelapseZoom <= 1 || !timelapseFrames.length}
            className="h-6 w-6"
          >
            <ZoomOut size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetZoom}
            disabled={
              (timelapseZoom === 1 && viewOffset === 0) ||
              !timelapseFrames.length
            }
            className="h-6 w-6"
          >
            <RefreshCw size={14} />
          </Button>

          {timelapseZoom > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleScroll("left")}
                disabled={viewOffset <= 0}
                className="h-6 w-6"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleScroll("right")}
                disabled={viewOffset >= 1 - 1 / timelapseZoom}
                className="h-6 w-6"
              >
                <ChevronRight size={14} />
              </Button>
            </>
          )}
        </div>

        <div className="interval-controls flex items-center space-x-2">
          <span className="text-xs text-gray-400">Interval:</span>
          <select
            value={captureInterval}
            onChange={(e) => updateCaptureInterval(Number(e.target.value))}
            className="text-xs bg-background border-border border rounded p-1"
            disabled={isExporting}
          >
            <option value="1">1s</option>
            <option value="2">2s</option>
            <option value="5">5s</option>
            <option value="10">10s</option>
            <option value="30">30s</option>
            <option value="60">1m</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={regenerateFrames}
            className="text-xs h-6"
            disabled={isExporting || !duration}
          >
            Regenerate
          </Button>
        </div>
      </div>

      <div
        ref={frameStripRef}
        className="timelapse-strip relative h-20 bg-gray-900 rounded-md overflow-hidden border border-gray-700"
        onClick={handleTimelineClick}
        onMouseMove={handleTimelineHover}
        onMouseLeave={handleTimelineLeave}
      >
        {timelapseFrames.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No frames captured. Click the camera button to capture frames.
          </div>
        ) : (
          <>
            <div className="time-markers absolute bottom-0 left-0 right-0 h-5 border-t border-gray-700 flex items-center text-xs text-gray-400 z-10 bg-gray-800/80">
              {getTimeMarkers().map((time, index) => (
                <div
                  key={index}
                  className="time-marker absolute flex flex-col items-center"
                  style={{ left: getFramePosition(time) }}
                >
                  <div className="h-1 w-0.5 bg-gray-500"></div>
                  <span className="mt-0.5">{safeFormatTime(time)}</span>
                </div>
              ))}
            </div>

            <div className="frame-thumbnails absolute top-0 left-0 right-0 bottom-5">
              {timelapseFrames.map((frame, index) => {
                if (isFrameVisible(frame.time)) {
                  const isSelected = index === selectedFrameIndex;
                  return (
                    <div
                      key={frame.id}
                      className={`frame-thumbnail absolute h-full w-[3px] cursor-pointer transition-all hover:scale-x-125
                                ${isSelected ? "w-[5px] ring-2 ring-gray-300 z-20" : ""}`}
                      style={{
                        left: getFramePosition(frame.time),
                        backgroundColor: frame.color,
                        transform: "translateX(-50%)",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToFrame(index);
                      }}
                    >
                      <div
                        className={`absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded p-1
                                    ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      >
                        {safeFormatTime(frame.time)}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div
              className="current-time-indicator absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
              style={{ left: getFramePosition(currentTime) }}
            >
              <div className="current-time-handle w-3 h-3 bg-red-500 rounded-full absolute top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {hoveredTime !== null && (
              <div
                className="hover-time-tooltip absolute top-0 px-2 py-1 bg-black text-white text-xs rounded pointer-events-none transform -translate-x-1/2"
                style={{ left: getFramePosition(hoveredTime) }}
              >
                {safeFormatTime(hoveredTime)}
              </div>
            )}

            {isTrimming && duration > 0 && (
              <>
                <div
                  className="trim-region absolute h-full bg-blue-900/30 opacity-40"
                  style={{
                    left: getFramePosition(trimStart),
                    width: `${((trimEnd - trimStart) / (duration / timelapseZoom)) * 100}%`,
                  }}
                />

                <div
                  className="trim-start-marker absolute w-1 h-full bg-blue-400 cursor-ew-resize z-10"
                  style={{ left: getFramePosition(trimStart) }}
                />

                <div
                  className="trim-end-marker absolute w-1 h-full bg-blue-400 cursor-ew-resize z-10"
                  style={{ left: getFramePosition(trimEnd) }}
                />
              </>
            )}
          </>
        )}
      </div>

      {selectedFrameIndex !== null && (
        <div className="selected-frame-details mt-2 p-2 bg-gray-800 rounded-md border border-gray-700 flex items-center">
          <div
            className="w-8 h-8 rounded overflow-hidden mr-2"
            style={{
              backgroundColor: timelapseFrames[selectedFrameIndex].color,
            }}
          ></div>

          <div className="flex-1">
            <div className="text-sm font-medium text-gray-200">
              Frame {selectedFrameIndex + 1} of {timelapseFrames.length}
            </div>
            <div className="text-xs text-gray-400">
              Time: {safeFormatTime(timelapseFrames[selectedFrameIndex].time)}
            </div>
          </div>

          <div className="frame-actions flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => jumpToFrame(selectedFrameIndex - 1)}
              disabled={selectedFrameIndex <= 0}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => jumpToFrame(selectedFrameIndex + 1)}
              disabled={selectedFrameIndex >= timelapseFrames.length - 1}
              className="h-7 w-7 p-0"
            >
              <ChevronRight size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteFrame(selectedFrameIndex)}
              className="text-red-400 h-7"
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {isTrimming && duration > 0 && (
        <div className="trim-controls flex flex-wrap gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTrimStartSet}
            className="text-xs"
          >
            <Clock className="h-3 w-3 mr-1" /> Set Start:{" "}
            {safeFormatTime(trimStart)}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTrimEndSet}
            className="text-xs"
          >
            <Clock className="h-3 w-3 mr-1" /> Set End:{" "}
            {safeFormatTime(trimEnd)}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={jumpToTrimStart}
            className="text-xs"
          >
            Jump to Start
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={jumpToTrimEnd}
            className="text-xs"
          >
            Jump to End
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={resetTrim}
            className="text-xs ml-auto"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoTimelapse;
