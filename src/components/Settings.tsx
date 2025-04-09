'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'
import { Github } from 'lucide-react'
import { IoSettingsOutline } from 'react-icons/io5';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight, Sun, Moon, Monitor } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsProps {
  onSettingsChange: (settings: Settings) => void;
}

export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon?: string;
  enabled: boolean;
}

export interface Settings {
  background: {
    type: 'color' | 'gradient' | 'image';
    value: string;
    overlay: number;
    blur: number;
  };
  search: {
    defaultEngine: string;
    engines: SearchEngine[];
    style: 'multi' | 'standard' | 'minimal';
    displayMode: 'icon-name' | 'icon-only' | 'name-only';
  };
  navigation: {
    iconStyle: 'large' | 'small' | 'card';
  };
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: Settings = {
  background: {
    type: 'color',
    value: '#edf0f3',
    overlay: 30,
    blur: 8,
  },
  search: {
    defaultEngine: 'baidu',
    engines: [],
    style: 'standard',
    displayMode: 'icon-name',
  },
  navigation: {
    iconStyle: 'card',
  },
  theme: 'system',
};

const PRESET_BACKGROUNDS = {
  colors: [
    { name: '简灰', value: '#edf0f3' },
    { name: '象牙白', value: '#fffff0' },
    { name: '薄荷绿', value: '#f5fffa' },
    { name: '浅蓝', value: '#f0f8ff' },
    { name: '米白', value: '#fafafa' },
  ],
  gradients: [
    { name: '日出', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
    { name: '清新', value: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' },
    { name: '薰衣草', value: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)' },
    { name: '深海', value: 'linear-gradient(120deg, #1a365d 0%, #2d3748 100%)' },
    { name: '极光', value: 'linear-gradient(120deg, #00b4db 0%, #0083b0 100%)' },
  ],
};

const WALLPAPERS_PER_PAGE = 12;
const TOTAL_WALLPAPERS = 72;

export function Settings({ onSettingsChange }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('pm-navigator-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [currentWallpaperPage, setCurrentWallpaperPage] = useState(1);
  const totalPages = Math.ceil(TOTAL_WALLPAPERS / WALLPAPERS_PER_PAGE);

  useEffect(() => {
    const fetchSearchEngines = async () => {
      try {
        const response = await fetch('/api/searchEngine.json');
        const data = await response.json();
        
        // 从本地存储获取当前设置
        const savedSettings = localStorage.getItem('pm-navigator-settings');
        const currentSettings = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
        
        // 合并API数据和本地存储的状态
        const mergedEngines = data.engines.map((engine: SearchEngine) => {
          const savedEngine = currentSettings.search.engines.find((e: SearchEngine) => e.id === engine.id);
          return {
            ...engine,
            enabled: savedEngine ? savedEngine.enabled : true
          };
        });

        // 确保默认搜索引擎存在且启用
        const defaultEngine = currentSettings.search.defaultEngine;
        const defaultEngineExists = mergedEngines.some((e: SearchEngine) => e.id === defaultEngine && e.enabled);
        
        // 如果默认搜索引擎不存在或未启用，使用第一个启用的搜索引擎
        if (!defaultEngineExists) {
          const firstEnabledEngine = mergedEngines.find((e: SearchEngine) => e.enabled);
          if (firstEnabledEngine) {
            currentSettings.search.defaultEngine = firstEnabledEngine.id;
          }
        }
        
        // 更新设置中的搜索引擎列表
        setSettings(prev => ({
          ...prev,
          search: {
            ...prev.search,
            engines: mergedEngines
          }
        }));
      } catch (error) {
        console.error('Failed to fetch search engines:', error);
      }
    };

    fetchSearchEngines();
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem('pm-navigator-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingsChange = (newSettings: Settings) => {
    console.log('Settings component: handleSettingsChange', newSettings);
    setSettings(newSettings);
    localStorage.setItem('pm-navigator-settings', JSON.stringify(newSettings));
    
    if (newSettings.background.type === 'image') {
      document.documentElement.style.setProperty('--blur-value', `${newSettings.background.blur}px`);
      document.documentElement.style.setProperty('--overlay-value', `${newSettings.background.overlay / 100}`);
    } else if (newSettings.background.type === 'gradient') {
      document.documentElement.style.setProperty('--gradient-value', newSettings.background.value);
      document.documentElement.style.setProperty('--overlay-value', `${newSettings.background.overlay / 100}`);
    } else {
      document.documentElement.style.setProperty('--color-value', newSettings.background.value);
      document.documentElement.style.setProperty('--overlay-value', `${newSettings.background.overlay / 100}`);
    }
    
    // 触发自定义事件通知其他组件
    const event = new CustomEvent('pm-navigator-settings-change', {
      detail: newSettings
    });
    window.dispatchEvent(event);
    
    onSettingsChange(newSettings);
  };

  const resetSettings = () => {
    handleSettingsChange(DEFAULT_SETTINGS);
  };

  const getWallpaperUrl = (index: number) => `/wallspic/wallspic_${String(index).padStart(2, '0')}.jpg`;

  const toggleEngine = (engineId: string) => {
    const newEngines = settings.search.engines.map(engine =>
      engine.id === engineId ? { ...engine, enabled: !engine.enabled } : engine
    );
    
    // 如果禁用了当前默认搜索引擎，选择第一个启用的搜索引擎作为默认
    const newDefaultEngine = newEngines.find(engine => engine.id === settings.search.defaultEngine && engine.enabled)?.id ||
                            newEngines.find(engine => engine.enabled)?.id ||
                            'baidu';
    
    handleSettingsChange({
      ...settings,
      search: {
        ...settings.search,
        engines: newEngines,
        defaultEngine: newDefaultEngine,
      },
    });
  };

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newSettings = {
      ...settings,
      theme: themes[nextIndex]
    };
    handleSettingsChange(newSettings);
  };

  return (
    <div className="flex items-center gap-2">
      <Link
            href="https://github.com/xmsumi/icoolgo-pm-navigator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-color)] hover:text-[var(--primary-color)]"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="text-[var(--text-color)] hover:text-[var(--primary-color)] hover:shadow-md transition-all duration-200"
      >
        {settings.theme === 'light' ? (
          <Sun className="h-4 w-4" />
        ) : settings.theme === 'dark' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Monitor className="h-4 w-4" />
        )}
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="text-[var(--text-color)] hover:text-[var(--primary-color)] hover:shadow-md transition-all duration-200">
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle>设置</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-4rem)] mt-4">
            <Tabs defaultValue="background" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="background">背景</TabsTrigger>
                <TabsTrigger value="search">搜索</TabsTrigger>
                <TabsTrigger value="navigation">导航</TabsTrigger>
              </TabsList>
              
              <TabsContent value="background" className="space-y-4">
                <div className="space-y-2">
                  <Label>背景类型</Label>
                  <Select
                    value={settings.background.type}
                    onValueChange={(value: 'color' | 'gradient' | 'image') =>
                      handleSettingsChange({
                        ...settings,
                        background: {
                          ...settings.background,
                          type: value,
                          value: value === 'image' ? getWallpaperUrl(1) : 
                                 value === 'gradient' ? PRESET_BACKGROUNDS.gradients[0].value :
                                 PRESET_BACKGROUNDS.colors[0].value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">纯色</SelectItem>
                      <SelectItem value="gradient">渐变色</SelectItem>
                      <SelectItem value="image">壁纸</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.background.type === 'color' && (
                  <div className="space-y-2">
                    <Label>选择颜色</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_BACKGROUNDS.colors.map((color) => (
                        <button
                          key={color.value}
                          className="w-full aspect-square rounded-lg border-2 transition-all"
                          style={{
                            backgroundColor: color.value,
                            borderColor: settings.background.value === color.value ? '#3b82f6' : 'transparent',
                          }}
                          onClick={() =>
                            handleSettingsChange({
                              ...settings,
                              background: {
                                ...settings.background,
                                value: color.value,
                              },
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {settings.background.type === 'gradient' && (
                  <div className="space-y-2">
                    <Label>选择渐变色</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_BACKGROUNDS.gradients.map((gradient) => (
                        <button
                          key={gradient.value}
                          className="w-full aspect-video rounded-lg border-2 transition-all"
                          style={{
                            background: gradient.value,
                            borderColor: settings.background.value === gradient.value ? '#3b82f6' : 'transparent',
                          }}
                          onClick={() =>
                            handleSettingsChange({
                              ...settings,
                              background: {
                                ...settings.background,
                                value: gradient.value,
                              },
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {settings.background.type === 'image' && (
                  <div className="space-y-2">
                    <Label>选择壁纸</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from(
                        { length: WALLPAPERS_PER_PAGE },
                        (_, i) => (currentWallpaperPage - 1) * WALLPAPERS_PER_PAGE + i + 1
                      ).map((index) => (
                        <button
                          key={index}
                          className="relative aspect-video rounded-lg overflow-hidden border-2 transition-all"
                          style={{
                            borderColor: settings.background.value === getWallpaperUrl(index) ? '#3b82f6' : 'transparent',
                          }}
                          onClick={() =>
                            handleSettingsChange({
                              ...settings,
                              background: {
                                ...settings.background,
                                value: getWallpaperUrl(index),
                              },
                            })
                          }
                        >
                          <Image
                            src={getWallpaperUrl(index)}
                            alt={`壁纸 ${index}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentWallpaperPage(prev => Math.max(1, prev - 1))}
                        disabled={currentWallpaperPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        上一页
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        第 {currentWallpaperPage} 页，共 {totalPages} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentWallpaperPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentWallpaperPage === totalPages}
                      >
                        下一页
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>遮罩透明度</Label>
                  <Slider
                    value={[settings.background.overlay]}
                    onValueChange={([value]) =>
                      handleSettingsChange({
                        ...settings,
                        background: {
                          ...settings.background,
                          overlay: value,
                        },
                      })
                    }
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>模糊程度</Label>
                  <Slider
                    value={[settings.background.blur]}
                    onValueChange={([value]) =>
                      handleSettingsChange({
                        ...settings,
                        background: {
                          ...settings.background,
                          blur: value,
                        },
                      })
                    }
                    max={20}
                    step={1}
                  />
                </div>
              </TabsContent>

              <TabsContent value="search" className="space-y-4">
                <div className="space-y-2">
                  <Label>默认搜索引擎</Label>
                  <Select
                    value={settings.search.defaultEngine}
                    onValueChange={(value) =>
                      handleSettingsChange({
                        ...settings,
                        search: { ...settings.search, defaultEngine: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.search.engines
                        .filter(engine => engine.enabled)
                        .map(engine => (
                          <SelectItem key={engine.id} value={engine.id}>
                            {engine.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>搜索引擎显示方式</Label>
                  <Select
                    value={settings.search.displayMode}
                    onValueChange={(value: 'icon-name' | 'icon-only' | 'name-only') =>
                      handleSettingsChange({
                        ...settings,
                        search: { ...settings.search, displayMode: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="icon-name">图标 + 名称</SelectItem>
                      <SelectItem value="icon-only">仅图标</SelectItem>
                      <SelectItem value="name-only">仅名称</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>搜索引擎</Label>
                  <div className="space-y-2">
                    {settings.search.engines.map(engine => (
                      <div key={engine.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          {engine.icon && (
                            <img 
                              src={`/search-engines/${engine.icon}`} 
                              alt={engine.name}
                              className="w-5 h-5"
                            />
                          )}
                          <span>{engine.name}</span>
                        </div>
                        <Switch
                          checked={engine.enabled}
                          onCheckedChange={() => toggleEngine(engine.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>搜索框样式</Label>
                  <Select
                    value={settings.search.style}
                    onValueChange={(value: 'multi' | 'standard' | 'minimal') =>
                      handleSettingsChange({
                        ...settings,
                        search: { ...settings.search, style: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multi">多功能</SelectItem>
                      <SelectItem value="standard">标准</SelectItem>
                      <SelectItem value="minimal">极简</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="navigation" className="space-y-4">
                <div className="space-y-2">
                  <Label>导航图标样式</Label>
                  <Select
                    value={settings.navigation.iconStyle}
                    onValueChange={(value: 'large' | 'small' | 'card') =>
                      handleSettingsChange({
                        ...settings,
                        navigation: { ...settings.navigation, iconStyle: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="large">大图标</SelectItem>
                      <SelectItem value="small">小图标</SelectItem>
                      <SelectItem value="card">卡片式</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button variant="destructive" onClick={resetSettings} className="w-full">
                重置设置
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
} 