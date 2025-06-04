import React, { useState } from 'react';
import { Button } from '../ui/button';
import { invoke } from '@tauri-apps/api/tauri';
import {  Square, Pause } from 'lucide-react';

interface RecordingControlsProps {
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  onRecordingPause: () => void;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  onRecordingStart,
  onRecordingStop,
  onRecordingPause,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleStartRecording = async () => {
    try {
      await invoke('start_recording');
      setIsRecording(true);
      onRecordingStart();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      await invoke('stop_recording');
      setIsRecording(false);
      setIsPaused(false);
      onRecordingStop();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handlePauseRecording = async () => {
    try {
      await invoke('pause_recording');
      setIsPaused(!isPaused);
      onRecordingPause();
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 p-4">
      {!isRecording ? (
        <Button
          onClick={handleStartRecording}
          variant="default"
          className="flex items-center gap-2"
        >
          <div className="w-4 h-4 bg-red-500"></div>
          Start Recording
        </Button>
      ) : (
        <>
          <Button
            onClick={handlePauseRecording}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Pause className="w-4 h-4" />
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            onClick={handleStopRecording}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Stop
          </Button>
        </>
      )}
    </div>
  );
}; 