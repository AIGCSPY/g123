'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon?: string;
  enabled: boolean;
}

interface SearchBoxProps {
  style?: 'multi' | 'standard' | 'minimal';
  defaultEngine?: string;
  engines?: SearchEngine[];
  displayMode?: 'icon-name' | 'icon-only' | 'name-only';
}

export const SearchBox = ({
  style = 'standard',
  defaultEngine = 'baidu',
  engines: defaultEngines = [],
  displayMode = 'icon-name',
}: SearchBoxProps) => {
  const [engines, setEngines] = useState<SearchEngine[]>(defaultEngines);
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine | null>(null);
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 客户端挂载状态
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isDropdownOpen]);



  // 从API获取搜索引擎配置
  useEffect(() => {
    const fetchSearchEngines = async () => {
      try {
        const response = await fetch('/api/searchEngine.json');
        const data = await response.json();
        console.log('Fetched search engines:', data);
        
        // 从本地存储获取搜索引擎状态
        const savedSettings = localStorage.getItem('pm-navigator-settings');
        const savedEngines = savedSettings ? JSON.parse(savedSettings).search.engines : [];
        
        // 确保 data.engines 存在
        if (!data.engines || !Array.isArray(data.engines)) {
          console.error('Invalid search engines data:', data);
          return;
        }
        
        // 合并API数据和本地存储的状态
        const mergedEngines = data.engines.map((engine: SearchEngine) => {
          const savedEngine = savedEngines.find((e: SearchEngine) => e.id === engine.id);
          return {
            ...engine,
            enabled: savedEngine ? savedEngine.enabled : engine.enabled
          };
        });
        
        console.log('Merged engines:', mergedEngines);
        setEngines(mergedEngines);
        
        // 设置默认搜索引擎（只从启用的搜索引擎中选择）
        const defaultEngineData = mergedEngines.find((e: SearchEngine) => e.id === defaultEngine && e.enabled) || 
                                mergedEngines.find((e: SearchEngine) => e.enabled) || 
                                mergedEngines[0];
        console.log('Setting default engine:', defaultEngineData);
        setSelectedEngine(defaultEngineData);
      } catch (error) {
        console.error('Failed to fetch search engines:', error);
        // 如果API获取失败，使用默认配置
        setEngines(defaultEngines);
        setSelectedEngine(defaultEngines.find(e => e.id === defaultEngine && e.enabled) || 
                        defaultEngines.find(e => e.enabled) || 
                        defaultEngines[0]);
      }
    };

    fetchSearchEngines();
  }, [defaultEngine, defaultEngines]);

  // 监听本地存储中的设置变化
  useEffect(() => {
    const handleStorageChange = () => {
      const savedSettings = localStorage.getItem('pm-navigator-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        // 获取当前的engines和selectedEngine，避免闭包问题
        setEngines(currentEngines => {
          const updatedEngines = currentEngines.map(engine => {
            const savedEngine = settings.search.engines.find((e: SearchEngine) => e.id === engine.id);
            return savedEngine ? { ...engine, enabled: savedEngine.enabled } : engine;
          });
          
          // 检查当前选中的引擎是否仍然可用
          setSelectedEngine(currentSelected => {
            const currentEngine = updatedEngines.find(e => e.id === currentSelected?.id);
            if (currentEngine && !currentEngine.enabled) {
              return updatedEngines.find(e => e.enabled) || updatedEngines[0];
            }
            return currentSelected;
          });
          
          return updatedEngines;
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // 移除依赖，使用函数式更新

  // 监听设置变化 - 简化版本，只监听引擎启用状态变化
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      const newSettings = event.detail;
      console.log('Settings changed:', newSettings);
      
      // 只在设置页面改变引擎启用状态时才更新
      if (newSettings.search && newSettings.search.engines) {
        setEngines(newSettings.search.engines);
        
        // 检查当前选中的引擎是否仍然启用
        const currentSelected = newSettings.search.engines.find((e: SearchEngine) => e.id === newSettings.search.defaultEngine);
        if (currentSelected && currentSelected.enabled) {
          setSelectedEngine(currentSelected);
        }
      }
    };

    window.addEventListener('pm-navigator-settings-change', handleSettingsChange as EventListener);
    return () => window.removeEventListener('pm-navigator-settings-change', handleSettingsChange as EventListener);
  }, []);



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !selectedEngine) return;

    const searchUrl = selectedEngine.url.replace('{query}', encodeURIComponent(query.trim()));
    window.open(searchUrl, '_blank');
  };

  const handleEngineChange = (engine: SearchEngine) => {
    console.log('handleEngineChange called with engine:', engine);
    setSelectedEngine(engine);
    setIsDropdownOpen(false); // 关闭下拉框
    
    // 直接更新本地存储，不使用setTimeout
    try {
      const savedSettings = localStorage.getItem('pm-navigator-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        settings.search.defaultEngine = engine.id;
        localStorage.setItem('pm-navigator-settings', JSON.stringify(settings));
      }
    } catch (error) {
      console.error('Failed to update localStorage:', error);
    }
  };

  // 自定义下拉菜单组件，使用portal避免页面晃动
  const CustomDropdown = () => {
    if (!isDropdownOpen || !triggerRef.current || !isMounted) return null;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    
    return createPortal(
      <>
        {/* 遮罩层 */}
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsDropdownOpen(false)}
        />
        {/* 下拉内容 */}
        <div
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[160px]"
          style={{
            top: triggerRect.bottom + 2,
            left: triggerRect.left,
          }}
        >
          {engines.filter(engine => engine.enabled).map(engine => (
            <button
              key={engine.id}
              onClick={() => handleEngineChange(engine)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                selectedEngine?.id === engine.id 
                  ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {engine.icon && displayMode !== 'name-only' && (
                <img
                  src={`/search-engines/${engine.icon}`}
                  alt={engine.name}
                  className="w-5 h-5"
                />
              )}
              {displayMode !== 'icon-only' && (
                <span>{engine.name}</span>
              )}
            </button>
          ))}
        </div>
      </>,
      document.body
    );
  };

  const renderSearchBox = () => {
    if (!selectedEngine) return null;

    switch (style) {
      case 'minimal':
        return (
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索..."
              className="w-full px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 focus:border-gray-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder-gray-400 text-gray-800 shadow-sm hover:shadow-md transition-all"
            />
          </form>
        );

      case 'multi':
        return (
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {engines.filter(engine => engine.enabled).map(engine => (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => {
                    console.log('Multi mode engine clicked:', engine);
                    handleEngineChange(engine);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedEngine.id === engine.id ? 'minimal-button active' : 'minimal-button'
                  }`}
                >
                  {engine.icon && displayMode !== 'name-only' && (
                    <img
                      src={`/search-engines/${engine.icon}`}
                      alt={engine.name}
                      className="w-4 h-4"
                    />
                  )}
                  {displayMode !== 'icon-only' && (
                    <span>{engine.name}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`在 ${selectedEngine.name} 中搜索...`}
                className="w-full px-4 py-3 minimal-search focus:outline-none pr-24 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm font-medium"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                搜索
              </button>
            </div>
          </form>
        );

      default: // standard
        return (
          <form onSubmit={handleSearch} className="relative">
            <div className="minimal-search relative flex items-center h-12 max-w-full">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => {
                  console.log('Trigger button clicked, current state:', isDropdownOpen);
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="flex items-center gap-1 px-3 h-full border-r border-white/20 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all text-sm flex-shrink-0"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <div className="flex items-center gap-2">
                  {selectedEngine.icon && displayMode !== 'name-only' && (
                    <img
                      src={`/search-engines/${selectedEngine.icon}`}
                      alt={selectedEngine.name}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  {displayMode !== 'icon-only' && (
                    <span className="font-medium text-xs hidden sm:inline">{selectedEngine.name}</span>
                  )}
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索 AI 工具..."
                className="flex-1 px-3 h-full bg-transparent border-0 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm font-medium min-w-0"
              />
              
              <button
                type="submit"
                className="flex items-center gap-1 px-3 sm:px-4 h-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm transition-all rounded-r-[14px] flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">搜索</span>
              </button>
            </div>
            <CustomDropdown />
          </form>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {renderSearchBox()}
    </div>
  );
}; 