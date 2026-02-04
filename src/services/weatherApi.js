// Weather API Service - Open-Meteo Integration (No API Key Required)
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Bangalore coordinates
const BANGALORE_COORDS = { lat: 12.9716, lon: 77.5946 };

export const fetchCurrentWeather = async (lat = BANGALORE_COORDS.lat, lon = BANGALORE_COORDS.lon) => {
    try {
        const response = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Asia/Kolkata`);
        const data = await response.json();
        const current = data.current_weather;

        return {
            temp: current.temperature,
            feels_like: current.temperature, // Open-Meteo current doesn't provide feels_like in simple current_weather
            humidity: data.hourly?.relative_humidity_2m?.[0] || 50,
            description: getWeatherDescription(current.weathercode),
            icon: getWeatherIcon(current.weathercode),
            wind_speed: current.windspeed,
            pressure: 1013, // Standard atmospheric pressure
            rain: 0
        };
    } catch (error) {
        console.error('Weather API error:', error);
        return {
            temp: 26,
            description: 'Clear',
            icon: '01d',
            humidity: 50,
            wind_speed: 10
        };
    }
};

export const fetchWeatherForecast = async (lat = BANGALORE_COORDS.lat, lon = BANGALORE_COORDS.lon) => {
    try {
        const response = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Asia/Kolkata`);
        const data = await response.json();

        return data.daily.time.map((date, i) => ({
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(data.daily.temperature_2m_max[i]),
            temp_max: Math.round(data.daily.temperature_2m_max[i]),
            temp_min: Math.round(data.daily.temperature_2m_min[i]),
            rain: data.daily.precipitation_sum[i],
            humidity: 60,
            icon: getWeatherIcon(data.daily.weathercode[i]),
            description: getWeatherDescription(data.daily.weathercode[i])
        }));
    } catch (error) {
        console.error('Forecast API error:', error);
        return [];
    }
};

export const getRainfallData = async (lat = BANGALORE_COORDS.lat, lon = BANGALORE_COORDS.lon) => {
    try {
        const response = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&timezone=Asia/Kolkata&past_days=30`);
        const data = await response.json();
        const rain = data.daily.precipitation_sum;

        return {
            last24h: rain[rain.length - 1],
            last7d: Math.round(rain.slice(-7).reduce((a, b) => a + b, 0) * 10) / 10,
            last30d: Math.round(rain.reduce((a, b) => a + b, 0) * 10) / 10
        };
    } catch (error) {
        return { last24h: 0, last7d: 0, last30d: 0 };
    }
};

export const getWeatherRiskFactors = async (lat = BANGALORE_COORDS.lat, lon = BANGALORE_COORDS.lon) => {
    try {
        const response = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_mean,precipitation_sum&timezone=Asia/Kolkata&past_days=30`);
        const data = await response.json();
        const rain = data.daily.precipitation_sum;
        const tempMax = data.daily.temperature_2m_max;
        const tempMean = data.daily.temperature_2m_mean;

        return {
            rainfall_30d_mm: Math.round(rain.reduce((a, b) => a + b, 0) * 10) / 10,
            rainfall_last7d_mm: Math.round(rain.slice(-7).reduce((a, b) => a + b, 0) * 10) / 10,
            heatwave_days_30d: tempMax.filter(t => t > 35).length,
            dry_spell_days_30d: rain.filter(r => r < 1.0).length,
            avg_temp_30d: Math.round((tempMean.reduce((a, b) => a + b, 0) / tempMean.length) * 10) / 10,
        };
    } catch (error) {
        return { rainfall_30d_mm: 0, heatwave_days_30d: 0, dry_spell_days_30d: 0, avg_temp_30d: 25 };
    }
};

// Helper to map WMO codes to descriptions
const getWeatherDescription = (code) => {
    const mapping = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    return mapping[code] || 'Clear';
};

// Map WMO codes to OpenWeatherMap style icons for UI compatibility
export const getWeatherIcon = (code) => {
    if (code === undefined) return '01d';
    if (code === 0) return '01d';
    if (code <= 3) return '02d';
    if (code <= 48) return '50d';
    if (code <= 55) return '09d';
    if (code <= 65) return '10d';
    if (code <= 75) return '13d';
    if (code <= 82) return '09d';
    return '11d';
};

export const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export const BANGALORE_DEFAULT_COORDS = BANGALORE_COORDS;
