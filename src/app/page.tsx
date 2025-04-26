"use client";

import { Box, Typography } from "@mui/material";
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
    <Box width="100%" py={4}>
      <Typography
        variant="h1"
        gutterBottom
        fontSize={24}
        textAlign="center"
        mb={4}
      >
        マンガ購入管理アプリ
      </Typography>
      <RegisterModal onRegisterSuccess={fetchComics} />
      <ComicTable comics={comics} />
    </Box>
  );
}
