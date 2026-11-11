import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerState {
  playerId: string | null;
  nickname: string;
  avatar: string;
  xp: number;
  level: number;
  stars: number;
  setPlayerId: (id: string) => void;
  setNickname: (n: string) => void;
  setAvatar: (avatar: string) => void;
  addXp: (n: number) => void;
  resetProgress: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      playerId: null,
      nickname: "Pahlawan Budaya",
      avatar: "👧",
      xp: 0,
      level: 1,
      stars: 0,
      setPlayerId: (id) => set({ playerId: id }),
      setNickname: (n) => set({ nickname: n }),
      setAvatar: (avatar) => set({ avatar }),
      addXp: (n) =>
        set((s) => {
          const xp = s.xp + n;
          return { xp, level: Math.floor(xp / 100) + 1 };
        }),
      resetProgress: () => set({ playerId: null, xp: 0, level: 1, stars: 0 }),
    }),
    { name: "bti-player" }
  )
);
