import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DP Agent - 智能数据处理平台",
  description: "DP Agent 是一个智能化的数据处理平台，提供高效的数据清洗、转换、分析和可视化功能，帮助您快速构建数据处理工作流。",
  keywords: ["数据处理", "数据清洗", "数据转换", "数据分析", "ETL", "数据可视化", "AI数据处理", "智能数据平台"],
  authors: [{ name: "DP Agent Team" }],
  creator: "DP Agent",
  publisher: "DP Agent",
  robots: "index, follow",
  openGraph: {
    title: "DP Agent - 智能数据处理平台",
    description: "智能化的数据处理平台，提供高效的数据清洗、转换、分析和可视化功能",
    type: "website",
    locale: "zh_CN",
    siteName: "DP Agent",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DP Agent 智能数据处理平台",
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
