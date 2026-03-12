import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  username: string;
  setUsername: (username: string) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      username: "",
      setUsername: (username) => set({ username }),
      clearSession: () => set({ username: "" }),
    }),
    {
      name: "codeleap-session",
    },
  ),
);
