import { create } from 'zustand'

export const useStore = create((set) => ({
  videoUrl: null,

  updateVideoUrl: (url: string) => set({ videoUrl: url }),
}))

