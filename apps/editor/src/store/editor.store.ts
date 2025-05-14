import { create } from "zustand";

interface IEditorState {
  editorBg: string;
  updateEditorBg: (data: string) => void;
  allowAudio: boolean;
  allowZoom: boolean;
  updateMediaOptions: () => void;
}

const useEditorStore = create<IEditorState>((set) => ({
  editorBg: "bg-gray-200",
  allowAudio: true,
  allowZoom: false,
  updateEditorBg: (data: string) => set({ editorBg: data }),
  updateMediaOptions: () =>
    set({
      allowZoom: true,
      allowAudio: true,
    }),
}));

export default useEditorStore;
