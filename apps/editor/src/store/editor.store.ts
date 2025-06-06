import { create } from "zustand";
import { IEditorState } from "@repo/types/index.ts";

const defaultBackground = {
  id: "grad-1",
  name: "Rose to Orange",
  color: "#f43f5e",
  gradient: "from-rose-500 to-orange-500 bg-gradient-to-br",
  type: "gradient",
};

const useEditorStore = create<IEditorState>((set, get) => ({
  editorBg: "bg-gray-200",
  allowAudio: true,
  allowZoom: false,
  updateEditorBg: (data: string) => set({ editorBg: data }),
  updateMediaOptions: () =>
    set({
      allowZoom: true,
      allowAudio: true,
    }),

  aspectRatio: "16:9",
  setAspectRatio: (ratio: string) => set({ aspectRatio: ratio }),
  backgrounds: [],
  selectedBackground: defaultBackground,
  setSelectedBackground: (bg: Background) => set({ selectedBackground: bg }),

  exportFormat: "webm" as const,
  setExportFormat: (format: "webm" | "mp4") => set({ exportFormat: format }),
  exportQuality: "high" as const,
  setExportQuality: (quality: "high" | "medium" | "low") =>
    set({ exportQuality: quality }),
  isExporting: false,
  setIsExporting: (exporting: boolean) => set({ isExporting: exporting }),
  exportProgress: 0,
  setExportProgress: (progress: number) => set({ exportProgress: progress }),
  conversionProgress: 0,
  setConversionProgress: (progress: number) =>
    set({ conversionProgress: progress }),
  exportedVideoURL: null,
  setExportedVideoURL: (url: string | null) => set({ exportedVideoURL: url }),
  exportError: null as string | null,
  setExportError: (error: string | null) => set({ exportError: error }),

  startExport: () => {
    set({
      isExporting: true,
      exportProgress: 0,
      exportError: null,
      exportedVideoURL: null,
    });

    console.log(
      "Export started with format:",
      get().exportFormat,
      "and quality:",
      get().exportQuality,
    );

    const interval = setInterval(() => {
      const currentProgress = get().exportProgress;
      if (currentProgress < 100) {
        set({ exportProgress: currentProgress + 5 });
      } else {
        clearInterval(interval);

        const fakeBlob = new Blob(["Fake video data"], {
          type: `video/${get().exportFormat}`,
        });
        const blobUrl = URL.createObjectURL(fakeBlob);

        set({
          isExporting: false,
          exportedVideoURL: blobUrl,
        });

        console.log("Export complete. Video URL:", blobUrl);
      }
    }, 500);
  },

  stopExport: () => {
    set({
      isExporting: false,
      exportProgress: 0,
      conversionProgress: 0,
      exportError: null,
    });
  },

  downloadExportedVideo: () => {
    const { exportedVideoURL, exportFormat } = get();
    if (exportedVideoURL) {
      try {
        const link = document.createElement("a");
        link.href = exportedVideoURL;
        link.download = `exported-video.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading video:", error);
        set({ exportError: "Failed to download the video. Please try again." });
      }
    } else {
      set({ exportError: "No exported video available for download." });
    }
  },

  resetExport: () => {
    set({
      isExporting: false,
      exportProgress: 0,
      conversionProgress: 0,
      exportError: null,
      exportedVideoURL: null,
    });
  },
}));

export default useEditorStore;
