import { Comic } from "@/app/type";
import { render, screen } from "@testing-library/react";
import ComicTable from "../ComicTable";

// next/image はテスト環境では動作しないためシンプルな img に置き換える
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={""} />,
}));

const mockComics: Comic[] = [
  {
    id: "1",
    title: "進撃の巨人",
    creator: "諫山創",
    isPurchased: true,
    mangadexUuid: "uuid-001",
    thumbnail: "https://example.com/cover1.jpg",
  },
  {
    id: "2",
    title: "鬼滅の刃",
    creator: "吾峠呼世晴",
    isPurchased: false,
    mangadexUuid: undefined,
    thumbnail: undefined,
  },
];

describe("ComicTable", () => {
  it("コミックのタイトルが表示される", () => {
    render(<ComicTable comics={mockComics} />);
    expect(screen.getByText("進撃の巨人")).toBeInTheDocument();
    expect(screen.getByText("鬼滅の刃")).toBeInTheDocument();
  });

  it("入力者が表示される", () => {
    render(<ComicTable comics={mockComics} />);
    expect(screen.getByText("諫山創")).toBeInTheDocument();
    expect(screen.getByText("吾峠呼世晴")).toBeInTheDocument();
  });

  it("空配列を渡した場合はローディング（CircularProgress）が表示される", () => {
    const { container } = render(<ComicTable comics={[]} />);
    // MUIのCircularProgressはrole="progressbar"を持つ
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  it("サムネイルがない場合は「なし」が表示される", () => {
    render(<ComicTable comics={mockComics} />);
    expect(screen.getByText("なし")).toBeInTheDocument();
  });
});
