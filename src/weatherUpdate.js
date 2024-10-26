import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Droplets, Wind, Search } from 'lucide-react';

const API_KEY = '2deb3055fa20042abf812bd18f267b0c';

const WeatherUpdate = () => {
    const [weather, setWeather] = useState({
      temperature: 0,
      condition: '',
      location: '',
      humidity: 0,
      windSpeed: 0,
      localTime: '',
    });
    const [forecast, setForecast] = useState([]);
    const [searchCity, setSearchCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const getWeatherIcon = (condition) => {
      switch (condition) {
        case 'Clear':
          return <Sun className="w-16 h-16 md:w-24 md:h-24 text-yellow-500" />;
        case 'Clouds':
          return <Cloud className="w-16 h-16 md:w-24 md:h-24 text-gray-500" />;
        case 'Rain':
        case 'Drizzle':
        case 'Thunderstorm':
          return <CloudRain className="w-16 h-16 md:w-24 md:h-24 text-blue-500" />;
        default:
          return <Cloud className="w-16 h-16 md:w-24 md:h-24 text-gray-500" />;
      }
    };
  
    const getBackgroundClass = (condition) => {
      switch (condition) {
        case 'Clear':
          return 'bg-gradient-to-b from-blue-400 to-yellow-200';
        case 'Clouds':
          return 'bg-gradient-to-b from-gray-400 to-gray-300';
        case 'Rain':
        case 'Drizzle':
        case 'Thunderstorm':
          return 'bg-gradient-to-b from-gray-700 to-gray-500';
        default:
          return 'bg-gradient-to-b from-blue-200 to-blue-100';
      }
    };
  
    const fetchWeatherData = async (city) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('City not found');
      }
      const data = await response.json();
  
      // Calculate local time based on timezone offset from UTC
      const currentUTC = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
      const localTime = new Date(currentUTC + data.timezone * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
  
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        location: data.name,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        localTime, // Set the calculated local time
      };
    };
  
    const fetchForecastData = async (city) => {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Forecast data not available');
      }
      const data = await response.json();
      const dailyData = data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));
      return dailyData.map((day) => ({
        day: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temperature: Math.round(day.main.temp),
        condition: day.weather[0].main,
      })).slice(0, 5);
    };
  
    const handleSearch = async (e) => {
      e.preventDefault();
      if (searchCity.trim() !== '') {
        setLoading(true);
        setError(null);
        try {
          const weatherData = await fetchWeatherData(searchCity);
          setWeather(weatherData);
          const forecastData = await fetchForecastData(searchCity);
          setForecast(forecastData);
          setSearchCity('');
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };
  
    useEffect(() => {
      handleSearch({ preventDefault: () => {}, target: { city: { value: 'London' } } });
    }, []);
  
    return (
      <div className={`min-h-screen ${getBackgroundClass(weather.condition)} text-gray-800 transition-colors duration-500`}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center text-white shadow-text">Weather Update</h1>
          
          <form onSubmit={handleSearch} className="mb-12 flex justify-center">
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Enter city name"
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
  
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
  
          {loading ? (
            <p className="text-center text-white text-xl">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="flex flex-col items-center justify-center">
                  {getWeatherIcon(weather.condition)}
                  <p className="text-2xl mt-4 text-white shadow-text">{weather.condition}</p>
                  <p className="text-xl mt-2 text-white shadow-text">Local Time: {weather.localTime}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-6xl md:text-7xl font-bold text-white shadow-text">{weather.temperature}°C</p>
                  <p className="text-2xl md:text-3xl mt-4 text-white shadow-text">{weather.location}</p>
                </div>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="flex items-center justify-center bg-white bg-opacity-20 p-6 rounded-lg">
                  <Droplets className="w-12 h-12 text-blue-200 mr-4" />
                  <div>
                    <p className="text-lg text-white shadow-text">Humidity</p>
                    <p className="text-3xl font-semibold text-white shadow-text">{weather.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-center bg-white bg-opacity-20 p-6 rounded-lg">
                  <Wind className="w-12 h-12 text-blue-200 mr-4" />
                  <div>
                    <p className="text-lg text-white shadow-text">Wind Speed</p>
                    <p className="text-3xl font-semibold text-white shadow-text">{weather.windSpeed} km/h</p>
                  </div>
                </div>
              </div>
  
              <h2 className="text-3xl font-bold mb-4 text-center text-white shadow-text">5-Day Forecast</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {forecast.map((day, index) => (
                  <div key={index} className="bg-white bg-opacity-20 p-4 rounded-lg text-center">
                    <p className="text-lg font-semibold text-white shadow-text">{day.day}</p>
                    {getWeatherIcon(day.condition)}
                    <p className="text-xl font-bold mt-2 text-white shadow-text">{day.temperature}°C</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  export default WeatherUpdate;