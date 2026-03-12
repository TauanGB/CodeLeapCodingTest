export type Post = {
  id: number;
  username: string;
  created_datetime: string;
  title: string;
  content: string;
};

export type CreatePostInput = {
  username: string;
  title: string;
  content: string;
};

export type UpdatePostInput = {
  title: string;
  content: string;
};

export type PostsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
};
