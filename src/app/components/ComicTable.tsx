"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Comic } from "../type";
import { Checkbox } from "@mui/material";

type Props = {
  comics: Comic[];
};

export default function ComicTable({ comics }: Props) {
  if (!comics.length) return <div>Loading...</div>;

  return (
    <TableContainer component={Paper} sx={{ maxWidth: "100vw" }}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>タイトル</TableCell>
            <TableCell>入力者</TableCell>
            <TableCell>購入チェック</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {comics.map((comic) => (
            <TableRow
              key={comic.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {comic.title}
              </TableCell>
              <TableCell>{comic.creator}</TableCell>
              <TableCell>
                <Checkbox checked={comic.isPurchased} disabled />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
