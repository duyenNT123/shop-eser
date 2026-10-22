import type { Metadata } from "next";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Eser Flowers & Gifts — Những điều đẹp đẽ luôn tìm cách để ở lại",
    template: "%s | Eser Flowers & Gifts",
  },
  description:
    "Eser tạo nên những bó hoa nghệ thuật từ hoa sáp và hoa lụa — dành cho những khoảnh khắc muốn được lưu giữ lâu hơn.",
  applicationName: "Eser Flowers & Gifts",
  openGraph: {
    title: "Eser Flowers & Gifts",
    description: "Những khoảnh khắc đẹp đẽ luôn tìm cách để ở lại.",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
