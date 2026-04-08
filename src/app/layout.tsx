import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeRegistry } from "./components/ThemeRegistry";

export const metadata: Metadata = {
  title: "comics manager",
  description: "個人用漫画管理アプリ",
  openGraph: {
    title: "漫画購入管理",
    description: "個人用漫画管理アプリ",
    url: "https://comics-manager.vercel.app",
    siteName: "漫画購入管理",
    images: [
      {
        url: "https://comics-manager.vercel.app/og.PNG",
        width: 1200,
        height: 630,
        alt: "漫画購入管理",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>{children}</ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
