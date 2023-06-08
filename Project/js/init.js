// Declare variables
let mapOptions = { 'center': [34.4208, -119.6982], 'zoom': 11.5 };

// Use the variables
const map = L.map('map').setView(mapOptions.center, mapOptions.zoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a function to add markers
function addMarker(lat, lng, message1, message2) {
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<h3>${message1}</h3><h3>${message2}</h3>`);
}

const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHNN772WiQdrmo-wtACIMvYencHdlL6qrR1DpW4CzouypvSAuKuPzddjsbTTPsab19JlFGS8tKXMOD/pub?output=csv';

function loadData(url) {
  Papa.parse(url, {
    header: true,
    download: true,
    complete: (results) => processData(results.data),
  });
}

function processData(data) {
  data.forEach((row) => {
    const { lat, lng, 'Please describe your experience.': message1, 'Why not?': message2 } = row;
    addMarker(parseFloat(lat), parseFloat(lng), message1, message2);
  });
}

loadData(dataUrl);
