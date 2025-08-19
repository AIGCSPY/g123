'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { addToFavorites } from './CustomNavigation';
import { toast } from 'sonner';

// 自定义成功提示函数
const showSuccessToast = (message: string) => {
  // 移除已存在的提示
  const existingToasts = document.querySelectorAll('.success-toast');
  existingToasts.forEach(toast => toast.remove());

  const toastElement = document.createElement('div');
  toastElement.className = 'success-toast';
  toastElement.innerHTML = `
    <div class="success-toast-content">
      <div class="success-toast-icon">
        <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <div class="success-toast-text">${message}</div>
    </div>
    <div class="success-toast-progress"></div>
  `;
  
  document.body.appendChild(toastElement);
  
  // 触发动画
  requestAnimationFrame(() => {
    toastElement.classList.add('show');
  });
  
  // 3秒后移除
  setTimeout(() => {
    toastElement.classList.remove('show');
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement);
      }
    }, 300);
  }, 3000);
};

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

  // 处理图标路径 - 使用免费API获取网站图标
  const getIconPath = (icon: string, url?: string) => {
    // 优先使用API获取网站图标
    if (url) {
      try {
        const domain = new URL(url).hostname;
        // 使用多个免费的favicon API作为备选
        return `https://favicon.zhusl.com/ico?url=${domain}`;
      } catch (error) {
        console.warn('Invalid URL for favicon API:', url);
      }
    }
    
    // 备选方案：如果有本地图标路径
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

  const handleAddToFavorites = (site: Site) => {
    
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
        showSuccessToast('该工具已在收藏列表中');
        return;
      }
      // 直接传递本地图标路径
      addToFavorites(site.title, url.toString(), site.icon);
      showSuccessToast('✨ 已成功添加到收藏');
    } catch (error) {
      console.error('Invalid URL:', site.url);
      toast.error('无效的URL');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">

        
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => filterByCategory(0)}
            className={`minimal-button px-6 py-3 ${
              activeCategory === 0 || activeCategory === null ? 'active' : ''
            }`}
          >
            全部工具
          </button>
          
          {mainCategories.map(category => (
            <button
              key={category.id}
              onClick={() => filterByCategory(category.id)}
              className={`minimal-button px-6 py-3 ${
                activeCategory === category.id ? 'active' : ''
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className={`grid ${getGridLayoutClass()}`}>
        {filteredSites.map(site => (
          <div
            key={site.id}
            className="minimal-card group relative p-4 block"
          >
            {/* 极简收藏按钮 */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAddToFavorites(site);
              }}
              className="minimal-favorite absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 transition-all"
              title="添加到收藏"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="flex items-start">
                <div className={`${getIconContainerClass()} relative mr-3 rounded-lg bg-white/80 dark:bg-gray-800/80 p-2 flex-shrink-0 shadow-sm backdrop-blur-sm`}>
                  <Image
                    src={getIconPath(site.icon, site.url)}
                    alt={site.title}
                    fill
                    className="object-contain rounded-md"
                    sizes={iconStyle === 'large' ? '64px' : iconStyle === 'small' ? '32px' : '48px'}
                    onError={(e) => {
                      // 如果API图标加载失败，回退到本地图标
                      const target = e.target as HTMLImageElement;
                      const fallbackPath = site.icon?.startsWith('/') ? site.icon : `/${site.icon}`;
                      if (target.src !== fallbackPath && site.icon) {
                        target.src = fallbackPath;
                      } else {
                        target.src = '/default-favicon.png';
                      }
                    }}
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate leading-tight">
                      {site.title}
                    </h3>
                    {site.isrec === 1 && (
                      <span className="text-base">🔥</span>
                    )}
                  </div>
                  {iconStyle !== 'small' && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {site.desp}
                    </p>
                  )}
                </div>
              </div>
            </a>

          </div>
        ))}
      </div>
    </div>
  );
}