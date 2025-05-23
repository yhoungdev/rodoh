import { create } from "zustand";

interface Background {
  id: string;
  name: string;
  color: string;
  gradient?: string;
  type: "solid" | "gradient";
}

const defaultBackground = {
  id: "grad-1",
  name: "Rose to Orange",
  color: "#f43f5e",
  gradient: "from-rose-500 to-orange-500 bg-gradient-to-br",
  type: "gradient",
};

interface IEditorState {
  editorBg: string;
  updateEditorBg: (data: string) => void;
  allowAudio: boolean;
  allowZoom: boolean;
  updateMediaOptions: () => void;

  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  backgrounds: Background[];
  selectedBackground: Background;
  setSelectedBackground: (bg: Background) => void;

  exportFormat: "webm" | "mp4";
  setExportFormat: (format: "webm" | "mp4") => void;
  exportQuality: "high" | "medium" | "low";
  setExportQuality: (quality: "high" | "medium" | "low") => void;
  isExporting: boolean;
  setIsExporting: (exporting: boolean) => void;
  exportProgress: number;
  setExportProgress: (progress: number) => void;
  conversionProgress: number;
  setConversionProgress: (progress: number) => void;
  exportedVideoURL: string | null;
  setExportedVideoURL: (url: string | null) => void;

  startExport: () => void;
  stopExport: () => void;
  downloadExportedVideo: () => void;
}

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

  startExport: () => {
    set({ isExporting: true, exportProgress: 0 });

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
        set({
          isExporting: false,
          exportedVideoURL: "blob:https",
        });
      }
    }, 500);
  },
  stopExport: () => {
    set({
      isExporting: false,
      exportProgress: 0,
      conversionProgress: 0,
    });
  },
  downloadExportedVideo: () => {
    const { exportedVideoURL, exportFormat } = get();
    if (exportedVideoURL) {
      console.log(
        "Downloading video URL:",
        exportedVideoURL,
        "as format:",
        exportFormat,
      );
    }
  },
}));

export default useEditorStore;
