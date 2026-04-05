"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Box,
  Checkbox,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";
import { Comic } from "../type";
import Image from "next/image";
import { useState } from "react";

type Props = {
  comics: Comic[];
};

export default function ComicTable({ comics }: Props) {
  if (!comics.length)
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );

  return (
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
          {comics.map((comic, index) => (
            <ComicRow key={comic.id} comic={comic} index={index}></ComicRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
      body: JSON.stringify({ id: comic.id, isPurchased: newValue }),
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
        <Link
          href={`https://piccoma.com/web/search/result?word=${comic.title}`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="primary"
          fontWeight={500}
        >
          {comic.title}
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
