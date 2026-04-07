"use client";

import { Button, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  title: string;
};

export default function DeleteButton({ id, title }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`「${title}」を削除しますか?`)) return;

    await fetch("/api/notion", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    router.push("/");
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24 }}>
      <Button
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={handleDelete}
      >
        削除
      </Button>
    </Box>
  );
}
