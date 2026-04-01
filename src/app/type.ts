export type Comic = {
  id: string;
  title: string;
  creator: string;
  isPurchased: boolean;
  isbn?: string;
};

export type FormValues = {
  title: string;
  creator: string;
  isbn: string;
};

export type BookSearchResult = {
  title: string;
  authors: string[];
  isbn: string;
  thumbnail?: string;
};
