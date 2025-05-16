import { useEffect, useState } from "react";
import "./Popup.css";
import useMediaCapture from "../hooks/useMediaCapture";

export default function PopupPage() {
  const {
    isRecording,
    captureMedia,
    stopCapture,
    webcamEnabled,
    setWebcamEnabled,
  } = useMediaCapture();
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const buttonText = isRecording
    ? `Stop Recording (${formatTime(recordingTime)})`
    : "Start Recording";
  const buttonBgColor = isRecording
    ? "bg-red-600 hover:bg-red-700"
    : "bg-blue-600 hover:bg-blue-700";
  const buttonShadow = isRecording ? "shadow-red-500/50" : "shadow-blue-500/50";
  const titleColor = isRecording ? "text-red-400" : "text-red-500";

  const toggleWebcam = () => {
    setWebcamEnabled(!webcamEnabled);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4 font-sans">
      <div className="bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md text-center">
        {isRecording ? (
          <div className="mb-6">
            <div className="animate-pulse mx-auto w-16 h-16 flex items-center justify-center bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.7)]">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
          </div>
        ) : (
          <h3 className="text-5xl mb-[.5em]">🌶️</h3>
        )}

        <h1 className={`text-3xl font-bold mb-2 ${titleColor}`}>
          {isRecording ? formatTime(recordingTime) : "Screen Recorder"}
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          {isRecording
            ? "Recording in progress..."
            : "Capture your screen with style"}
        </p>

        <button
          onClick={isRecording ? stopCapture : captureMedia}
          className={`w-full ${buttonBgColor} text-white font-semibold py-3.5 px-6 rounded-lg text-lg flex items-center justify-center gap-2.5 transition-all duration-150 ease-in-out shadow-lg hover:shadow-xl ${buttonShadow} focus:outline-none focus:ring-4 ${isRecording ? "focus:ring-red-500/50" : "focus:ring-blue-500/50"}`}
        >
          {!isRecording && (
            <span className="w-2.5 h-2.5 bg-red-400 rounded-full"></span>
          )}
          {buttonText}
        </button>

        {!isRecording && (
          <>
            <div className="flex items-center justify-center mt-6 mb-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={webcamEnabled}
                  onChange={toggleWebcam}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-white">
                  Include Webcam
                </span>
              </label>
            </div>
            <p className="text-slate-500 text-xs mt-2">
              Your recordings will be opened in the Rodoh editor.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
