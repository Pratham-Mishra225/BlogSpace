import { create } from "zustand";

export type FeedMode = "explore" | "following";

interface FeedState {
  mode: FeedMode;
  setMode: (m: FeedMode) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  mode: "explore",
  setMode: (mode) => set({ mode }),
}));
