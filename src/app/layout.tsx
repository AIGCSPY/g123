import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI工具导航 - 人工智能工具大全,AI导航网站",
  description: "AI工具导航，精选最新最全的人工智能工具，包括AI写作、AI绘画、AI编程、AI视频等AI工具，助力提升工作效率",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-center"
          expand={true}
          richColors
          theme="dark"
          toastOptions={{
            duration: 2000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
      </body>
    </html>
  );
}
