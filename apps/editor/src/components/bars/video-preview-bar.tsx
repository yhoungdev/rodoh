import { useEffect, useState } from "react";

const VideoModule = () => {
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [downloadFileName, setDownloadFileName] = useState<string>(
    "screen-recording.webm",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  useEffect(() => {
    const loadVideoData = async () => {
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

          return;
        }

        const recordingData = JSON.parse(recordingDataString);

        const base64Data = recordingData?.data?.videoData;
        const idFromStorage = recordingData?.data?.recordingId;

        if (!base64Data || (idFromStorage && idFromStorage !== recordingId)) {
          throw new Error("Recording data ID mismatch or missing.");
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
        setErrorMessage(err.message || "An error occurred.");
        setIsLoading(false);
      }
    };

    loadVideoData();

    const handleRecordingReady = (event: CustomEvent) => {
      console.log(
        "video-preview-bar: Received recording-ready event",
        event.detail,
      );
      loadVideoData();
    };

    window.addEventListener(
      "rodoh:recording-ready",
      handleRecordingReady as EventListener,
    );

    const checkInterval = setInterval(() => {
      if (!videoURL && !errorMessage) {
        console.log("video-preview-bar: Checking for data again...");
        loadVideoData();
      } else {
        clearInterval(checkInterval);
      }
    }, 2000);

    return () => {
      window.removeEventListener(
        "rodoh:recording-ready",
        handleRecordingReady as EventListener,
      );
      clearInterval(checkInterval);
    };
  }, [videoURL, errorMessage]);

  return (
    <div>
      {isLoading && <p>Loading... {loadingProgress}%</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {videoURL && (
        <>
          <video
            src={videoURL}
            controls
            style={{ width: "100%", maxWidth: "800px" }}
          />
          <a href={videoURL} download={downloadFileName} className="btn">
            Download Recording
          </a>
        </>
      )}
    </div>
  );
};

export default VideoModule;
