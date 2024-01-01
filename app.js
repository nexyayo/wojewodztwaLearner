let geojsonLayer;
const interface = document.getElementById("interface")
interface.style.display = 'none';

var map = L.map('map', {
    center: [52.13, 19.29],
    zoom: 6,
    dragging: false,
    tap: false,
    labels: false,
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 6,
    maxZoom: 6,
    labels: '',
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

async function getData() {
    const response = await fetch("https://raw.githubusercontent.com/ppatrzyk/polska-geojson/master/wojewodztwa/wojewodztwa-max.geojson");
    const data = await response.json();

    L.geoJSON(data, {
        style: function(feature) {
            return {
                color: 'black', 
                weight: 1, 
                fillColor: 'rgba(255,255,255,1)', 
                fillOpacity: 1 
            };
        }
    }).addTo(map);
}

const provinces = [
    { name: 'Dolnośląskie' },
    { name: 'Kujawsko-Pomorskie' },
    { name: 'Lubelskie' },
    { name: 'Lubuskie' },
    { name: 'Łódzkie' },
    { name: 'Małopolskie' },
    { name: 'Mazowieckie' },
    { name: 'Opolskie' },
    { name: 'Podkarpackie' },
    { name: 'Podlaskie' },
    { name: 'Pomorskie' },
    { name: 'Śląskie' },
    { name: 'Świętokrzyskie' },
    { name: 'Warmińsko-Mazurskie' },
    { name: 'Wielkopolskie' },
    { name: 'Zachodniopomorskie' },
];

let remainingProvinces = [...provinces];
let guessedProvinces = []; 
let currentProvince;

function getRandomProvince() {
    remainingProvinces = remainingProvinces.filter(
        prov => !guessedProvinces.includes(prov.name.toLowerCase())
    );

    if (remainingProvinces.length === 0) {
        resetGame();
        return;
    }

    const randomIndex = Math.floor(Math.random() * remainingProvinces.length);
    currentProvince = remainingProvinces[randomIndex];

    const provinceName = currentProvince.name;
    document.getElementById('province-name').innerHTML = provinceName;
}

async function startGame() {
    const generateButton = document.getElementById('generate-button');

    document.getElementById('score').textContent = '0'; 

    generateButton.textContent = 'Zrestartuj';
    await getRandomProvince();

    if (!geojsonLayer) {
        const response = await fetch("https://raw.githubusercontent.com/ppatrzyk/polska-geojson/master/wojewodztwa/wojewodztwa-max.geojson");
        const data = await response.json();


        geojsonLayer = L.geoJSON(data, {
            style: function(feature) {
                return {
                    color: 'black', 
                    weight: 1, 
                    fillColor: 'rgba(255,255,255,1)', 
                    fillOpacity: 1 
                };
            },
            onEachFeature: function(feature, layer) {
                console.log(feature); 
            
                layer.on('click', function(e) {
                    const clickedProvinceName = e.target.feature.properties.nazwa.toLowerCase();
                    if (clickedProvinceName === currentProvince.name.toLowerCase()) {
                        highlightProvince(e.target, 'green');
                    } else {
                        highlightProvince(e.target, 'red');
                    }
                });
            }
        }).addTo(map);
    }  else {
        geojsonLayer.setStyle({ fillColor: 'rgba(255,255,255,1)' });
        geojsonLayer.eachLayer(layer => {
            const layerProvinceName = layer.feature.properties.nazwa.toLowerCase();
            if (guessedProvinces.includes(layerProvinceName)) {
                layer.off('click');
            } else {
                layer.on('click', function (e) {
                    const clickedProvinceName = e.target.feature.properties.nazwa.toLowerCase();
                    if (clickedProvinceName === currentProvince.name.toLowerCase()) {
                        highlightProvince(e.target, 'green');
                    } else {
                        highlightProvince(e.target, 'red');
                    }
                });
            }
        });
    }
}

function highlightProvince(province, color) {
    const provinceName = province.feature.properties.nazwa.toLowerCase();

    if (!guessedProvinces.includes(provinceName)) {
        if (color === 'green') {
            guessedProvinces.push(provinceName);

            const scoreElement = document.getElementById('score');
            const currentScore = parseInt(scoreElement.textContent, 10);
            const newScore = currentScore + 1;
            scoreElement.textContent = newScore;

            const maxProvinces = document.getElementById('max').textContent;
            if (newScore > parseInt(maxProvinces, 10)) {
                document.getElementById('max').textContent = newScore;
            }
        }
        province.setStyle({ fillColor: color });

        if (guessedProvinces.length === provinces.length) {
            resetGame();
        } else if (color === 'green') {
            getRandomProvince();
        }
    }
}
function checkResetConditions() {
    const allProvinces = geojsonLayer.getLayers();
    const allRed = allProvinces.every(province => {
        const provinceName = province.feature.properties.nazwa.toLowerCase();
        return guessedProvinces.includes(provinceName) || province.options.fillColor === 'red';
    });

    if (allRed) {
        resetGame();
    }
}

function resetGame() {
    guessedProvinces = [];
    remainingProvinces = [...provinces];

    alert('KONIEC GRY');
    geojsonLayer.resetStyle(); 

    document.getElementById('province-name').innerHTML = ''; 
    document.getElementById('score').innerHTML = 0;
}

document.getElementById('generate-button').addEventListener('click', startGame);

function closePopup() {
    const popup = document.getElementById("start-popup")
    const interface = document.getElementById("interface")

    interface.style.display = 'block';
    popup.style.display = 'none';
}

getData();
