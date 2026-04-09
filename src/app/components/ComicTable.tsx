"use client";

import {
  Box,
  Checkbox,
  CircularProgress,
  Pagination,
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
import { useState } from "react";
import { Comic } from "../type";

type Props = {
  comics: Comic[];
};

export default function ComicTable({ comics }: Props) {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentComics = comics.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (!comics.length)
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
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
              <ComicRow key={comic.id} comic={comic} index={index}></ComicRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(comics.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={(_, value) => setPage(value)}
        />
      </Box>
    </>
  );
}

function ComicRow({ comic, index }: { comic: Comic; index: number }) {
  const [isPurchased, setIsPurchased] = useState(comic.isPurchased);
  const handleCheck = async () => {
    const newValue = !isPurchased;
    setIsPurchased(newValue);

    await fetch("/api/notion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: comic.id,
        title: comic.title,
        isPurchased: newValue,
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
        {comic.thumbnail ? (
          <Image
            src={comic.thumbnail}
            alt={comic.title}
            width={50}
            height={75}
          />
        ) : (
          <Typography variant="body2" textAlign="center">
            なし
          </Typography>
        )}
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
        <Checkbox checked={isPurchased} onChange={handleCheck} />
      </TableCell>
    </TableRow>
  );
}
