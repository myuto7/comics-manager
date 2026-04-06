import { notFound } from "next/navigation";
import { Comic } from "@/app/type";
import { Box } from "@mui/material";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ComicDetailPage({ params }: Props) {
  const { id } = await params;
  const comicRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/notion/${id}`
  );
  const comic: Comic = await comicRes.json();
  if (!comic) notFound();

  let description = null;
  console.log(comic);
  if (comic.mangadexUuid) {
    const mangaRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/mangadex/${comic.mangadexUuid}`
    );
    const mangaData = await mangaRes.json();
    description = mangaData.description;
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
    </main>
  );
}
