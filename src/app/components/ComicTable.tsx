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
import { useBookCover } from "../hooks/useBookCover";

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
      <Table aria-label="simple table">
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
              表紙
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold", width: "50%" }}>
              タイトル
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
              入力者
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
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
  const { thumbnail, loading } = useBookCover(comic.title, comic.isbn);

  return (
    <TableRow
      key={comic.id}
      hover
      sx={{
        bgcolor: index % 2 === 0 ? "background.paper" : "#F8FAFC",
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      <TableCell>
        {loading ? (
          <CircularProgress size={24} />
        ) : thumbnail ? (
          <img src={thumbnail} alt={comic.title} width={50} />
        ) : (
          <span>なし</span>
        )}
      </TableCell>
      <TableCell component="th" scope="row">
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
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {comic.creator || "—"}
        </Typography>
      </TableCell>
      <TableCell>
        <Checkbox checked={comic.isPurchased} disabled />
      </TableCell>
    </TableRow>
  );
}
