// ============================================
// WEATHER APP - MAIN SCRIPT
// ============================================

// Global variables
let API_KEY = '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherCard = document.getElementById('weatherCard');
const errorDiv = document.getElementById('error');
const errorText = document.getElementById('errorText');

// Display Elements
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDesc = document.getElementById('weatherDesc');
const windSpeed = document.getElementById('windSpeed');
const humidity = document.getElementById('humidity');
const feelsLike = document.getElementById('feelsLike');

// ============================================
// 1. LOAD API KEY FROM CONFIG.JS
// ============================================
async function loadAPIKey() {
    console.log('🔍 Loading API key...');
    
    try {
        const module = await import('./config.js');
        API_KEY = module.default;
        
        if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || API_KEY.length < 20) {
            console.error('❌ Invalid API key in config.js');
            showError('Please add your OpenWeatherMap API key to config.js');
            return false;
        }
        
        console.log('✅ API Key loaded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error loading config.js:', error);
        showError(`
            <strong>Setup Required:</strong><br>
            1. Create <code>config.js</code> file in project folder<br>
            2. Add your OpenWeatherMap API key:<br>
            &nbsp;&nbsp;<code>const API_KEY = 'your_key_here';</code><br>
            &nbsp;&nbsp;<code>export default API_KEY;</code><br>
            3. Get free key from: <a href="https://openweathermap.org/api" target="_blank">openweathermap.org/api</a>
        `);
        return false;
    }
}

// ============================================
// 2. WEATHER FUNCTIONS
// ============================================
async function getWeather(city) {
    try {
        showLoading(true);
        
        const response = await fetch(
            `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        displayWeather(data);
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError(`City "${city}" not found. Try another city.`);
    } finally {
        showLoading(false);
    }
}

function displayWeather(data) {
    // Update all display elements
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = Math.round(data.main.temp);
    weatherDesc.textContent = data.weather[0].description;
    windSpeed.textContent = Math.round(data.wind.speed * 3.6); // m/s to km/h
    humidity.textContent = data.main.humidity;
    feelsLike.textContent = Math.round(data.main.feels_like);
    
    // Set weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    
    // Show weather card, hide error
    weatherCard.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    
    // Change background based on weather
    updateBackground(data.weather[0].main);
}

// ============================================
// 3. UI HELPER FUNCTIONS
// ============================================
function showError(message) {
    errorText.innerHTML = message;
    errorDiv.classList.remove('hidden');
    weatherCard.classList.add('hidden');
}

function showLoading(show) {
    if (show) {
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        searchBtn.disabled = true;
    } else {
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
        searchBtn.disabled = false;
    }
}

function updateBackground(weatherCondition) {
    const body = document.body;
    let gradient;
    
    switch(weatherCondition.toLowerCase()) {
        case 'clear':
            gradient = 'linear-gradient(135deg, #ffcc00, #ff9900)';
            break;
        case 'clouds':
            gradient = 'linear-gradient(135deg, #bdc3c7, #95a5a6)';
            break;
        case 'rain':
        case 'drizzle':
            gradient = 'linear-gradient(135deg, #2c3e50, #4a6491)';
            break;
        case 'snow':
            gradient = 'linear-gradient(135deg, #e6f2ff, #b3d9ff)';
            break;
        case 'thunderstorm':
            gradient = 'linear-gradient(135deg, #34495e, #2c3e50)';
            break;
        default:
            gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    body.style.background = gradient;
}

// ============================================
// 4. EVENT LISTENERS
// ============================================
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    } else {
        showError('Please enter a city name');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// ============================================
// 5. INITIALIZE APP
// ============================================
async function initApp() {
    console.log('🚀 Initializing Weather App...');
    
    // Load API key
    const keyLoaded = await loadAPIKey();
    
    if (keyLoaded) {
        console.log('✅ Weather App is ready!');
        
        // Auto-search for London on startup (optional)
        // getWeather('London');
        
    } else {
        console.log('⚠️ Waiting for API key setup...');
    }
}

// Start the app
initApp();

// ============================================
// 6. DEBUG HELPER (remove in production)
// ============================================
window.debugWeather = {
    testAPI: function() {
        if (API_KEY) {
            console.log('Testing API with key:', API_KEY.substring(0, 10) + '...');
            fetch(`${BASE_URL}?q=London&appid=${API_KEY}&units=metric`)
                .then(r => r.json())
                .then(d => console.log('API Test Result:', d))
                .catch(e => console.error('API Test Error:', e));
        } else {
            console.error('No API key loaded');
        }
    },
    showConfig: function() {
        console.log('Current API Key:', API_KEY ? 'Loaded (' + API_KEY.length + ' chars)' : 'Not loaded');
    }
};