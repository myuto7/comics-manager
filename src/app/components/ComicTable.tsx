"use client";

import {
  Box,
  Checkbox,
  CircularProgress,
  Pagination,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Comic } from "../type";

type Props = {
  comics: Comic[];
};

export default function ComicTable({ comics }: Props) {
  const [tab, setTab] = useState<0 | 1>(0);
  const [page, setPage] = useState(1);
  const [localComics, setLocalComics] = useState<Comic[]>(comics);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setLocalComics(comics);
  }, [comics]);

  const handleToggle = (id: string) => {
    setLocalComics((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPurchased: !c.isPurchased } : c))
    );
  };

  const filteredComics = localComics.filter((c) =>
    tab === 0 ? !c.isPurchased : c.isPurchased
  );
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentComics = filteredComics.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: 0 | 1) => {
    setTab(newValue);
    setPage(1);
  };

  if (!comics.length)
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 1 }}
        aria-label="購入状況タブ"
      >
        <Tab label="未購入" />
        <Tab label="購入済" />
      </Tabs>
      <TableContainer component={Paper} elevation={2}>
        <Table aria-label="simple table" size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", px: 1 }}>
                表紙
              </TableCell>
              <TableCell
                sx={{ color: "#fff", fontWeight: "bold", width: "50%", px: 1 }}
              >
                タイトル
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  px: 1,
                  whiteSpace: "nowrap",
                }}
              >
                入力者
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", px: 1 }}>
                購入
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentComics.map((comic, index) => (
              <ComicRow key={comic.id} comic={comic} index={index} onToggle={handleToggle} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(filteredComics.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={(_, value) => setPage(value)}
        />
      </Box>
    </>
  );
}

function ComicRow({
  comic,
  index,
  onToggle,
}: {
  comic: Comic;
  index: number;
  onToggle: (id: string) => void;
}) {
  const handleCheck = async () => {
    onToggle(comic.id);

    await fetch("/api/notion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: comic.id,
        title: comic.title,
        isPurchased: !comic.isPurchased,
      }),
    });
  };

  return (
    <TableRow
      key={comic.id}
      hover
      sx={{
        bgcolor: index % 2 === 0 ? "background.paper" : "#F8FAFC",
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      <TableCell sx={{ px: 1 }}>
        <Image
          src={comic.thumbnail || "/no-image.svg"}
          alt={comic.title}
          width={50}
          height={75}
        />
      </TableCell>
      <TableCell component="th" scope="row" sx={{ px: 1 }}>
        <Link href={`/comics/${comic.id}`} style={{ textDecoration: "none" }}>
          <Typography color="primary" fontWeight={500}>
            {comic.title}
          </Typography>
        </Link>
      </TableCell>
      <TableCell sx={{ px: 1, whiteSpace: "nowrap" }}>
        <Typography variant="body2" color="text.secondary">
          {comic.creator || "—"}
        </Typography>
      </TableCell>
      <TableCell sx={{ px: 1 }}>
        <Checkbox checked={comic.isPurchased} onChange={handleCheck} />
      </TableCell>
    </TableRow>
  );
}
