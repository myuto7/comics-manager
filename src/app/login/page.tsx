"use client";

import LockIcon from "@mui/icons-material/Lock";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("パスワードが違います");
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%)" }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 360, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <LockIcon color="primary" sx={{ fontSize: 48 }} />
          <Typography variant="h6" fontWeight="bold">
            マンガ購入管理
          </Typography>
          <TextField
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            size="small"
            error={!!error}
            helperText={error}
          />
          <Button variant="contained" fullWidth onClick={handleSubmit}>
            ログイン
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
