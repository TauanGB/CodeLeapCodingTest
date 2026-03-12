import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

export type PostComment = {
  id: string;
  username: string;
  content: string;
  createdAt: string;
};

type BonusState = {
  bonusEnabled: boolean;
  themeMode: ThemeMode;
  likesByPost: Record<number, string[]>;
  commentsByPost: Record<number, PostComment[]>;
  setBonusEnabled: (enabled: boolean) => void;
  toggleThemeMode: () => void;
  toggleLike: (postId: number, username: string) => void;
  addComment: (postId: number, username: string, content: string) => void;
};

export const useBonusStore = create<BonusState>()(
  persist(
    (set) => ({
      bonusEnabled: false,
      themeMode: "light",
      likesByPost: {},
      commentsByPost: {},
      setBonusEnabled: (enabled) => set({ bonusEnabled: enabled }),
      toggleThemeMode: () =>
        set((state) => ({
          themeMode: state.themeMode === "light" ? "dark" : "light",
        })),
      toggleLike: (postId, username) =>
        set((state) => {
          const currentLikes = state.likesByPost[postId] ?? [];
          const alreadyLiked = currentLikes.includes(username);
          const nextLikes = alreadyLiked
            ? currentLikes.filter((value) => value !== username)
            : [...currentLikes, username];

          return {
            likesByPost: {
              ...state.likesByPost,
              [postId]: nextLikes,
            },
          };
        }),
      addComment: (postId, username, content) =>
        set((state) => {
          const currentComments = state.commentsByPost[postId] ?? [];
          const newComment: PostComment = {
            id: crypto.randomUUID(),
            username,
            content,
            createdAt: new Date().toISOString(),
          };

          return {
            commentsByPost: {
              ...state.commentsByPost,
              [postId]: [...currentComments, newComment],
            },
          };
        }),
    }),
    {
      name: "codeleap-bonus",
    },
  ),
);
