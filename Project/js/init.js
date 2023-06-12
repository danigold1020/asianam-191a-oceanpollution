// Enyi's Code


// // Declare variables
// let mapOptions = { 'center': [34.4208, -119.6982], 'zoom': 11.5 };


// // Use the variables
// const map = L.map('map').setView(mapOptions.center, mapOptions.zoom);


// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);


// // Create a function to add markers
// function addMarker(lat, lng, message1, message2) {
//   L.marker([lat, lng])
//     .addTo(map)
//     .bindPopup(`<h3>${message1}</h3><h3>${message2}</h3>`);
// }


// const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHNN772WiQdrmo-wtACIMvYencHdlL6qrR1DpW4CzouypvSAuKuPzddjsbTTPsab19JlFGS8tKXMOD/pub?output=csv';


// function loadData(url) {
//   Papa.parse(url, {
//     header: true,
//     download: true,
//     complete: (results) => processData(results.data),
//   });
// }


// function processData(data) {
//   data.forEach((row) => {
//     const { lat, lng, 'Please describe your experience.': message1, 'Why not?': message2 } = row;
//     addMarker(parseFloat(lat), parseFloat(lng), message1, message2);
//   });
// }


// loadData(dataUrl);


// declare variables




// Danielle's Code


let mapOptions = {'center': [34.4208, -119.6982],'zoom': 11.5};


let positive = L.featureGroup();
let neutral = L.featureGroup();
let negative = L.featureGroup();


let layers = {
   "Positive <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='green' /></svg>": positive,
   "Neutral <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='blue' /></svg>": neutral,
   "Negative <svg height='10' width='10'><circle cx='5' cy='5' r='4' stroke='black' stroke-width='1' fill='red' /></svg>": negative
 }


let circleOptions = {
   radius: 4,
   fillColor: "#ff7800",
   color: "#000",
   weight: 1,
   opacity: 1,
   fillOpacity: 0.8
};


const dataUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHNN772WiQdrmo-wtACIMvYencHdlL6qrR1DpW4CzouypvSAuKuPzddjsbTTPsab19JlFGS8tKXMOD/pub?output=csv";




const positiveLegendHTML = document.getElementById("positiveCheckbox");
const neutralLegendHTML = document.getElementById("neutralCheckbox");
const negativeLegendHTML = document.getElementById("negativeCheckbox");


const map = L.map('map').setView(mapOptions.center, mapOptions.zoom);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// add layer control box
// L.control.layers(null,layers,{collapsed:false}).addTo(map)


function addMarker(data){
   if(data['How would you describe your overall experience in civic engagement?'] == "Positive"){
       circleOptions.fillColor = "green"
       positive.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(`<h2>Positive</h2>`))
       createButtons(data.lat,data.lng,data['What is the zip code of your residence in Santa Barbara?'])
       }
   if(data['How would you describe your overall experience in civic engagement?'] == "Neutral"){
       circleOptions.fillColor = "yellow"
       neutral.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(`<h2>Neutral</h2>`))
       createButtons(data.lat,data.lng,data['What is the zip code of your residence in Santa Barbara?'])
       }
   else{
       circleOptions.fillColor = "red"
       negative.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(`<h2>Negative</h2>`))
       createButtons(data.lat,data.lng,data['What is the zip code of your residence in Santa Barbara?'])


   }
   return data
}


function createButtons(lat,lng,title){
   const newButton = document.createElement("button"); // adds a new button
   newButton.id = "button"+title; // gives the button a unique id
   newButton.innerHTML = title; // gives the button a title
   newButton.setAttribute("lat",lat); // sets the latitude
   newButton.setAttribute("lng",lng); // sets the longitude
   newButton.addEventListener('click', function(){
       map.flyTo([lat,lng]); //this is the flyTo from Leaflet
   })
   const spaceForButtons = document.getElementById('placeForButtons')
   spaceForButtons.appendChild(newButton);//this adds the button to our page.
}


function loadData(url){
   Papa.parse(url, {
       header: true,
       download: true,
       complete: results => processData(results)
   })
};


function processData(results){
   console.log(results)
   results.data.forEach(data => {
       console.log(data)
       addMarker(data)
   })
   positive.addTo(map) // add our layers after markers have been made
   neutral.addTo(map) // add our layers after markers have been made
   negative.addTo(map) // add our layers after markers have been made
   let allLayers = L.featureGroup([positive,neutral,negative]);
   map.fitBounds(allLayers.getBounds());
};


loadData(dataUrl)


// toggle the legend for positiveLegend grouplayer
positiveLegendHTML.addEventListener("click",togglePositiveLayer)


function togglePositiveLayer(){
   if(map.hasLayer(positive)){
       map.removeLayer(positive)
   }
   else{
       map.addLayer(positive)
   }
}


// add the event listener for the click
neutralLegendHTML.addEventListener("click",toggleNeutralLayer)

// toggle the legend for neutralLegend grouplayer
function toggleNeutralLayer(){
  if(map.hasLayer(neutral)){
      map.removeLayer(neutral)
  }
  else{
      map.addLayer(neutral)
  }
}




// add the event listener for the click
negativeLegendHTML.addEventListener("click",toggleNegativeLayer)


// toggle the legend for negativeLegend grouplayer
function toggleNegativeLayer(){
  if(map.hasLayer(negative)){
      map.removeLayer(negative)
  }
  else{
      map.addLayer(negative)
  }
}




