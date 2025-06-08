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
  exportError: string | null;
  setExportError: (error: string | null) => void;

  startExport: () => void;
  stopExport: () => void;
  downloadExportedVideo: () => void;
  resetExport: () => void;
}

interface Background {
  id: string;
  name: string;
  color: string;
  gradient?: string;
  type: "solid" | "gradient";
}

export type { IEditorState, Background };
