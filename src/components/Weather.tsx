'use client';

import { useEffect, useState } from 'react';

interface WeatherData {
  location: string;
  text: string;
  temperature: string;
  updateAt: string;
  today: {
    low: string;
    high: string;
  };
}

export const Weather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://widget-v3.seniverse.com/api/weather/fd08684d-bf66-4982-999d-4d0f260c236d?unit=c&language=zh-Hans&location=WX4FBXXFKE4F&geolocation=true&detected=zh-cn'
        );
        const data = await response.json();
        if (data.success && data.results?.[0]?.data?.[0]) {
          setWeather(data.results[0].data[0]);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // 每30分钟更新一次天气
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
        <span>加载中...</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
        <span>获取天气失败</span>
      </div>
    );
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 基本显示 */}
      <div 
        ref={setButtonRef}
        className="minimal-button flex items-center space-x-2 px-3 py-2 text-sm"
      >
        <span>{weather.location}</span>
        <span>{weather.text}</span>
        <span className="font-medium">{weather.temperature}</span>
      </div>

      {/* 悬浮显示 - 使用portal避免影响布局 */}
      {isHovered && (
        <>
          <div 
            className="fixed inset-0 z-[9998] pointer-events-auto"
            onClick={() => setIsHovered(false)}
          />
          <div 
            className="fixed z-[9999] pointer-events-auto"
            style={{
              top: buttonRef ? `${buttonRef.getBoundingClientRect().bottom + 8}px` : '76px',
              left: buttonRef ? `${buttonRef.getBoundingClientRect().left}px` : '24px',
              transform: 'translateY(0)'
            }}
          >
            <div className="minimal-card backdrop-blur-md p-4 min-w-[280px] max-w-[320px] shadow-2xl border border-white/20 dark:border-white/10 animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200/50 dark:border-gray-700/50 pb-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{weather.location}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                    {weather.updateAt}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {weather.temperature}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-lg text-gray-600 dark:text-gray-400">
                        {weather.text}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">今日温度范围</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {weather.today.low} ~ {weather.today.high}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1">
                  点击空白处关闭
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 