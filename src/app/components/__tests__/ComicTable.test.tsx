import { Comic } from "@/app/type";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  it("デフォルトでは「未購入」タブが選択され、未購入の漫画のみ表示される", () => {
    render(<ComicTable comics={mockComics} />);
    expect(screen.getByText("鬼滅の刃")).toBeInTheDocument();
    expect(screen.queryByText("進撃の巨人")).not.toBeInTheDocument();
  });

  it("「購入済」タブを選択すると購入済みの漫画のみ表示される", () => {
    render(<ComicTable comics={mockComics} />);
    fireEvent.click(screen.getByRole("tab", { name: "購入済" }));
    expect(screen.getByText("進撃の巨人")).toBeInTheDocument();
    expect(screen.queryByText("鬼滅の刃")).not.toBeInTheDocument();
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

  it("チェックボックスをクリックすると漫画がタブ間を移動する", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    render(<ComicTable comics={mockComics} />);

    // 未購入タブで「鬼滅の刃」が表示されている
    expect(screen.getByText("鬼滅の刃")).toBeInTheDocument();

    // チェックボックスをクリック（isPurchasedをtrueに切り替え）
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // 「鬼滅の刃」が未購入タブから消える
    await waitFor(() => {
      expect(screen.queryByText("鬼滅の刃")).not.toBeInTheDocument();
    });
  });
});
