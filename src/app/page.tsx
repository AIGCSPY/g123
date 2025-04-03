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

function HomeContent() {
  const { settings, updateSettings } = useSettings();
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [linksData, setLinksData] = useState<LinksData | null>(null);

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

  useEffect(() => {
    // 获取友情链接数据
    const fetchLinks = async () => {
      try {
        const response = await fetch('/api/links.json');
        const data = await response.json();
        setLinksData(data);
      } catch (error) {
        console.error('Failed to fetch links:', error);
      }
    };

    fetchLinks();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen">
      {/* 背景容器 */}
      {settings.background.type === 'image' ? (
        <div className="background-container">
          <div 
            className="background-image"
            style={{ backgroundImage: `url(${settings.background.value})` }}
          />
          <div className="background-blur" />
          <div className="background-overlay" />
        </div>
      ) : settings.background.type === 'gradient' ? (
        <div className="background-gradient" />
      ) : (
        <div className="background-color" />
      )}

      {/* 主要内容 */}
      <div className="container mx-auto px-4 pb-8">
        {/* 头部区域 */}
        <div className={`transition-all duration-300 ${isHeaderFixed ? 'fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md' : ''}`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-4">
              <Weather />
              <Settings onSettingsChange={updateSettings} />
            </div>
            <header className={`flex flex-col items-center mb-4 ${isHeaderFixed ? 'hidden' : ''}`}>
              <div className="mb-2">
                <img 
                  src="/icon/logo.svg"
                  alt="产品经理导航"
                  width={480}
                  height={120}
                  className="w-[480px] h-[120px]"
                />
              </div>
            </header>
            {/* 搜索框 */}
            <div className="max-w-2xl mx-auto mb-4">
              <SearchBox
                style={isHeaderFixed ? 'minimal' : settings.search.style}
                defaultEngine={settings.search.defaultEngine}
                engines={settings.search.engines}
                displayMode={settings.search.displayMode}
              />
            </div>
          </div>
        </div>

        {/* 导航区域 */}
        <div className={`space-y-12 ${isHeaderFixed ? 'mt-[280px]' : ''}`}>
          <CustomNavigation iconStyle={settings.navigation.iconStyle} />
          <NavigationGrid iconStyle={settings.navigation.iconStyle} />
        </div>

        {/* 友情链接和版权信息 */}
        <div className="mt-16 text-center space-y-4">
          <div className="text-sm text-gray-500">
            {linksData?.links.map((link, index) => (
              <span key={link.url}>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-gray-700"
                  title={link.description}
                >
                  {link.name}
                </a>
                {index < linksData.links.length - 1 && <span className="mx-2">|</span>}
              </span>
            ))}
          </div>
          <div className="text-sm text-gray-400">
            {linksData?.copyright.text}{' '}
            {linksData?.copyright.links.map((link, index) => (
              <span key={link.url}>
                <a href={link.url} target="_blank" className="hover:text-gray-700">
                  {link.text}
                </a>
                {index < linksData.copyright.links.length - 1 && ' '}
              </span>
            ))}{' '}
            <a 
              href={linksData?.copyright.icp.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-gray-700"
            >
              {linksData?.copyright.icp.text}
            </a>
          </div>
        </div>
      </div>

      {/* 返回顶部按钮 */}
      {showBackToTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg bg-white backdrop-blur-md text-black hover:bg-white/20"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicSettingsProvider>
        <HomeContent />
      </DynamicSettingsProvider>
    </Suspense>
  );
}
