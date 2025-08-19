'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SearchBox } from '@/components/SearchBox'
import { NavigationGrid } from '@/components/NavigationGrid'
import { CustomNavigation } from '@/components/CustomNavigation'
import { Weather } from '@/components/Weather'
import { Settings } from '@/components/Settings'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { useSettings } from '@/components/SettingsProvider'

interface Link {
  name: string;
  url: string;
  description: string;
}

interface CopyrightLink {
  text: string;
  url: string;
}

interface Copyright {
  text: string;
  links: CopyrightLink[];
  icp: {
    text: string;
    url: string;
  };
}

interface LinksData {
  links: Link[];
  copyright: Copyright;
}

const DynamicSettingsProvider = dynamic(
  () => import('@/components/SettingsProvider').then(mod => mod.SettingsProvider),
  { ssr: false }
);

function HomeContent({ linksData }: { linksData: LinksData }) {
  const { settings, updateSettings } = useSettings();
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  // const [linksData, setLinksData] = useState<LinksData | null>(null); // This line is removed

  useEffect(() => {
    // 监听滚动事件
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsHeaderFixed(scrollTop > 100);
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // useEffect(() => { // This useEffect is removed
  //   // 获取友情链接数据
  //   const fetchLinks = async () => {
  //     try {
  //       const response = await fetch('/api/links.json');
  //       const data = await response.json();
  //       setLinksData(data);
  //     } catch (error) {
  //       console.error('Failed to fetch links:', error);
  //     }
  //   };

  //   fetchLinks();
  // }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen relative">
      {/* 动态背景容器 */}
      <div className="background-container">
        {settings.background.type === 'image' && (
          <>
            <div 
              className="background-image"
              style={{ backgroundImage: `url(${settings.background.value})` }}
            />
            <div className="background-blur" />
            <div className="background-overlay" />
          </>
        )}
        {settings.background.type === 'gradient' && (
          <>
            <div className="background-gradient" />
            <div className="background-overlay" />
          </>
        )}
        {settings.background.type === 'color' && (
          <>
            <div className="background-color" />
            <div className="background-overlay" />
          </>
        )}
      </div>

      {/* 顶部固定头部 */}
      <header className={`top-0 left-0 right-0 z-30 transition-all duration-500 ${isHeaderFixed ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-md tracking-tight select-none">
                AI工具导航
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Weather />
              <Settings onSettingsChange={updateSettings} />
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          {/* 搜索区域 */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight drop-shadow-lg">
                发现最佳
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                  AI工具
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lea
                  ding
                -relaxed">
              2 精心策划的人工智能工具集合，助力您的创意与生产力
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <SearchBox 
                style={settings.search.style}
                defaultEngine={settings.search.defaultEngine}
                engines={settings.search.engines}
                displayMode={settings.search.displayMode}
              />
            </div>
          </div>

          {/* 工具导航区域 */}
          <div className="space-y-8">
            <CustomNavigation iconStyle={settings.navigation.iconStyle} />
            <NavigationGrid iconStyle={settings.navigation.iconStyle} />
          </div>
        </div>
      </div>

      {/* 友情链接和版权信息 */}
      <footer className="bg-white/50 dark:bg-black/40 backdrop-blur-xl border-t border-white/20 dark:border-white/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center space-y-6">
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              {linksData?.links.map((link, index) => (
                <a 
                  key={link.url}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-all hover:transform hover:scale-105"
                  title={link.description}
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500 space-y-3">
              <div>
                {linksData?.copyright.text}{' '}
                {linksData?.copyright.links.map((link, index) => (
                  <span key={link.url}>
                    <a href={link.url} target="_blank" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      {link.text}
                    </a>
                    {index < linksData.copyright.links.length - 1 && ' '}
                  </span>
                ))}
              </div>
              <div>
                <a 
                  href={linksData?.copyright.icp.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {linksData?.copyright.icp.text}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* 回到顶部按钮 */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 rounded-full w-12 h-12 p-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="回到顶部"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </main>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400">加载中...</p>
      </div>
    </div>
  );
}

// 移除 getServerSideProps
// export async function getServerSideProps() {
//   const res = await fetch('http://localhost:3000/api/links.json');
//   const linksData = await res.json();
//   return { props: { linksData } };
// }

// 修改 Home 组件为 async function 并 SSR 获取数据
export default async function Home() {
  const res = await fetch('http://localhost:3000/api/links.json', { cache: 'no-store' });
  const linksData = await res.json();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DynamicSettingsProvider>
        <HomeContent linksData={linksData} />
      </DynamicSettingsProvider>
    </Suspense>
  );
}