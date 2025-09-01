// Save to localStorage
function saveWeatherToCache(key, data) {
  const cacheData = {
    timestamp: Date.now(),
    data: data
  };
  localStorage.setItem(key, JSON.stringify(cacheData));
}

// Load from localStorage (with expiry check, default 1 hour)
function loadWeatherFromCache(key, expiryMs = 3600000) {       
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const parsed = JSON.parse(cached);
  const isExpired = Date.now() - parsed.timestamp > expiryMs;

  if (isExpired) {
    localStorage.removeItem(key);
    return null;
  }

  return parsed.data;
}

// Fetch weather by coordinates
// Fetch weather by coordinates
async function getWeatherByCoords(latitude, longitude, locationName = "Your Location") {
  const cacheKey = `weather_${latitude}_${longitude}`;
  let data = loadWeatherFromCache(cacheKey);

  if (!data) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const response = await fetch(url);
    data = await response.json();

    saveWeatherToCache(cacheKey, data); // cache response
  }

  const forecast = data.daily.time.map((date, i) => ({
    date,
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    rainProbability: data.daily.precipitation_probability_max[i] // % chance of rain
  }));

  // Today’s weather
  const today = forecast[0];
  document.getElementById("todayWeather").innerHTML = `
    <p class="font-semibold text-lg">${today.date}</p>
    <p class="text-pink-400">🌡 Max: ${today.tempMax}°C</p>
    <p class="text-cyan-400">❄ Min: ${today.tempMin}°C</p>

    <p class="text-white text-sm mt-2">💧 Rain Probability</p>
    <div class="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
      <div class="bg-cyan-400 h-4" style="width: ${today.rainProbability}%;"></div>
    </div>
    <p class="text-xs text-gray-300 mt-1">${today.rainProbability}% chance of rain</p>
  `;

  // Forecast cards (from day 2 onwards)
  let html = '';
  forecast.slice(1).forEach(day => {
    html += `
      <div class="retro-border bg-gray-800 p-4 rounded-2xl shadow-lg flex-none 
            min-w-[150px] md:min-w-[180px] text-center neon-glow 
            snap-center transition transform hover:scale-105">
  <p class="font-semibold">${day.date}</p>
  <p class="text-pink-400">🌡 Max: ${day.tempMax}°C</p>
  <p class="text-cyan-400">❄ Min: ${day.tempMin}°C</p>
  
  <!-- Rain probability bar -->
  <div class="w-full bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
    <div class="bg-cyan-400 h-2" style="width: ${day.rainProbability}%;"></div>
  </div>
  <p class="text-xs text-gray-300 mt-1">${day.rainProbability}% rain</p>
</div>

    `;
  });

  document.getElementById("locationTitle").innerText = `7-Day Forecast for ${locationName}`;
  document.getElementById("result").innerHTML = html;
}

// Fetch coordinates for manual search
async function getCoordinates(place) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
      name: data.results[0].name,
      country: data.results[0].country,
    };
  }
  return null;
}

// Manual search
async function searchWeather() {
  const place = document.getElementById("placeInput").value.trim();
  if (!place) {
    alert("Please enter a city name!");
    return;
  }

  const location = await getCoordinates(place);
  if (!location) {
    document.getElementById("result").innerHTML = `<p class="text-red-400">❌ Location not found.</p>`;
    return;
  }

  getWeatherByCoords(location.latitude, location.longitude, `${location.name}, ${location.country}`);
}

// Automatic device location
function detectLocationWeather() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      error => {
        console.error("Location error:", error);
        document.getElementById("result").innerHTML =
          `<p class="text-red-400">Unable to get your location. Please search manually.</p>`;
      }
    );
  } else {
    document.getElementById("result").innerHTML =
      `<p class="text-red-400">Geolocation not supported by your browser.</p>`;
  }
}

// Run on page load
window.onload = detectLocationWeather;
