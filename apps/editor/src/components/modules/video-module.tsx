import { useEffect, useRef, useState } from "react";
import useEditorStore from "@/store/editor.store.ts";
import ReactPlayer from "react-player";
import html2canvas from "html2canvas";

function VideoModule() {
  const { editorBg } = useEditorStore();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [rawBase64Data, setRawBase64Data] = useState<string | null>(null);
  const [rawVideoBlob, setRawVideoBlob] = useState<Blob | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasLocalRecording = params.get("localRecording");

    console.log(hasLocalRecording)

    if (hasLocalRecording) {
      const recordingDataString = localStorage.getItem("recordingData");
      if (recordingDataString) {
        const parsedRecordingData = JSON.parse(recordingDataString);
        const videoDataUrl = parsedRecordingData.data.videoData as string;

        const base64Content = videoDataUrl.split(",")[1];
        setRawBase64Data(base64Content);

        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "video/webm" });
        setRawVideoBlob(blob);

        const url = URL.createObjectURL(blob);
        setVideoUrl(url);

        localStorage.removeItem("recordingData");
      }
    }
  }, []);

  if (!videoUrl) {
    console.warn("No video URL found. Ensure the fileUrl is passed correctly.");
  }
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handleExport = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);

    const exportContainer = containerRef.current.cloneNode(true) as HTMLElement;
    exportContainer.style.backgroundColor = "rgb(255, 255, 255)";
    exportContainer.style.position = "fixed";
    exportContainer.style.top = "0";
    exportContainer.style.left = "0";
    exportContainer.style.zIndex = "-1000";
    document.body.appendChild(exportContainer);

    try {
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        removeContainer: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "exported-video-with-background.png";
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error("Error exporting video:", error);
    } finally {
      document.body.removeChild(exportContainer);
      setIsExporting(false);
    }
  };

  return (
    <div
      className={`
      w-full h-[80%] flex flex-col items-center justify-center !rounded-lg
      ${editorBg}
    `}
    >
      <div
        ref={containerRef}
        className="w-[90%] h-[90%] !rounded-lg flex items-center justify-center relative"
      >
        {videoUrl ? (
          <ReactPlayer
            url={videoUrl}
            controls
            width="100%"
            height="100%"
            className="absolute top-0 left-0"
          />
        ) : (
          <p className="text-gray-500">
            No video loaded. Upload a video to start.
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-4">
        <label
          htmlFor="video-upload"
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Upload Video
        </label>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <button
          onClick={handleExport}
          className={`bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 ${
            isExporting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isExporting}
        >
          {isExporting ? "Exporting..." : "Export Video"}
        </button>
      </div>
    </div>
  );
}

export default VideoModule;
