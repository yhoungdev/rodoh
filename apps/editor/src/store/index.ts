import { create } from "zustand";
import useEditorStore from "./editor.store";

interface EditorSettings {
  zoomPan?: {
    autoZoom: boolean;
    scale: number;
    duration: number;
    holdTime: number;
    easing: string;
  };
  background?: string;
}

interface StoreState {
  editorSettings: EditorSettings;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
}

export const useStore = create<StoreState>((set) => ({
  editorSettings: {
    zoomPan: {
      autoZoom: true,
      scale: 2.0,
      duration: 1000,
      holdTime: 1500,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    background: "bg-gray-200",
  },
  updateEditorSettings: (settings) =>
    set((state) => ({
      editorSettings: {
        ...state.editorSettings,
        ...settings,
      },
    })),
}));

export { useEditorStore };
