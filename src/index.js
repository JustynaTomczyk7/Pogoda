import './style.css';

init();
setInterval(actualTime, 1000 * 30);
actualTime();
google.charts.load('current',{packages:['corechart']});

async function init() {
    const coordinates = await getPosition();
    const cityName = await getCityName(coordinates.lat, coordinates.lon);
    const currentWeather = await getCurrentWeatherData(coordinates.lat, coordinates.lon);
    const dailyForecast = await getDailyForecastData(coordinates.lat, coordinates.lon);

    displayCityName(cityName);
    displayCurrentWeather(currentWeather);
    displayDailyForecast(dailyForecast);
    google.charts.setOnLoadCallback(showChart(dailyForecast));
}

function showChart(d) {
    let dataTab = [['Godzina', 'Temperatura'], ];
    for (let i=0; i<10; i++) {
        let timeData = new Date(d.list[i].dt_txt);
        let time = timeData.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        });
        let temperature = d.list[i].main.temp;
        let temp = Math.round(temperature * 10) / 10;
        dataTab.push([time, temp]);
    }
    let data = google.visualization.arrayToDataTable(dataTab);
    let options = {
    legend: 'none',
    vAxis: {title: 'Temperatura'},
    pointSize: 4,
    backgroundColor: { fill:'transparent' },
    };
    let chart = new google.visualization.LineChart(document.querySelector('#myChart'));
    chart.draw(data, options);
}

function getDailyForecastData(lat, lon) {
    return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=202e8f8809d686fbabf4154bdca7779a&units=metric&lang=pl`)
        .then((response) => response.json())
        .then((data) => data);
}

function getCurrentWeatherData(lat, lon) {
    return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=202e8f8809d686fbabf4154bdca7779a&units=metric&lang=pl`)
        .then((response) => response.json())
        .then((data) => data);
}

function getCityName(lat, lon) {
    return fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pl`)
        .then((response) => response.json())
        .then((data) => data.city);
}

function getPosition() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                resolve({
                    lat,
                    lon,
                })
            }, () => {
                alert("Zezwól przeglądarce na pobranie swojej lokalizacji.");
            })
        } else {
            alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
            reject();
        }
    });
}

function displayDailyForecast(data) {
    const weekday1 = document.querySelector("#weekday1");
    const weekday2 = document.querySelector("#weekday2");
    const weekday3 = document.querySelector("#weekday3");
    const weekday4 = document.querySelector("#weekday4");
    const weekdays = [weekday1, weekday2, weekday3, weekday4];

    const iconDay1 = document.querySelector('#img-day1');
    const iconDay2 = document.querySelector('#img-day2');
    const iconDay3 = document.querySelector('#img-day3');
    const iconDay4 = document.querySelector('#img-day4');
    const icons = [iconDay1, iconDay2, iconDay3, iconDay4];

    const degreeDay1 = document.querySelector('#degree-day1');
    const degreeDay2 = document.querySelector('#degree-day2');
    const degreeDay3 = document.querySelector('#degree-day3');
    const degreeDay4 = document.querySelector('#degree-day4');
    const degreeDays = [degreeDay1, degreeDay2, degreeDay3, degreeDay4];

    const degreeNight1 = document.querySelector('#degree-night1');
    const degreeNight2 = document.querySelector('#degree-night2');
    const degreeNight3 = document.querySelector('#degree-night3');
    const degreeNight4 = document.querySelector('#degree-night4');
    const degreeNights = [degreeNight1, degreeNight2, degreeNight3, degreeNight4];

    const day1 = [];
    const day2 = [];
    const day3 = [];
    const day4 = [];

    data.list.forEach((data) => {
        let today = new Date()
        let date = new Date(data.dt_txt);
        let weekdayName = date.toLocaleDateString(undefined, { weekday: 'long' });
        let temp = data.main.temp
        let icon = data.weather[0].icon;

        if(today.getDate() +1 === date.getDate()) {
            day1.push({ temp, icon, weekdayName });
        } else if(today.getDate() +2 === date.getDate()) {
            day2.push({ temp, icon, weekdayName });
        } else if(today.getDate() +3 === date.getDate()) {
            day3.push({ temp, icon, weekdayName });
        } else if(today.getDate() +4 === date.getDate()) {
            day4.push({ temp, icon, weekdayName });
        }
    })

    const days = [day1, day2, day3, day4];

    for (let i=0; i<4; i++) {

        const highestPredictTemp = days[i].reduce(
            (prev, current) => {
                return prev.temp > current.temp ? prev : current
            }
        );

        const lowestPredictTemp = days[i].reduce(
            (prev, current) => {
                return prev.temp < current.temp ? prev : current
            }
        );

        degreeDays[i].innerHTML = Math.round(highestPredictTemp.temp);
        degreeNights[i].innerHTML = Math.round(lowestPredictTemp.temp);
        weekdays[i].innerHTML = highestPredictTemp.weekdayName;
        icons[i].setAttribute('src', `http://openweathermap.org/img/wn/${highestPredictTemp.icon}@2x.png`);
    }   
}

function displayCurrentWeather(data) {
    const iconToday = document.querySelector('#today-icon');
    const degreeToday = document.querySelector('#degree-today');
    const feelsLike = document.querySelector('#feels-like');
    const clouds = document.querySelector('#clouds');
    const humidity = document.querySelector('#humidity');
    const wind = document.querySelector('#wind');
    const windKmH = data.wind.speed * 3.6;

    iconToday.setAttribute('src', `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
    degreeToday.innerHTML = Math.round(data.main.temp);
    feelsLike.innerHTML = Math.round(data.main.feels_like);
    clouds.innerHTML = data.clouds.all;
    humidity.innerHTML = data.main.humidity;
    wind.innerHTML = Math.round(windKmH);
}

function displayCityName(cityName) {
    const city = document.querySelector('#city-name');
    city.innerHTML = cityName;
}

function actualTime() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.querySelector("#date").innerHTML = `${today.toLocaleDateString(undefined, options)}`;
    document.querySelector("#time").innerHTML = `${today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

