import { notFound } from "next/navigation";
import { Comic } from "@/app/type";
import { Box } from "@mui/material";
import DeleteButton from "./DeleteButton";
import { getComicById } from "@/lib/notion";
import { getMangaDescription } from "@/lib/mangadex";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ComicDetailPage({ params }: Props) {
  const { id } = await params;
  const comic = await getComicById(id);
  if (!comic) notFound();

  let description = null;
  if (comic.mangadexUuid) {
    description = await getMangaDescription(comic.mangadexUuid);
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{comic.title}</h1>
      {comic.thumbnail && (
        <Box textAlign="center">
          <img src={comic.thumbnail} alt={comic.title} width={200} />
        </Box>
      )}
      {description && (
        <>
          <h2>あらすじ</h2>
          <p>{description}</p>
        </>
      )}
      <a
        href={`https://piccoma.com/web/search/result?word=${comic.title}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        ピッコマで見る →
      </a>
      <p>購入済み: {comic.isPurchased ? "✅" : "❌"}</p>
      <DeleteButton id={comic.id} title={comic.title} />
    </main>
  );
}
