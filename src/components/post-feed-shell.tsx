"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import {
  useCreatePostMutation,
  useDeletePostMutation,
  usePostsQuery,
  useUpdatePostMutation,
} from "@/features/posts/hooks";
import type { Post } from "@/features/posts/types";
import { DeletePostIcon, EditPostIcon } from "@/components/icons/action-icons";
import { useSessionStore } from "@/store/useSessionStore";

function getRelativeTimeLabel(dateIso: string): string {
  const inputDate = new Date(dateIso);
  const diffMs = inputDate.getTime() - Date.now();
  const absMinutes = Math.round(Math.abs(diffMs) / 60_000);

  if (absMinutes < 60) {
    const minutes = Math.max(1, absMinutes);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) {
    return `${absHours} hour${absHours > 1 ? "s" : ""} ago`;
  }

  const absDays = Math.round(absHours / 24);
  return `${absDays} day${absDays > 1 ? "s" : ""} ago`;
}

function LoginScreen() {
  const setUsername = useSessionStore((state) => state.setUsername);
  const [draftUsername, setDraftUsername] = useState("");
  const isDisabled = !draftUsername.trim();

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: "background.default", display: "grid", placeItems: "center" }}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 500,
          border: "1px solid #cccccc",
          borderRadius: 2,
          p: 3,
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="h2">Welcome to CodeLeap network!</Typography>
          <Typography variant="body2">Please enter your username</Typography>
          <TextField
            placeholder="John doe"
            fullWidth
            value={draftUsername}
            onChange={(event) => setDraftUsername(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isDisabled) {
                setUsername(draftUsername.trim());
              }
            }}
          />
          <Button
            variant="contained"
            disabled={isDisabled}
            sx={{ alignSelf: "flex-end", minWidth: 110 }}
            onClick={() => setUsername(draftUsername.trim())}
          >
            Enter
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export function PostFeedShell() {
  const username = useSessionStore((state) => state.username);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [editTarget, setEditTarget] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const postsQuery = usePostsQuery();
  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation();
  const deletePostMutation = useDeletePostMutation();

  const sortedPosts = useMemo(
    () =>
      [...(postsQuery.data?.results ?? [])].sort(
        (a, b) => new Date(b.created_datetime).getTime() - new Date(a.created_datetime).getTime(),
      ),
    [postsQuery.data?.results],
  );

  if (!username.trim()) {
    return <LoginScreen />;
  }

  const isCreateDisabled = !title.trim() || !content.trim() || createPostMutation.isPending;
  const isSaveEditDisabled = !editTitle.trim() || !editContent.trim() || updatePostMutation.isPending;

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: "background.default" }}>
      <Container
        maxWidth={false}
        sx={{ width: "100%", maxWidth: 800, minHeight: "100dvh", px: { xs: 0, sm: 0 } }}
      >
        <Paper elevation={0} sx={{ minHeight: "100dvh", borderRadius: 0, border: "none", overflow: "hidden" }}>
          <Box sx={{ px: 3, py: 2, backgroundColor: "primary.main", color: "primary.contrastText" }}>
            <Typography sx={{ color: "inherit", fontSize: "1.375rem", fontWeight: 700 }}>CodeLeap Network</Typography>
          </Box>

          <Box sx={{ p: 2.5, backgroundColor: "background.paper" }}>
            <Paper elevation={0} sx={{ border: "1px solid #999999", borderRadius: 2, p: 2.5, mb: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h2">What&apos;s on your mind?</Typography>
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Title
                  </Typography>
                  <TextField placeholder="Hello world" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Content
                  </Typography>
                <TextField
                  placeholder="Content here"
                  multiline
                  minRows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  fullWidth
                />
                </Box>
                <Button
                  variant="contained"
                  disabled={isCreateDisabled}
                  sx={{ alignSelf: "flex-end", minWidth: 120 }}
                  onClick={async () => {
                    await createPostMutation.mutateAsync({ username, title: title.trim(), content: content.trim() });
                    setTitle("");
                    setContent("");
                  }}
                >
                  Create
                </Button>
              </Stack>
            </Paper>

            <Stack spacing={3}>
              {postsQuery.isLoading && (
                <Paper elevation={0} sx={{ border: "1px solid #999999", borderRadius: 2, p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CircularProgress size={18} />
                    <Typography>Loading posts...</Typography>
                  </Stack>
                </Paper>
              )}

              {postsQuery.isError && (
                <Alert severity="error">
                  Nao foi possivel carregar os posts agora. Tente novamente em instantes.
                </Alert>
              )}

              {!postsQuery.isLoading &&
                !postsQuery.isError &&
                sortedPosts.map((post) => {
                  const isOwner = post.username === username;
                  return (
                    <Paper key={post.id} elevation={0} sx={{ border: "1px solid #999999", borderRadius: 2, overflow: "hidden" }}>
                      <Box
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          backgroundColor: "primary.main",
                          color: "primary.contrastText",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1.5,
                        }}
                      >
                        <Typography variant="h2" sx={{ color: "inherit", overflowWrap: "anywhere" }}>
                          {post.title}
                        </Typography>
                        {isOwner && (
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => setDeleteTarget(post)}
                              sx={{
                                color: "inherit",
                                width: { xs: 28, sm: 31.2 },
                                height: { xs: 28, sm: 31.2 },
                              }}
                            >
                              <DeletePostIcon sx={{ fontSize: { xs: 24, sm: 31.2 } }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditTarget(post);
                                setEditTitle(post.title);
                                setEditContent(post.content);
                              }}
                              sx={{
                                color: "inherit",
                                width: { xs: 28, sm: 31.2 },
                                height: { xs: 28, sm: 31.2 },
                              }}
                            >
                              <EditPostIcon sx={{ fontSize: { xs: 24, sm: 31.2 } }} />
                            </IconButton>
                          </Stack>
                        )}
                      </Box>

                      <Stack spacing={1.5} sx={{ p: 2.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, color: "text.secondary" }}>
                          <Typography variant="body2">@{post.username}</Typography>
                          <Typography variant="body2">{getRelativeTimeLabel(post.created_datetime)}</Typography>
                        </Box>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                          {post.content}
                        </Typography>
                      </Stack>
                    </Paper>
                  );
                })}
            </Stack>
          </Box>
        </Paper>
      </Container>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Are you sure you want to delete this item?</DialogTitle>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            sx={{ minWidth: 110, borderColor: "#999999", color: "text.primary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ minWidth: 110 }}
            onClick={async () => {
              if (!deleteTarget) return;
              await deletePostMutation.mutateAsync(deleteTarget.id);
              setDeleteTarget(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editTarget)} onClose={() => setEditTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Edit item</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Stack spacing={1.5}>
            <TextField label="Title" placeholder="Hello world" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <TextField
              label="Content"
              placeholder="Content here"
              multiline
              minRows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setEditTarget(null)}
            sx={{ minWidth: 110, borderColor: "#999999", color: "text.primary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={isSaveEditDisabled}
            sx={{ minWidth: 110 }}
            onClick={async () => {
              if (!editTarget) return;
              await updatePostMutation.mutateAsync({
                postId: editTarget.id,
                payload: { title: editTitle.trim(), content: editContent.trim() },
              });
              setEditTarget(null);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
