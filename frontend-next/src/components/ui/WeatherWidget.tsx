'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  apparentTemperature: number;
  precipitation: number;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
}

// Open-Meteo Weather Codes
const getWeatherInfo = (code: number, isDay: boolean) => {
  const weatherMap: Record<number, { icon: React.ReactNode; label: string; color: string }> = {
    0: { icon: <Sun className="w-8 h-8" />, label: 'Cerah', color: 'text-amber-400' },
    1: { icon: <Sun className="w-8 h-8" />, label: 'Cerah Berawan', color: 'text-amber-400' },
    2: { icon: <Cloud className="w-8 h-8" />, label: 'Berawan Sebagian', color: 'text-slate-300' },
    3: { icon: <Cloud className="w-8 h-8" />, label: 'Berawan', color: 'text-slate-400' },
    45: { icon: <CloudFog className="w-8 h-8" />, label: 'Berkabut', color: 'text-slate-400' },
    48: { icon: <CloudFog className="w-8 h-8" />, label: 'Kabut Tebal', color: 'text-slate-500' },
    51: { icon: <CloudDrizzle className="w-8 h-8" />, label: 'Gerimis Ringan', color: 'text-blue-300' },
    53: { icon: <CloudDrizzle className="w-8 h-8" />, label: 'Gerimis', color: 'text-blue-400' },
    55: { icon: <CloudDrizzle className="w-8 h-8" />, label: 'Gerimis Lebat', color: 'text-blue-500' },
    61: { icon: <CloudRain className="w-8 h-8" />, label: 'Hujan Ringan', color: 'text-blue-400' },
    63: { icon: <CloudRain className="w-8 h-8" />, label: 'Hujan', color: 'text-blue-500' },
    65: { icon: <CloudRain className="w-8 h-8" />, label: 'Hujan Lebat', color: 'text-blue-600' },
    71: { icon: <CloudSnow className="w-8 h-8" />, label: 'Salju Ringan', color: 'text-cyan-300' },
    73: { icon: <CloudSnow className="w-8 h-8" />, label: 'Salju', color: 'text-cyan-400' },
    75: { icon: <CloudSnow className="w-8 h-8" />, label: 'Salju Lebat', color: 'text-cyan-500' },
    80: { icon: <CloudRain className="w-8 h-8" />, label: 'Hujan Lokal', color: 'text-blue-400' },
    81: { icon: <CloudRain className="w-8 h-8" />, label: 'Hujan Lokal', color: 'text-blue-500' },
    82: { icon: <CloudRain className="w-8 h-8" />, label: 'Hujan Lokal Lebat', color: 'text-blue-600' },
    95: { icon: <CloudLightning className="w-8 h-8" />, label: 'Badai Petir', color: 'text-purple-400' },
    96: { icon: <CloudLightning className="w-8 h-8" />, label: 'Badai + Hujan Es', color: 'text-purple-500' },
    99: { icon: <CloudLightning className="w-8 h-8" />, label: 'Badai Besar', color: 'text-purple-600' },
  };

  return weatherMap[code] || { icon: <Cloud className="w-8 h-8" />, label: 'Unknown', color: 'text-slate-400' };
};

interface WeatherWidgetProps {
  compact?: boolean;
  latitude?: number;
  longitude?: number;
  cityName?: string;
}

export default function WeatherWidget({ 
  compact = false,
  latitude = -6.2088,  // Jakarta default
  longitude = 106.8456,
  cityName = 'Jakarta'
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      setError(null);
      // Open-Meteo API - Free, no API key required
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,weather_code&timezone=auto&forecast_days=1`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch weather');
      
      const data = await response.json();
      
      setWeather({
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
        apparentTemperature: data.current.apparent_temperature,
        precipitation: data.current.precipitation
      });

      // Get next 6 hours forecast
      const currentHour = new Date().getHours();
      const hourlyData: HourlyForecast[] = [];
      for (let i = currentHour + 1; i <= currentHour + 6 && i < 24; i++) {
        hourlyData.push({
          time: `${i}:00`,
          temperature: data.hourly.temperature_2m[i],
          weatherCode: data.hourly.weather_code[i]
        });
      }
      setHourlyForecast(hourlyData);
    } catch (err) {
      setError('Gagal memuat data cuaca');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    fetchWeather();
    // Refresh every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  if (loading) {
    return (
      <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-center h-20 text-slate-400 text-sm">
          {error || 'Data tidak tersedia'}
        </div>
      </div>
    );
  }

  const weatherInfo = getWeatherInfo(weather.weatherCode, weather.isDay);

  // Compact version for sidebar or small spaces
  if (compact) {
    return (
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-3 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${weatherInfo.color} [&>svg]:w-6 [&>svg]:h-6`}>
              {weatherInfo.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-white">{Math.round(weather.temperature)}°C</p>
              <p className="text-xs text-slate-400">{weatherInfo.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">{cityName}</p>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <Droplets className="w-3 h-3" />
              <span>{weather.humidity}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full version for dashboard
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          <h3 className="text-white font-semibold">Cuaca {cityName}</h3>
        </div>
        <span className="text-xs text-slate-500">Open-Meteo API</span>
      </div>

      {/* Main Weather */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${weatherInfo.color}`}>
              {weatherInfo.icon}
            </div>
            <div>
              <p className="text-4xl font-bold text-white">{Math.round(weather.temperature)}°C</p>
              <p className="text-slate-400">{weatherInfo.label}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span>Terasa {Math.round(weather.apparentTemperature)}°</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>{weather.windSpeed} km/h</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span>{weather.precipitation} mm</span>
            </div>
          </div>
        </div>

        {/* Solar Energy Insight */}
        <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
          <div className="flex items-center gap-2">
            {weather.weatherCode <= 3 ? (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">
                  Kondisi baik untuk panel surya • Produksi optimal
                </span>
              </>
            ) : weather.weatherCode >= 61 ? (
              <>
                <TrendingDown className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400">
                  Cuaca mendung/hujan • Produksi solar berkurang
                </span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  Berawan sebagian • Produksi solar normal
                </span>
              </>
            )}
          </div>
        </div>

        {/* Hourly Forecast */}
        {hourlyForecast.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 mb-2">Prakiraan beberapa jam ke depan</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {hourlyForecast.map((hour, idx) => {
                const hourWeather = getWeatherInfo(hour.weatherCode, true);
                return (
                  <div 
                    key={idx} 
                    className="flex-shrink-0 bg-slate-800/50 rounded-lg p-2 text-center min-w-[60px]"
                  >
                    <p className="text-xs text-slate-400">{hour.time}</p>
                    <div className={`my-1 flex justify-center ${hourWeather.color}`}>
                      {React.cloneElement(hourWeather.icon as React.ReactElement, { className: 'w-5 h-5' })}
                    </div>
                    <p className="text-sm text-white font-medium">{Math.round(hour.temperature)}°</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
