import { useEffect, useState } from "react";
import CanvasVideoExporter from "../video/CanvasVideoExporter";

interface VideoClickEvent {
  time: number;
  x: number;
  y: number;
}

const VideoModule = () => {
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [downloadFileName, setDownloadFileName] = useState<string>(
    "screen-recording.webm",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [clickEvents, setClickEvents] = useState<VideoClickEvent[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadVideoData = async () => {
      if (!isMounted) return;

      console.log("video-preview-bar: Starting to load video data...");
      setIsLoading(true);
      setErrorMessage(null);
      setLoadingProgress(0);

      const urlParams = new URLSearchParams(window.location.search);
      const recordingId = urlParams.get("recordingId");

      if (!recordingId) {
        setErrorMessage("No recording ID found in URL.");
        setIsLoading(false);
        return;
      }

      setDownloadFileName(`recording-${recordingId}.webm`);

      try {
        console.log(
          "video-preview-bar: Checking localStorage for recordingData",
        );
        setLoadingProgress(20);

        const recordingDataString = localStorage.getItem("recordingData");
        if (!recordingDataString) {
          console.log("video-preview-bar: No data found, waiting for event...");
          setIsLoading(false);
          return;
        }

        const recordingData = JSON.parse(recordingDataString);

        const base64Data = recordingData?.data?.videoData;
        const idFromStorage = recordingData?.data?.recordingId;
        const clickEventsData = recordingData?.data?.clickEvents || [];

        if (!base64Data || (idFromStorage && idFromStorage !== recordingId)) {
          throw new Error("Recording data ID mismatch or missing.");
        }

        if (Array.isArray(clickEventsData) && clickEventsData.length > 0) {
          setClickEvents(clickEventsData);
        } else {
          const mockEvents = [
            { time: 2, x: 0.25, y: 0.25 },
            { time: 5, x: 0.75, y: 0.5 },
            { time: 8, x: 0.3, y: 0.7 },
            { time: 12, x: 0.6, y: 0.2 },
          ];
          setClickEvents(mockEvents);
        }

        setLoadingProgress(60);

        const base64Content = base64Data.split(",")[1];
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length)
          .fill(0)
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "video/webm" });

        const url = URL.createObjectURL(blob);
        setVideoURL(url);

        setLoadingProgress(100);
        setIsLoading(false);
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || "An error occurred.");
          setIsLoading(false);
        }
      }
    };

    loadVideoData();

    const handleRecordingReady = (event: CustomEvent) => {
      console.log(
        "video-preview-bar: Received recording-ready event",
        event.detail,
      );
      if (isMounted) {
        loadVideoData();
      }
    };

    window.addEventListener(
      "rodoh:recording-ready",
      handleRecordingReady as EventListener,
    );

    let dataCheckRef: number | null = null;

    const checkForData = () => {
      const hasVideo = !!localStorage.getItem("recordingData");
      if (hasVideo && isMounted) {
        loadVideoData();
        if (dataCheckRef) {
          clearInterval(dataCheckRef);
          dataCheckRef = null;
        }
      }
    };

    if (!localStorage.getItem("recordingData")) {
      dataCheckRef = window.setInterval(checkForData, 2000);
    }

    return () => {
      isMounted = false;
      window.removeEventListener(
        "rodoh:recording-ready",
        handleRecordingReady as EventListener,
      );
      if (dataCheckRef) {
        clearInterval(dataCheckRef);
      }
    };
  }, []);

  return (
    <div>
      {isLoading && <p>Loading... {loadingProgress}%</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {videoURL && (
        <>
          <div className="mt-10 mb-4">
            <h2 className="text-lg font-semibold mb-4">Rodoh 🌶️</h2>
            <p className="text-sm text-gray-500 mb-4">
              Use the controls below to play the video and export it with
              beautiful background effects
            </p>
            <CanvasVideoExporter
              videoSrc={videoURL}
              fileName={downloadFileName}
              clickEvents={clickEvents}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default VideoModule;
