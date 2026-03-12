"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { type ReactNode, useMemo, useState } from "react";
import {
  useCreatePostMutation,
  useDeletePostMutation,
  usePostsQuery,
  useUpdatePostMutation,
} from "@/features/posts/hooks";
import type { Post } from "@/features/posts/types";
import { DeletePostIcon, EditPostIcon } from "@/components/icons/action-icons";
import { useBonusStore } from "@/store/useBonusStore";
import { useSessionStore } from "@/store/useSessionStore";

type SortOption = "newest" | "oldest" | "most-liked";
type FilterOption = "all" | "mine" | "mentioned";

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

function hasMentionForUser(text: string, username: string): boolean {
  if (!username.trim()) return false;
  return text.toLowerCase().includes(`@${username.toLowerCase()}`);
}

function renderMentions(text: string, enabled: boolean): ReactNode {
  if (!enabled) {
    return text;
  }

  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      return (
        <Box
          key={`${part}-${index}`}
          component="span"
          sx={{ color: "primary.main", fontWeight: 700 }}
        >
          {part}
        </Box>
      );
    }
    return <Box key={`${part}-${index}`} component="span">{part}</Box>;
  });
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
  const bonusEnabled = useBonusStore((state) => state.bonusEnabled);
  const setBonusEnabled = useBonusStore((state) => state.setBonusEnabled);
  const themeMode = useBonusStore((state) => state.themeMode);
  const toggleThemeMode = useBonusStore((state) => state.toggleThemeMode);
  const likesByPost = useBonusStore((state) => state.likesByPost);
  const toggleLike = useBonusStore((state) => state.toggleLike);
  const commentsByPost = useBonusStore((state) => state.commentsByPost);
  const addComment = useBonusStore((state) => state.addComment);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [editTarget, setEditTarget] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [extrasInfoOpen, setExtrasInfoOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [commentDraftByPost, setCommentDraftByPost] = useState<Record<number, string>>({});

  const postsQuery = usePostsQuery();
  const createPostMutation = useCreatePostMutation();
  const updatePostMutation = useUpdatePostMutation();
  const deletePostMutation = useDeletePostMutation();

  const visiblePosts = useMemo(() => {
    const posts = [...(postsQuery.data?.results ?? [])];

    const filtered = posts.filter((post) => {
      if (!bonusEnabled || filterBy === "all") {
        return true;
      }

      if (filterBy === "mine") {
        return post.username === username;
      }

      const postTextHasMention = hasMentionForUser(`${post.title} ${post.content}`, username);
      const comments = commentsByPost[post.id] ?? [];
      const commentHasMention = comments.some((comment) => hasMentionForUser(comment.content, username));

      return postTextHasMention || commentHasMention;
    });

    return filtered.sort((a, b) => {
      if (!bonusEnabled || sortBy === "newest") {
        return new Date(b.created_datetime).getTime() - new Date(a.created_datetime).getTime();
      }

      if (sortBy === "oldest") {
        return new Date(a.created_datetime).getTime() - new Date(b.created_datetime).getTime();
      }

      const likesA = likesByPost[a.id]?.length ?? 0;
      const likesB = likesByPost[b.id]?.length ?? 0;
      if (likesA !== likesB) {
        return likesB - likesA;
      }

      return new Date(b.created_datetime).getTime() - new Date(a.created_datetime).getTime();
    });
  }, [postsQuery.data?.results, bonusEnabled, filterBy, sortBy, username, commentsByPost, likesByPost]);

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
          <Box
            sx={{
              px: 3,
              py: 2,
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography sx={{ color: "inherit", fontSize: "1.375rem", fontWeight: 700 }}>
              CodeLeap Network
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {bonusEnabled && (
                <IconButton
                  aria-label="Toggle color mode"
                  onClick={toggleThemeMode}
                  sx={{ color: "inherit" }}
                >
                  {themeMode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                </IconButton>
              )}
              <IconButton
                aria-label="Open bonus features info"
                onClick={() => setExtrasInfoOpen(true)}
                sx={{ color: "inherit" }}
              >
                <AutoAwesomeOutlinedIcon />
              </IconButton>
            </Stack>
          </Box>

          <Box sx={{ p: 2.5, backgroundColor: "background.paper" }}>
            <Paper elevation={0} sx={{ border: "1px solid #999999", borderRadius: "16px", p: 2.5, mb: 3 }}>
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

            {bonusEnabled && (
              <Paper elevation={0} sx={{ border: "1px solid #999999", borderRadius: "16px", p: 2, mb: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="sort-by-label">Sort by</InputLabel>
                    <Select
                      labelId="sort-by-label"
                      value={sortBy}
                      label="Sort by"
                      onChange={(event) => setSortBy(event.target.value as SortOption)}
                    >
                      <MenuItem value="newest">Newest first</MenuItem>
                      <MenuItem value="oldest">Oldest first</MenuItem>
                      <MenuItem value="most-liked">Most liked</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="filter-by-label">Filter</InputLabel>
                    <Select
                      labelId="filter-by-label"
                      value={filterBy}
                      label="Filter"
                      onChange={(event) => setFilterBy(event.target.value as FilterOption)}
                    >
                      <MenuItem value="all">All posts</MenuItem>
                      <MenuItem value="mine">My posts</MenuItem>
                      <MenuItem value="mentioned">Posts/comments mentioning me</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>
            )}

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
                visiblePosts.map((post) => {
                  const isOwner = post.username === username;
                  const postLikes = likesByPost[post.id] ?? [];
                  const likedByMe = postLikes.includes(username);
                  const postComments = commentsByPost[post.id] ?? [];
                  const commentDraft = commentDraftByPost[post.id] ?? "";
                  const isCommentDisabled = !commentDraft.trim();

                  return (
                    <Paper
                      key={post.id}
                      elevation={0}
                      sx={{
                        border: "1px solid #999999",
                        borderRadius: "16px",
                        overflow: "hidden",
                        transition: bonusEnabled
                          ? "transform 220ms ease, box-shadow 220ms ease"
                          : undefined,
                        "&:hover": bonusEnabled
                          ? { transform: "translateY(-2px)", boxShadow: 4 }
                          : undefined,
                      }}
                    >
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
                          <Stack direction="row" spacing={2.9}>
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
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "18px" }}>
                            @{post.username}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 400, fontSize: "18px" }}>
                            {getRelativeTimeLabel(post.created_datetime)}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                          {renderMentions(post.content, bonusEnabled)}
                        </Typography>

                        {bonusEnabled && (
                          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => toggleLike(post.id, username)}
                                sx={{
                                  color: likedByMe ? "#ff5151" : "text.secondary",
                                  transition: "transform 160ms ease",
                                  "&:hover": { transform: "scale(1.08)" },
                                }}
                              >
                                {likedByMe ? <FavoriteRoundedIcon fontSize="small" /> : <FavoriteBorderOutlinedIcon fontSize="small" />}
                              </IconButton>
                              <Typography variant="body2" color="text.secondary">
                                {postLikes.length} like{postLikes.length !== 1 ? "s" : ""}
                              </Typography>
                            </Stack>

                            {postComments.length > 0 && (
                              <Stack spacing={1}>
                                {postComments.map((comment) => (
                                  <Box
                                    key={comment.id}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 1.5,
                                      px: 1.25,
                                      py: 1,
                                      backgroundColor: "action.hover",
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                      @{comment.username}
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                                      {renderMentions(comment.content, bonusEnabled)}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            )}

                            <Stack spacing={0.75}>
                              <FormLabel sx={{ color: "text.primary", fontSize: "0.875rem" }}>Comment</FormLabel>
                              <TextField
                                placeholder="Write a comment (you can mention users with @username)"
                                value={commentDraft}
                                onChange={(event) =>
                                  setCommentDraftByPost((prev) => ({
                                    ...prev,
                                    [post.id]: event.target.value,
                                  }))
                                }
                                fullWidth
                              />
                              <Button
                                variant="outlined"
                                disabled={isCommentDisabled}
                                sx={{ alignSelf: "flex-end" }}
                                onClick={() => {
                                  addComment(post.id, username, commentDraft.trim());
                                  setCommentDraftByPost((prev) => ({
                                    ...prev,
                                    [post.id]: "",
                                  }));
                                }}
                              >
                                Add comment
                              </Button>
                            </Stack>
                          </Stack>
                        )}
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
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Title
              </Typography>
              <TextField
                placeholder="Hello world"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                fullWidth
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Content
              </Typography>
              <TextField
                placeholder="Content here"
                multiline
                minRows={3}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                fullWidth
              />
            </Box>
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

      <Dialog open={extrasInfoOpen} onClose={() => setExtrasInfoOpen(false)} fullWidth maxWidth="sm">
        <DialogContent sx={{ pt: "20px !important", pb: 1 }}>
          <Typography>
            Now that you have experienced the requested version, check out the version with the
            suggested bonus features and a little more.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setExtrasInfoOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setBonusEnabled(true);
              setExtrasInfoOpen(false);
            }}
          >
            Start
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
