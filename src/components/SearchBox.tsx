'use client';

import { useState, useRef, useEffect } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

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
        // 更新搜索引擎状态
        const updatedEngines = engines.map(engine => {
          const savedEngine = settings.search.engines.find((e: SearchEngine) => e.id === engine.id);
          return savedEngine ? { ...engine, enabled: savedEngine.enabled } : engine;
        });
        setEngines(updatedEngines);
        
        // 更新选中的搜索引擎
        const currentEngine = updatedEngines.find(e => e.id === selectedEngine?.id);
        if (currentEngine && !currentEngine.enabled) {
          const newDefaultEngine = updatedEngines.find(e => e.enabled) || updatedEngines[0];
          setSelectedEngine(newDefaultEngine);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [engines, selectedEngine]);

  // 监听设置变化
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      const newSettings = event.detail;
      console.log('Settings changed:', newSettings);
      
      // 更新搜索引擎状态
      const updatedEngines = newSettings.search.engines;
      setEngines(updatedEngines);
      
      // 更新选中的搜索引擎
      const newDefaultEngine = updatedEngines.find((e: SearchEngine) => e.id === newSettings.search.defaultEngine);
      if (newDefaultEngine) {
        setSelectedEngine(newDefaultEngine);
      }
    };

    window.addEventListener('pm-navigator-settings-change', handleSettingsChange as EventListener);
    return () => window.removeEventListener('pm-navigator-settings-change', handleSettingsChange as EventListener);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateDropdownPosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition);
      window.addEventListener('resize', updateDropdownPosition);
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [isDropdownOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !selectedEngine) return;

    const searchUrl = selectedEngine.url.replace('{query}', encodeURIComponent(query.trim()));
    window.open(searchUrl, '_blank');
  };

  const handleEngineChange = (engine: SearchEngine) => {
    console.log('handleEngineChange called with engine:', engine);
    setSelectedEngine(engine);
    setIsDropdownOpen(false);
    
    // 更新本地存储中的默认搜索引擎
    const savedSettings = localStorage.getItem('pm-navigator-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      settings.search.defaultEngine = engine.id;
      localStorage.setItem('pm-navigator-settings', JSON.stringify(settings));
      
      // 触发自定义事件通知其他组件
      const event = new CustomEvent('pm-navigator-settings-change', {
        detail: settings
      });
      window.dispatchEvent(event);
    }
  };

  const handleDropdownToggle = () => {
    console.log('handleDropdownToggle called, current state:', isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
    if (e.key === 'Enter' && isDropdownOpen) {
      e.preventDefault();
      const selectedButton = document.querySelector('.dropdown-item[aria-selected="true"]');
      if (selectedButton) {
        const engineId = selectedButton.getAttribute('data-engine-id');
        const engine = engines.find(e => e.id === engineId);
        if (engine) {
          handleEngineChange(engine);
        }
      }
    }
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-2 ${
                    selectedEngine.id === engine.id
                      ? 'bg-white/90 text-gray-800 border-gray-300/50 shadow-md'
                      : 'bg-white/50 text-gray-500 border-gray-200/30 hover:bg-white/60 hover:border-gray-300/50 hover:shadow-sm'
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
                className="w-full px-4 py-3 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200/50 focus:border-gray-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder-gray-400 text-gray-800 pr-24 shadow-sm hover:shadow-md transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-white/90 text-gray-800 rounded-lg hover:bg-white border border-gray-200/50 hover:border-gray-300/50 shadow-sm hover:shadow-md transition-all"
              >
                搜索
              </button>
            </div>
          </form>
        );

      default: // standard
        return (
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 focus-within:border-gray-300/50 focus-within:ring-2 focus-within:ring-blue-500/30 shadow-sm hover:shadow-md transition-all">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-3 text-gray-800 hover:bg-gray-50/50 transition-colors"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="listbox"
                  >
                    <div className="flex items-center gap-2">
                      {selectedEngine.icon && displayMode !== 'name-only' && (
                        <img
                          src={`/search-engines/${selectedEngine.icon}`}
                          alt={selectedEngine.name}
                          className="w-5 h-5"
                        />
                      )}
                      {displayMode !== 'icon-only' && (
                        <span>{selectedEngine.name}</span>
                      )}
                    </div>
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[160px]">
                  {engines.filter(engine => engine.enabled).map(engine => (
                    <DropdownMenuItem
                      key={engine.id}
                      onClick={() => {
                        console.log('Dropdown item clicked:', engine);
                        handleEngineChange(engine);
                      }}
                      className={`flex items-center gap-2 ${
                        selectedEngine.id === engine.id ? 'text-blue-600 font-medium' : 'text-gray-700'
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
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="h-6 w-px bg-gray-200/50 mx-2"></div>
              
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索..."
                className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none placeholder-gray-400 text-gray-800"
              />
            </div>
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