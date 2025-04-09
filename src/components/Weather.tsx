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
      <div className="flex items-center text-gray-500 text-sm">
        <span>加载中...</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex items-center text-gray-500 text-sm">
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
      <div className="flex items-center bg-card space-x-2 text-gray-500 backdrop-blur-sm px-2 py-1 rounded transition-all">
        <span className="text-sm">{weather.location}</span>
        <span className="text-sm">{weather.text}</span>
        <span className="font-medium">{weather.temperature}</span>
      </div>

      {/* 悬浮显示 */}
      {isHovered && (
        <div className="absolute top-full left-0 mt-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-4 min-w-[200px] z-50">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{weather.location}</span>
              <span className="text-xs text-gray-500">{weather.updateAt}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-medium text-gray-800">{weather.temperature}</span>
              <span className="text-gray-600">{weather.text}</span>
            </div>
            <div className="text-sm text-gray-500">
              今日温度：{weather.today.low} ~ {weather.today.high}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 