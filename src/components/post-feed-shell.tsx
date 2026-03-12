"use client";

import { Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useSessionStore } from "@/store/useSessionStore";

export function PostFeedShell() {
  const username = useSessionStore((state) => state.username);
  const setUsername = useSessionStore((state) => state.setUsername);

  return (
    <Box sx={{ minHeight: "100dvh", py: 6, backgroundColor: "background.default" }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ border: "1px solid #999999", overflow: "hidden" }}>
          <Box sx={{ px: 3, py: 2, backgroundColor: "primary.main", color: "primary.contrastText" }}>
            <Typography variant="h1">CodeLeap Network</Typography>
          </Box>

          <Stack spacing={2.5} sx={{ p: 3 }}>
            <Typography variant="h2">Bem-vindo(a), este e o scaffold inicial.</Typography>

            <TextField
              label="Seu usuario"
              placeholder="John doe"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              fullWidth
            />

            <Button variant="contained" disabled={!username.trim()} sx={{ alignSelf: "flex-end" }}>
              Entrar
            </Button>

            <Typography variant="body2" color="text.secondary">
              Proximas etapas: implementar CRUD de posts, acoes de editar/deletar e bonus points.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
