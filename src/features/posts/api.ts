import { http } from "@/lib/http";
import type { CreatePostInput, PostsResponse, UpdatePostInput } from "./types";

export const postsKeys = {
  all: ["posts"] as const,
  list: () => [...postsKeys.all, "list"] as const,
};

export async function getPosts() {
  return http<PostsResponse>("", {
    method: "GET",
    cache: "no-store",
  });
}

export async function createPost(payload: CreatePostInput) {
  return http<unknown>("", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePost(postId: number, payload: UpdatePostInput) {
  return http<unknown>(`${postId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deletePost(postId: number) {
  return http<void>(`${postId}/`, {
    method: "DELETE",
  });
}
