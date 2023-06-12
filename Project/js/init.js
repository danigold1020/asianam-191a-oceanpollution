// Declare variables
let mapOptions = { 'center': [34.5027, -120.0360], 'zoom': 11.5 };

// define the leaflet map
const map = L.map('map').setView(mapOptions.center, mapOptions.zoom);

// add layer control box

// Use the variables


let Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 12
  
});

Esri_WorldGrayCanvas.addTo(map);

// Create a function to add markers -> needs to be a loop to loop through survey stories
function addMarker(lat, lng, message1, message2) {
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<h3>${message1}</h3><h3>${message2}</h3>`);
}

const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHNN772WiQdrmo-wtACIMvYencHdlL6qrR1DpW4CzouypvSAuKuPzddjsbTTPsab19JlFGS8tKXMOD/pub?output=csv';
const boundaryLayer = 'Project/geojson/sb_zipcodes.geojson';

function loadData(url) {
  Papa.parse(url, {
    header: true,
    download: true,
    complete: (results) => {
      processData(results.data);
      loadBoundaryLayer();
    },
  });
}

function processData(data) {
  data.forEach((row) => {
    const { lat, lng, 'Please describe your experience.': message1, 'Why not?': message2 } = row;
    addMarker(parseFloat(lat), parseFloat(lng), message1, message2);
  });
}

function loadBoundaryLayer() {
  fetch(boundaryLayer)
    .then((response) => response.json())
    .then((sbzipcodesGeojson) => {
      const tileIndex = geojsonvt(sbzipcodesGeojson);
      const tileOptions = {
        maxZoom: 2,
      };
      const vectorTileLayer = L.vectorGrid.slicer(tileIndex, tileOptions);
      vectorTileLayer.addTo(map);
    });
}

loadData(dataUrl);

// Add this script at the end to show the modal on page load
document.addEventListener('DOMContentLoaded', (event) => {
  const modal = document.getElementById('myModal');
  modal.style.display = 'block';

  const closeModal = () => {
    modal.style.display = 'none';
  };

  const closeButton = modal.querySelector('.close');
  closeButton.addEventListener('click', closeModal);

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
});
