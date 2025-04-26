"use client";

import { Box, Button, Modal, TextField } from "@mui/material";
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
      <Box textAlign="center" mb={2}>
        <Button variant="contained" onClick={handleOpen}>
          登録する
        </Button>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            textAlign="center"
          >
            <TextField
              label="タイトル"
              {...register("title")}
              fullWidth
              margin="normal"
            />
            <TextField
              label="入力者（任意）"
              {...register("creator")}
              fullWidth
              margin="normal"
            />
            <Box mt={2}>
              <Button type="submit" variant="contained" color="primary">
                登録
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
