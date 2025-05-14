import { create } from "zustand";

interface VideoState {
  videoUrl: string | null;
  setVideoUrl: (url: string) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videoUrl: null,
  setVideoUrl: (url) => set({ videoUrl: url }),
}));
