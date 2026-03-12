"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPost, deletePost, getPosts, postsKeys, updatePost } from "./api";
import type { CreatePostInput, UpdatePostInput } from "./types";

export function usePostsQuery() {
  return useQuery({
    queryKey: postsKeys.list(),
    queryFn: getPosts,
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostInput) => createPost(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsKeys.all });
    },
  });
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, payload }: { postId: number; payload: UpdatePostInput }) =>
      updatePost(postId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsKeys.all });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsKeys.all });
    },
  });
}
