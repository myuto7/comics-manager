"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { BookSearchResult, FormValues } from "../type";

type Props = {
  onRegisterSuccess: () => void;
};

export const RegisterModal = ({ onRegisterSuccess }: Props) => {
  const [open, setOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(
    null
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearchOptions([]);
    setSelectedBook(null);
  };

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>();

  const searchBooks = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchOptions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/mangadex?q=${encodeURIComponent(query)}`);
      const data: BookSearchResult[] = await res.json();
      setSearchOptions(data);
    } catch {
      setSearchOptions([]);
    } finally {
      setSearching(false);
    }
  }, []);

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
        setSelectedBook(null);
        setSearchOptions([]);
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

      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
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
              <Autocomplete
                options={searchOptions}
                getOptionLabel={(option) => option.title}
                isOptionEqualToValue={(option, value) =>
                  option.mangadexUuid === value.mangadexUuid
                }
                loading={searching}
                filterOptions={(x) => x}
                value={selectedBook}
                onChange={(_, newValue) => {
                  setSelectedBook(newValue);
                  setValue("title", newValue?.title ?? "");
                  setValue("mangadexUuid", newValue?.mangadexUuid ?? "");
                  setValue("thumbnail", newValue?.thumbnail ?? "");
                }}
                onInputChange={(_, value, reason) => {
                  if (reason === "input") {
                    searchBooks(value);
                  }
                }}
                renderOption={(props, option) => {
                  const { key, ...rest } = props as typeof props & {
                    key: React.Key;
                  };
                  return (
                    <Box
                      key={key}
                      component="li"
                      {...rest}
                      sx={{ gap: 1.5, alignItems: "flex-start !important" }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 50,
                          flexShrink: 0,
                          mt: 0.5,
                          borderRadius: 0.5,
                          overflow: "hidden",
                          bgcolor: "grey.200",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {option.thumbnail ? (
                          <Box
                            component="img"
                            src={option.thumbnail}
                            alt={option.title}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            fontSize={9}
                            textAlign="center"
                            lineHeight={1.2}
                          >
                            No
                            <br />
                            Image
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          lineHeight={1.4}
                        >
                          {option.title}
                        </Typography>
                        {option.authors.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {option.authors.join(", ")}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          display="block"
                        >
                          MangaDex ID: {option.mangadexUuid}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="タイトルで検索"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searching && <CircularProgress size={16} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
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
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!selectedBook}
                >
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
