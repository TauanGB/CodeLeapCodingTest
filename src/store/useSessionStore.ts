import { create } from "zustand";

type SessionState = {
  username: string;
  setUsername: (username: string) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  username: "",
  setUsername: (username) => set({ username }),
  clearSession: () => set({ username: "" }),
}));
