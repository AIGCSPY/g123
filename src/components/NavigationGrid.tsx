'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { addToFavorites } from './CustomNavigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Site {
  id: number;
  title: string;
  desp: string;
  url: string;
  icon: string;
  clicknum: number;
  bigtype: number;
  smalltype: number;
  isrec: number;
}

interface Category {
  id: number;
  fid: number;
  name: string;
  sort: number;
}

interface NavigationGridProps {
  iconStyle?: 'large' | 'small' | 'card';
  onAddToFavorites?: (site: Site) => void;
}

// 默认分类数据
const DEFAULT_CATEGORIES: Category[] = [
  {id: 1, fid: 0, name: "设计", sort: 0},
  {id: 2, fid: 0, name: "产品", sort: 0},
  {id: 3, fid: 0, name: "前端", sort: 0},
  {id: 4, fid: 0, name: "后端", sort: 0},
  {id: 6, fid: 0, name: "运营", sort: 0},
  {id: 7, fid: 0, name: "其他", sort: 0}
];

// 默认网站数据
const DEFAULT_SITES: Site[] = [
  {
    id: 1,
    title: "人人都是产品经理",
    desp: "产品经理、产品爱好者学习交流平台",
    url: "https://www.woshipm.com/",
    icon: "logos/19a50b0a1e81d5bba069f51f2c2df1f1.jpg",
    clicknum: 0,
    bigtype: 2,
    smalltype: 23,
    isrec: 0
  },
  {
    id: 2,
    title: "鸟哥笔记",
    desp: "分享运营推广经验，新媒体、产品营销案例",
    url: "https://www.niaogebiji.com/",
    icon: "logos/d41f059b714002163117eda2fa69d4df.jpg",
    clicknum: 0,
    bigtype: 2,
    smalltype: 20,
    isrec: 0
  },
  {
    id: 3,
    title: "爱运营",
    desp: "专注网站产品运营、淘宝运营",
    url: "https://www.iyunying.org",
    icon: "logos/04531a2bbd9391e7483374ab93bddb3e.jpg",
    clicknum: 0,
    bigtype: 6,
    smalltype: 35,
    isrec: 0
  },
  {
    id: 4,
    title: "运营喵",
    desp: "用数据、案例分析的方式提高运营者能力",
    url: "https://www.yymiao.cn/",
    icon: "logos/2b6af1387468b8e5b25cec99f8ae9482.jpg",
    clicknum: 0,
    bigtype: 6,
    smalltype: 35,
    isrec: 0
  }
];

export const NavigationGrid = ({ 
  iconStyle = 'card',
  onAddToFavorites 
}: NavigationGridProps) => {
  const [sites, setSites] = useState<Site[]>(DEFAULT_SITES);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [filteredSites, setFilteredSites] = useState<Site[]>(DEFAULT_SITES);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [mainCategories, setMainCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [activeMoreMenu, setActiveMoreMenu] = useState<number | null>(null);

  useEffect(() => {
    // 尝试加载网站数据
    fetch('/api/all.json')
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          setSites(data);
          setFilteredSites(data);
        }
      })
      .catch(error => {
        console.error('Error loading sites:', error);
        // 使用默认数据
      });

    // 尝试加载分类数据
    fetch('/api/classes.json')
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          setCategories(data);
          // 提取主分类 (fid=0)
          const mainCats = data.filter((cat: Category) => cat.fid === 0);
          if (mainCats.length > 0) {
            setMainCategories(mainCats);
          }
        }
      })
      .catch(error => {
        console.error('Error loading categories:', error);
        // 使用默认数据
      });
  }, []);

  // 根据分类筛选网站
  const filterByCategory = (categoryId: number) => {
    setActiveCategory(categoryId);
    
    if (categoryId === 0) {
      // 显示所有网站
      setFilteredSites(sites);
    } else {
      // 找出所有小分类 (父类ID为当前选中的分类ID)
      const subCategories = categories
        .filter(cat => cat.fid === categoryId)
        .map(cat => cat.id);
      
      // 如果有小分类，则筛选出属于这些小分类的网站
      if (subCategories.length > 0) {
        const filtered = sites.filter(site => 
          subCategories.includes(site.smalltype) || site.bigtype === categoryId
        );
        setFilteredSites(filtered);
      } else {
        // 直接筛选大分类
        const filtered = sites.filter(site => site.bigtype === categoryId);
        setFilteredSites(filtered);
      }
    }
  };

  // 根据图标样式获取网格布局类名
  const getGridLayoutClass = () => {
    switch (iconStyle) {
      case 'large':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4';
      case 'small':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';
      default: // card
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
    }
  };

  // 根据图标样式获取网站项类名
  const getSiteItemClass = () => {
    switch (iconStyle) {
      case 'large':
        return 'flex items-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm relative group hover:shadow-md transition-shadow';
      case 'small':
        return 'flex items-center p-2 rounded-lg border bg-card text-card-foreground shadow-sm relative group hover:shadow-md transition-shadow';
      default: // card
        return 'flex items-center p-3 rounded-lg border bg-card text-card-foreground shadow-sm relative group hover:shadow-md transition-shadow';
    }
  };

  // 根据图标样式获取图标容器类名
  const getIconContainerClass = () => {
    switch (iconStyle) {
      case 'large':
        return 'w-16 h-16 flex-shrink-0';
      case 'small':
        return 'w-8 h-8 flex-shrink-0';
      default: // card
        return 'w-12 h-12 flex-shrink-0';
    }
  };

  // 处理图标路径
  const getIconPath = (icon: string) => {
    if (!icon) return '/default-favicon.png';
    // 如果已经是完整的URL，直接返回
    if (icon.startsWith('http://') || icon.startsWith('https://')) {
      return icon;
    }
    // 如果是协议相对URL，添加https:
    if (icon.startsWith('//')) {
      return `https:${icon}`;
    }
    // 如果是相对路径，确保以/开头
    return icon.startsWith('/') ? icon : `/${icon}`;
  };

  const handleMoreClick = (siteId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMoreMenu(activeMoreMenu === siteId ? null : siteId);
  };

  const handleAddToFavorites = (site: Site, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // 确保 URL 是有效的
      const url = new URL(site.url);
      // 先检查是否已经收藏
      let favorites: any[] = [];
      try {
        const saved = localStorage.getItem('favorites');
        if (saved) {
          favorites = JSON.parse(saved);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
      
      if (favorites.some((fav: any) => fav.url === url.toString())) {
        toast.error('该网站已在收藏列表中');
        return;
      }
      // 直接传递本地图标路径
      addToFavorites(site.title, url.toString(), site.icon);
      toast.success('已添加到收藏');
    } catch (error) {
      console.error('Invalid URL:', site.url);
      toast.error('无效的URL');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>网站导航</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => filterByCategory(0)}
            variant={activeCategory === 0 || activeCategory === null ? "default" : "outline"}
            size="sm"
          >
            全部
          </Button>
          
          {mainCategories.map(category => (
            <Button
              key={category.id}
              onClick={() => filterByCategory(category.id)}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className={`grid ${getGridLayoutClass()}`}>
        {filteredSites.map(site => (
          <a
            key={site.id}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${getSiteItemClass()} group relative`}
            style={{ color: 'var(--text-color)' }}
          >
            <div className={`${getIconContainerClass()} relative mr-4 bg-[var(--bg-light)] rounded-md p-1`}>
              <Image
                src={getIconPath(site.icon)}
                alt={site.title}
                fill
                className="object-contain rounded-md group-hover:scale-105 transition-transform"
                sizes={iconStyle === 'large' ? '64px' : iconStyle === 'small' ? '32px' : '48px'}
              />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-medium truncate group-hover:text-[var(--primary-color)] transition-colors">
                {site.title}
              </h3>
              {iconStyle !== 'small' && (
                <p className="text-sm text-[var(--text-secondary)] line-clamp-1 mt-1">
                  {site.desp}
                </p>
              )}
            </div>

            {/* 更多操作按钮 */}
            <button
              onClick={(e) => handleMoreClick(site.id, e)}
              className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-light)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {/* 更多操作菜单 */}
            {activeMoreMenu === site.id && (
              <div className="absolute top-10 right-2 rounded-md shadow-sm border bg-card py-1 z-10">
                <button
                  onClick={(e) => {
                    handleAddToFavorites(site, e);
                    setActiveMoreMenu(null); // 点击后隐藏菜单
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--text-color)] hover:text-[var(--primary-color)] hover:bg-[var(--bg-light)] transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  添加到收藏
                </button>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}