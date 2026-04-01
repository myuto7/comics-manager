export type Comic = {
  id: string;
  title: string;
  creator: string;
  isPurchased: boolean;
  mangadexUuid?: string;
  thumbnail?: string;
};

export type FormValues = {
  title: string;
  creator: string;
  mangadexUuid: string;
  thumbnail: string;
};

export type BookSearchResult = {
  title: string;
  authors: string[];
  mangadexUuid: string;
  thumbnail?: string;
};
