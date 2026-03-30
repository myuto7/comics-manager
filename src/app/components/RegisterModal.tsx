"use client";

import {
  Box,
  Button,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { FormValues } from "../type";
import { useForm } from "react-hook-form";

type Props = {
  onRegisterSuccess: () => void;
};

export const RegisterModal = ({ onRegisterSuccess }: Props) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("/api/notion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("登録成功");
        reset();
        handleClose();
        onRegisterSuccess();
      } else {
        alert("登録失敗");
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{ boxShadow: 2 }}
      >
        登録する
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
      >
        <Box
          sx={{
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "480px" },
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Typography id="modal-title" variant="h6" fontWeight="bold">
              マンガを登録する
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                label="タイトル"
                {...register("title")}
                fullWidth
                size="small"
              />
              <TextField
                label="入力者（任意）"
                {...register("creator")}
                fullWidth
                size="small"
              />
              <Box display="flex" justifyContent="flex-end" gap={1} pt={1}>
                <Button variant="outlined" onClick={handleClose}>
                  キャンセル
                </Button>
                <Button type="submit" variant="contained">
                  登録
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
