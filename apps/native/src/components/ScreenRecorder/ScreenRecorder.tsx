import React, { useState } from 'react';
import { RecordingControls } from './RecordingControls';
import { VideoEditor } from './VideoEditor';
import { invoke } from '@tauri-apps/api/tauri';
import { toast } from 'sonner';

export const ScreenRecorder: React.FC = () => {
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleRecordingStart = () => {
    setIsRecording(true);
    toast.success('Recording started');
  };

  const handleRecordingStop = async () => {
    setIsRecording(false);
    try {
      const videoPath = await invoke('get_recording_path');
      setRecordedVideo(videoPath as string);
      toast.success('Recording saved');
    } catch (error) {
      console.error('Failed to get recording path:', error);
      toast.error('Failed to save recording');
    }
  };

  const handleRecordingPause = () => {
    toast.info('Recording paused');
  };

  const handleSaveEdit = async (startTime: number, endTime: number) => {
    if (!recordedVideo) return;

    try {
      await invoke('trim_video', {
        inputPath: recordedVideo,
        startTime,
        endTime,
      });
      toast.success('Video trimmed successfully');
    } catch (error) {
      console.error('Failed to trim video:', error);
      toast.error('Failed to trim video');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">Screen Recorder</h1>
        <RecordingControls
          onRecordingStart={handleRecordingStart}
          onRecordingStop={handleRecordingStop}
          onRecordingPause={handleRecordingPause}
        />
      </div>

      {recordedVideo && !isRecording && (
        <div className="border rounded-lg overflow-hidden">
          <VideoEditor
            videoSrc={recordedVideo}
            onSave={handleSaveEdit}
          />
        </div>
      )}
    </div>
  );
}; 