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
const getWeatherInfo = (code: number, _isDay: boolean) => {
  const weatherMap: Record<number, { icon: React.ReactNode; label: string; color: string }> = {
    0: { icon: <Sun className="w-7 h-7" />, label: 'Cerah', color: 'text-amber-400' },
    1: { icon: <Sun className="w-7 h-7" />, label: 'Cerah Berawan', color: 'text-amber-400' },
    2: { icon: <Cloud className="w-7 h-7" />, label: 'Berawan Sebagian', color: 'text-slate-300' },
    3: { icon: <Cloud className="w-7 h-7" />, label: 'Berawan', color: 'text-slate-400' },
    45: { icon: <CloudFog className="w-7 h-7" />, label: 'Berkabut', color: 'text-slate-400' },
    48: { icon: <CloudFog className="w-7 h-7" />, label: 'Kabut Tebal', color: 'text-slate-500' },
    51: { icon: <CloudDrizzle className="w-7 h-7" />, label: 'Gerimis Ringan', color: 'text-sky-300' },
    53: { icon: <CloudDrizzle className="w-7 h-7" />, label: 'Gerimis', color: 'text-sky-400' },
    55: { icon: <CloudDrizzle className="w-7 h-7" />, label: 'Gerimis Lebat', color: 'text-sky-500' },
    61: { icon: <CloudRain className="w-7 h-7" />, label: 'Hujan Ringan', color: 'text-sky-400' },
    63: { icon: <CloudRain className="w-7 h-7" />, label: 'Hujan', color: 'text-sky-500' },
    65: { icon: <CloudRain className="w-7 h-7" />, label: 'Hujan Lebat', color: 'text-sky-600' },
    71: { icon: <CloudSnow className="w-7 h-7" />, label: 'Salju Ringan', color: 'text-sky-200' },
    73: { icon: <CloudSnow className="w-7 h-7" />, label: 'Salju', color: 'text-sky-300' },
    75: { icon: <CloudSnow className="w-7 h-7" />, label: 'Salju Lebat', color: 'text-sky-400' },
    80: { icon: <CloudRain className="w-7 h-7" />, label: 'Hujan Lokal', color: 'text-sky-400' },
    81: { icon: <CloudRain className="w-7 h-7" />, label: 'Hujan Lokal', color: 'text-sky-500' },
    82: { icon: <CloudRain className="w-7 h-7" />, label: 'Hujan Lokal Lebat', color: 'text-sky-600' },
    95: { icon: <CloudLightning className="w-7 h-7" />, label: 'Badai Petir', color: 'text-amber-500' },
    96: { icon: <CloudLightning className="w-7 h-7" />, label: 'Badai & Hujan Es', color: 'text-amber-500' },
    99: { icon: <CloudLightning className="w-7 h-7" />, label: 'Badai Besar', color: 'text-rose-500' },
  };

  return weatherMap[code] || { icon: <Cloud className="w-7 h-7" />, label: 'Berawan', color: 'text-slate-400' };
};

interface WeatherWidgetProps {
  compact?: boolean;
  latitude?: number;
  longitude?: number;
  cityName?: string;
}

export default function WeatherWidget({ 
  compact = false,
  latitude = -5.4500,  // Bandarlampung default
  longitude = 105.2667,
  cityName = 'Bandarlampung'
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      setError(null);
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
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  if (loading) {
    return (
      <div className={`glass-card ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-center h-28">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-emerald-400"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`glass-card ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-center h-28 text-aeter-ink-soft text-xs">
          {error || 'Data tidak tersedia'}
        </div>
      </div>
    );
  }

  const weatherInfo = getWeatherInfo(weather.weatherCode, weather.isDay);

  if (compact) {
    return (
      <div className="glass-card p-3 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`${weatherInfo.color} [&>svg]:w-5 [&>svg]:h-5`}>
              {weatherInfo.icon}
            </div>
            <div>
              <p className="text-lg font-bold font-mono tabular-nums text-white">{Math.round(weather.temperature)}°C</p>
              <p className="text-[11px] text-aeter-ink-soft">{weatherInfo.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-aeter-ink font-medium">{cityName}</p>
            <div className="flex items-center gap-1 text-[11px] text-aeter-ink-soft mt-0.5 justify-end">
              <Droplets className="w-3 h-3 text-sky-400" />
              <span className="font-mono tabular-nums">{weather.humidity}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-white">{cityName} Weather</h3>
        </div>
        <span className="text-[10px] text-aeter-ink-mute font-mono">Open-Meteo</span>
      </div>

      {/* Main Weather */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${weatherInfo.color}`}>
              {weatherInfo.icon}
            </div>
            <div>
              <p className="text-2xl font-bold font-mono tabular-nums text-white">
                {Math.round(weather.temperature)}°C
              </p>
              <p className="text-xs text-aeter-ink-soft">{weatherInfo.label}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-white font-medium">{cityName}</p>
            <p className="text-[11px] text-aeter-ink-soft font-mono">
              Terasa {Math.round(weather.apparentTemperature)}°C
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/8">
          <div className="flex items-center gap-2 text-aeter-ink-soft">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono tabular-nums">{Math.round(weather.apparentTemperature)}°C RealFeel</span>
          </div>
          <div className="flex items-center gap-2 text-aeter-ink-soft">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono tabular-nums">{weather.humidity}% Lembap</span>
          </div>
          <div className="flex items-center gap-2 text-aeter-ink-soft">
            <Wind className="w-3.5 h-3.5 text-sky-300" />
            <span className="font-mono tabular-nums">{weather.windSpeed} km/h Angin</span>
          </div>
          <div className="flex items-center gap-2 text-aeter-ink-soft">
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono tabular-nums">{weather.precipitation} mm Curah</span>
          </div>
        </div>

        {/* Solar Energy Insight */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/8">
          <div className="flex items-center gap-2 text-xs">
            {weather.weatherCode <= 3 ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-400 font-medium">
                  Kondisi cerah, produksi solar optimal
                </span>
              </>
            ) : weather.weatherCode >= 61 ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-amber-400 font-medium">
                  Hujan / berawan tebal, estimasi solar menurun
                </span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-aeter-ink-soft flex-shrink-0" />
                <span className="text-aeter-ink-soft">
                  Berawan sebagian, produksi solar normal
                </span>
              </>
            )}
          </div>
        </div>

        {/* Hourly Forecast */}
        {hourlyForecast.length > 0 && (
          <div className="pt-1">
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
              {hourlyForecast.map((hour, idx) => {
                const hourWeather = getWeatherInfo(hour.weatherCode, true);
                return (
                  <div 
                    key={idx} 
                    className="flex-shrink-0 bg-white/5 border border-white/5 rounded-xl px-2 py-1.5 text-center min-w-[52px]"
                  >
                    <p className="text-[10px] text-aeter-ink-mute font-mono">{hour.time}</p>
                    <div className={`my-1 flex justify-center ${hourWeather.color}`}>
                      {React.cloneElement(hourWeather.icon as React.ReactElement, { className: 'w-4 h-4' })}
                    </div>
                    <p className="text-xs text-white font-mono tabular-nums font-medium">{Math.round(hour.temperature)}°</p>
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
