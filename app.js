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
                color: 'red', 
                weight: 1, 
                fillColor: 'rgba(255,255,255,1)', 
                fillOpacity: 1 
            };
        }
    }).addTo(map);
}

function closePopup() {
    const popup = document.getElementById("start-popup")
    popup.style.display = 'none';
}

getData();
