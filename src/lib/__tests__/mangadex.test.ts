import { parseMangaItem } from "../mangadex";

// MangaDex APIレスポンスのモックデータを生成するヘルパー
function buildManga(overrides: {
  id?: string;
  title?: Record<string, string>;
  altTitles?: Record<string, string>[];
  relationships?: object[];
}) {
  return {
    id: overrides.id ?? "test-uuid-001",
    attributes: {
      title: overrides.title ?? {},
      altTitles: overrides.altTitles ?? [],
    },
    relationships: overrides.relationships ?? [],
  };
}

// 著者リレーションのモック
function buildAuthorRel(name: string) {
  return { type: "author", attributes: { name } };
}

// 表紙リレーションのモック
function buildCoverRel(fileName: string) {
  return { type: "cover_art", attributes: { fileName } };
}

describe("parseMangaItem", () => {
  describe("タイトルの解決", () => {
    it("日本語タイトル（ja）が最優先で使われる", () => {
      const manga = buildManga({
        title: { ja: "進撃の巨人", en: "Attack on Titan" },
      });
      const result = parseMangaItem(manga);
      expect(result?.title).toBe("進撃の巨人");
    });

    it("jaがなければja-roを使う", () => {
      const manga = buildManga({
        title: { "ja-ro": "Shingeki no Kyojin", en: "Attack on Titan" },
      });
      const result = parseMangaItem(manga);
      expect(result?.title).toBe("Shingeki no Kyojin");
    });

    it("ja・ja-roがなければaltTitlesのjaを使う", () => {
      const manga = buildManga({
        title: { en: "Attack on Titan" },
        altTitles: [{ ja: "進撃の巨人（別名）" }],
      });
      const result = parseMangaItem(manga);
      expect(result?.title).toBe("進撃の巨人（別名）");
    });

    it("altTitlesにもjaがなければja-roを使う", () => {
      const manga = buildManga({
        title: { en: "Attack on Titan" },
        altTitles: [{ "ja-ro": "Shingeki no Kyojin Alt" }],
      });
      const result = parseMangaItem(manga);
      expect(result?.title).toBe("Shingeki no Kyojin Alt");
    });

    it("日本語系タイトルが一切なければenを使う", () => {
      const manga = buildManga({
        title: { en: "Attack on Titan" },
      });
      const result = parseMangaItem(manga);
      expect(result?.title).toBe("Attack on Titan");
    });

    it("タイトルが取れない場合はnullを返す", () => {
      const manga = buildManga({ title: {} });
      const result = parseMangaItem(manga);
      expect(result).toBeNull();
    });
  });

  describe("著者", () => {
    it("author リレーションから著者名を取得する", () => {
      const manga = buildManga({
        title: { ja: "テストマンガ" },
        relationships: [buildAuthorRel("諫山創")],
      });
      const result = parseMangaItem(manga);
      expect(result?.authors).toEqual(["諫山創"]);
    });

    it("著者が複数いる場合はすべて含まれる", () => {
      const manga = buildManga({
        title: { ja: "テストマンガ" },
        relationships: [buildAuthorRel("著者A"), buildAuthorRel("著者B")],
      });
      const result = parseMangaItem(manga);
      expect(result?.authors).toEqual(["著者A", "著者B"]);
    });

    it("著者リレーションがなければ空配列になる", () => {
      const manga = buildManga({ title: { ja: "テストマンガ" } });
      const result = parseMangaItem(manga);
      expect(result?.authors).toEqual([]);
    });
  });

  describe("サムネイル", () => {
    it("cover_art の fileName からサムネイルURLを生成する", () => {
      const manga = buildManga({
        id: "abc-123",
        title: { ja: "テストマンガ" },
        relationships: [buildCoverRel("cover.jpg")],
      });
      const result = parseMangaItem(manga);
      expect(result?.thumbnail).toBe(
        "https://uploads.mangadex.org/covers/abc-123/cover.jpg.256.jpg"
      );
    });

    it("cover_art がなければ thumbnail は undefined になる", () => {
      const manga = buildManga({ title: { ja: "テストマンガ" } });
      const result = parseMangaItem(manga);
      expect(result?.thumbnail).toBeUndefined();
    });
  });

  describe("mangadexUuid", () => {
    it("manga.id が mangadexUuid にマッピングされる", () => {
      const manga = buildManga({ id: "unique-id-xyz", title: { ja: "タイトル" } });
      const result = parseMangaItem(manga);
      expect(result?.mangadexUuid).toBe("unique-id-xyz");
    });
  });
});
