import React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import VideoTimelapse from "@/components/modules/video-time-stamp-visulizer.tsx";

interface VideoControllerProps {
  isPlaying: boolean;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  formatTime: (time: number) => string;
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isExporting?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  onSeek?: (time: number) => void;
}

const VideoController = ({
  isPlaying,
  togglePlay,
  currentTime,
  duration,
  formatTime,
  isMuted,
  toggleMute,
  volume,
  handleVolumeChange,
  isExporting = false,
  videoRef,
  onSeek,
}: VideoControllerProps) => {
  const safeFormatTime = (time: number) => {
    if (!time || isNaN(time) || !isFinite(time)) {
      return "00:00";
    }
    return formatTime(time);
  };

  const handleSeek = (value: number[]) => {
    if (onSeek) {
      onSeek(value[0]);
    } else if (videoRef?.current) {
      videoRef.current.currentTime = value[0];
    }
  };

  const handleTrimChange = (start: number, end: number) => {
    console.log(`Trim set to ${start} - ${end}`);
  };

  return (
    <div className="control-bar bg-black-900  w-full space-y-4">
      <div className="playback-controls flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          disabled={isExporting}
          className="control-button"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>

        <div className="time-display min-w-[100px] text-sm">
          {safeFormatTime(currentTime)} / {safeFormatTime(duration)}
        </div>

        <div className="flex-spacer flex-grow"></div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          disabled={isExporting}
          className="control-button"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </Button>

        <div className="volume-slider w-24">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            disabled={isExporting}
            className="w-full"
          />
        </div>
      </div>

      <div className="seek-container mb-2">
        <Slider
          defaultValue={[0]}
          value={[currentTime]}
          max={Math.max(duration, 0.1)}
          step={0.01}
          onValueChange={handleSeek}
          disabled={isExporting || !duration}
          className="seek-slider"
        />
      </div>

      <VideoTimelapse
        currentTime={currentTime}
        duration={duration}
        formatTime={formatTime}
        isExporting={isExporting}
        onSeek={onSeek}
        onTrimChange={handleTrimChange}
      />
    </div>
  );
};

export default VideoController;
