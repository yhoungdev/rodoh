import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Video, FileVideo, Loader, Download, Settings } from "lucide-react";
import useEditorStore from "@/store/editor.store";

const ExportSettings = () => {
  const {
    exportFormat,
    setExportFormat,
    exportQuality,
    setExportQuality,
    aspectRatio,
    setAspectRatio,
    isExporting,
    exportProgress,
    conversionProgress,
    exportedVideoURL,
    startExport,
    downloadExportedVideo,
    stopExport,
  } = useEditorStore();

  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  useEffect(() => {
    const checkFfmpegStatus = async () => {
      setFfmpegLoading(true);
      try {
        setTimeout(() => {
          setFfmpegLoaded(true);
          setFfmpegLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Failed to check FFmpeg status:", error);
        setFfmpegLoading(false);
      }
    };

    checkFfmpegStatus();
  }, []);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={aspectRatio === "16:9" ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatio("16:9")}
            disabled={isExporting}
            className="w-full"
          >
            16:9
          </Button>
          <Button
            variant={aspectRatio === "4:3" ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatio("4:3")}
            disabled={isExporting}
            className="w-full"
          >
            4:3
          </Button>
          <Button
            variant={aspectRatio === "1:1" ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatio("1:1")}
            disabled={isExporting}
            className="w-full"
          >
            1:1
          </Button>
          <Button
            variant={aspectRatio === "9:16" ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatio("9:16")}
            disabled={isExporting}
            className="w-full"
          >
            9:16
          </Button>
          <Button
            variant={aspectRatio === "21:9" ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatio("21:9")}
            disabled={isExporting}
            className="w-full"
          >
            21:9
          </Button>
          <Button
            variant={aspectRatio === "2:1" ? "default" : "outline"}
            size="sm"
            onClick={() => setAspectRatio("2:1")}
            disabled={isExporting}
            className="w-full"
          >
            2:1
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Export Format</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={exportFormat === "webm" ? "default" : "outline"}
            size="sm"
            onClick={() => setExportFormat("webm")}
            disabled={isExporting}
            className="w-full"
          >
            <FileVideo size={16} className="mr-2" />
            WebM
          </Button>
          <Button
            variant={exportFormat === "mp4" ? "default" : "outline"}
            size="sm"
            onClick={() => setExportFormat("mp4")}
            disabled={isExporting || (!ffmpegLoaded && !ffmpegLoading)}
            className="w-full"
          >
            <Video size={16} className="mr-2" />
            MP4 {!ffmpegLoaded && ffmpegLoading && "..."}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Quality</label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={exportQuality === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => setExportQuality("high")}
            disabled={
              isExporting ||
              (exportFormat === "mp4" && (!ffmpegLoaded || ffmpegLoading))
            }
            className="w-full"
          >
            High
          </Button>
          <Button
            variant={exportQuality === "medium" ? "default" : "outline"}
            size="sm"
            onClick={() => setExportQuality("medium")}
            disabled={
              isExporting ||
              (exportFormat === "mp4" && (!ffmpegLoaded || ffmpegLoading))
            }
            className="w-full"
          >
            Medium
          </Button>
          <Button
            variant={exportQuality === "low" ? "default" : "outline"}
            size="sm"
            onClick={() => setExportQuality("low")}
            disabled={
              isExporting ||
              (exportFormat === "mp4" && (!ffmpegLoaded || ffmpegLoading))
            }
            className="w-full"
          >
            Low
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {!exportedVideoURL && !isExporting ? (
          <Button
            onClick={startExport}
            className="w-full"
            disabled={
              isExporting ||
              (exportFormat === "mp4" && (!ffmpegLoaded || ffmpegLoading))
            }
          >
            <Settings size={16} className="mr-2" />
            Export {exportFormat.toUpperCase()}
          </Button>
        ) : isExporting ? (
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{
                  width: `${
                    exportFormat === "mp4" && conversionProgress > 0
                      ? conversionProgress
                      : exportProgress
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">
                {exportFormat === "mp4" && conversionProgress > 0
                  ? `Converting: ${conversionProgress}%`
                  : `Exporting: ${exportProgress}%`}
              </span>
              <Button onClick={stopExport} variant="destructive" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={downloadExportedVideo}
            className="w-full"
            variant="default"
          >
            <Download size={16} className="mr-2" />
            Download {exportFormat.toUpperCase()}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExportSettings;
