import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "爱酷导航 - 产品经理工具导航,开源自定义标签页,icoolgo",
  description: "爱酷导航，一站式产品经理工具导航，多搜索引擎聚合，常用网站分类展示，支持自定义常用网址收藏",
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
