'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { Settings as SettingsType } from './Settings';

// 默认设置
const defaultSettings: SettingsType = {
  background: {
    type: 'color',
    value: '#f5f5f5',
    // overlay: 30, // 移除
    // blur: 8,     // 移除
  },
  search: {
    defaultEngine: 'baidu',
    engines: [
      { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={query}', enabled: true },
      { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={query}', enabled: true },
      { id: 'bing', name: '必应', url: 'https://cn.bing.com/search?q={query}', enabled: true },
    ],
    style: 'standard',
    displayMode: 'icon-name',
  },
  navigation: {
    iconStyle: 'card',
  },
  theme: 'system',
};

type SettingsContextType = {
  settings: SettingsType;
  updateSettings: (settings: SettingsType) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined';

// 应用背景设置的辅助函数
const applyBackgroundSettings = (background: SettingsType['background']) => {
  if (!isBrowser) return;
  
  const root = document.documentElement;
  // 不再设置 --blur-value 和 --overlay-value
  
  if (background.type === 'image') {
    // 图片背景不需要额外设置，由page.tsx处理
  } else if (background.type === 'gradient') {
    root.style.setProperty('--gradient-value', background.value);
  } else if (background.type === 'color') {
    root.style.setProperty('--color-value', background.value);
  }
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !isBrowser) return;

    const savedSettings = localStorage.getItem('pm-navigator-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        
        // 设置初始CSS变量
        if (parsed.background) {
          applyBackgroundSettings(parsed.background);
        }

        // 应用主题模式
        if (parsed.theme) {
          const root = document.documentElement;
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          const theme = parsed.theme === 'system' ? systemTheme : parsed.theme;
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
        }
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
  }, [isMounted]);

  useEffect(() => {
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        const root = document.documentElement;
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
        
        // 主题变化时重新应用背景设置
        applyBackgroundSettings(settings.background);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme, settings.background]);

  const updateSettings = (newSettings: SettingsType) => {
    if (isBrowser) {
      localStorage.setItem('pm-navigator-settings', JSON.stringify(newSettings));
    }
    setSettings(newSettings);

    // 应用主题模式
    if (newSettings.theme) {
      const root = document.documentElement;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const theme = newSettings.theme === 'system' ? systemTheme : newSettings.theme;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    
    // 应用背景设置
    if (newSettings.background) {
      applyBackgroundSettings(newSettings.background);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 