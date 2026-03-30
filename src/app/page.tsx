"use client";

import { Box, Container, Typography, AppBar, Toolbar } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ComicTable from "./components/ComicTable";
import { RegisterModal } from "./components/RegisterModal";
import { useState, useEffect } from "react";
import { Comic } from "./type";

export default function Home() {
  const [comics, setComics] = useState<Comic[]>([]);

  const fetchComics = async () => {
    const res = await fetch("/api/notion");
    const data = await res.json();
    setComics(data);
  };

  useEffect(() => {
    fetchComics();
  }, []);

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: "linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%)",
      }}
    >
      <AppBar position="static" elevation={0} sx={{ bgcolor: "primary.main" }}>
        <Toolbar>
          <MenuBookIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" fontWeight="bold">
            マンガ購入管理
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box py={5}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              リスト
            </Typography>
            <RegisterModal onRegisterSuccess={fetchComics} />
          </Box>
          <ComicTable comics={comics} />
        </Box>
      </Container>
    </Box>
  );
}
