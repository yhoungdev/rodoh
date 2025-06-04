import React, { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Save, Play, Pause, Scissors } from 'lucide-react';

interface VideoEditorProps {
  videoSrc: string;
  onSave: (startTime: number, endTime: number) => void;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ videoSrc, onSave }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setTrimEnd(videoDuration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrimRangeChange = (values: number[]) => {
    setTrimStart(values[0]);
    setTrimEnd(values[1]);
  };

  const handleSave = () => {
    onSave(trimStart, trimEnd);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={togglePlayPause} variant="outline" size="icon">
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={([value]) => {
              if (videoRef.current) {
                videoRef.current.currentTime = value;
              }
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4" />
          <span className="text-sm font-medium">Trim Video</span>
        </div>
        <Slider
          value={[trimStart, trimEnd]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={handleTrimRangeChange}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{trimStart.toFixed(1)}s</span>
          <span>{trimEnd.toFixed(1)}s</span>
        </div>
      </div>

      <Button onClick={handleSave} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Save Changes
      </Button>
    </div>
  );
}; 