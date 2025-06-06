import { Button } from "@repo/shared/components/index";
import { Download, FileVideo, Settings, Video } from "lucide-react";
import useEditorStore from "@/store/editor.store";

interface ConvertVideoProps {
  ffmpegLoaded: boolean;
  ffmpegLoading: boolean;
}

const ConvertVideo = ({ ffmpegLoaded, ffmpegLoading }: ConvertVideoProps) => {
  const {
    exportFormat,
    setExportFormat,
    exportQuality,
    setExportQuality,
    isExporting,
    exportProgress,
    conversionProgress,
    exportedVideoURL,
    startExport,
    downloadExportedVideo,
    stopExport,
  } = useEditorStore();

  return (
    <div>
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
            disabled={isExporting || (!ffmpegLoaded && ffmpegLoading)}
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

export default ConvertVideo;
