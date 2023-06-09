// Declare variables
let mapOptions = {
  'center': [34.5027, -120.0360],
  'zoom': 10.45
};

// Define the leaflet map
const map = L.map('map').setView(mapOptions.center, mapOptions.zoom);
const boundaryLayer = './geojson/sbzipcodes.geojson';
let boundary; // Placeholder for the data
let collected; // Variable for turf.js collected points
let allPoints = []; // Array for all the data points

// Use the variables
let Jawg_Light = L.tileLayer('https://{s}.tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
	attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 22,
	subdomains: 'abcd',
	accessToken: 'FkWnkf1e22dnL71CnkeDRnZeEZRyPNd6DqNr2frT4o5zPMcnKvgfcgG2gQCNjnR7'
});
Jawg_Light.addTo(map)
let pos = L.featureGroup();
let neg = L.featureGroup();
let neu = L.featureGroup();
let no = L.featureGroup();
// define layers
let layers = {
  "Positive Experience": pos,
  "Negative Experience": neg,
  "Neutral Experience": neu,
  "No Experience" : no
}
// Add layer control box
L.control.layers(null,layers).addTo(map)


function addMarker(thisRow) {
  let surveyZip = thisRow['What is the zip code of your residence in Santa Barbara?'];
  let why = thisRow['What led you to participate in civic engagement?']
  let surveyData = {
    "surveyZip": surveyZip,
    "Experienced": thisRow['Have you participated in civic engagement (e.g. public hearings, town hall meetings, etc.) involving oil spills in the Santa Barbara community?'],
    "why": thisRow['What led you to participate in civic engagement? '],
    "surveyNo": thisRow['Why not?'],
    "feels": thisRow['How would you describe your overall experience in civic engagement?'],
    "participateDesc": thisRow['Please describe your experience.'],}
  
//create turfJS point
let thisPoint = turf.point([Number(thisRow.lng), Number(thisRow.lat)], {surveyData})
console.log(thisPoint)
// Put all the turfJS points into `allPoints`
allPoints.push(thisPoint);

if(thisRow['How would you describe your overall experience in civic engagement?'] == "Positive"){ 

 let marker = L.circleMarker([thisRow.lat,thisRow.lng],
       {"radius": 8,
       "color": "#228B22",
       "weight": 3,
       "opacity": 500})
       console.log(pos); // Check if pos feature group contains markers
pos.addLayer(marker).bindPopup("Positive marker popup content")

}
else if (thisRow['How would you describe your overall experience in civic engagement?'] == "Negative"){let marker = L.circleMarker([thisRow.lat,thisRow.lng],
  {"radius": 8,
  "color": "#FF6961",
  "weight": 3,
  "opacity": 300})
neg.addLayer(marker).bindPopup("Negative marker popup content")}

else if (thisRow['How would you describe your overall experience in civic engagement?'] == "Neutral"){let marker = L.circleMarker([thisRow.lat,thisRow.lng],
  {"radius": 8,
  "color": "#00008B",
  "weight": 3,
  "opacity": 300})
neu.addLayer(marker).bindPopup("Neutral marker popup content")
console.log(neu)
}
else if (thisRow['How would you describe your overall experience in civic engagement?'] == "No"){let marker = L.circleMarker([thisRow.lat,thisRow.lng],
  {"radius": 8,
  "color": "#964B00",
  "weight": 3,
  "opacity": 300})
no.addLayer(marker).bindPopup("No marker popup content")
console.log(no)
}
return
}

const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHNN772WiQdrmo-wtACIMvYencHdlL6qrR1DpW4CzouypvSAuKuPzddjsbTTPsab19JlFGS8tKXMOD/pub?output=csv'

function loadData(url){
  Papa.parse(url, {
    header: true,
    download: true,
    complete: results => processData(results.data)
    })
};

function processData(data){
  //console.log('Data:', results); 
  data.forEach((thisRow) => {
    console.log('lat:', thisRow.lat);
    console.log('lng:', thisRow.lng);
    console.log('feels:', thisRow['How would you describe your overall experience in civic engagement?'])
    console.log(thisRow)
    addMarker(thisRow)
  
  pos.addTo(map) // add our layers after markers have been made
  console.log(pos); // Check if pos feature group contains markers
  neg.addTo(map) // add our layers after markers have been made
  console.log(neu)
  neu.addTo(map)
  no.addTo(map)
  console.log(no)
 }) 
  let allLayers = L.featureGroup([pos,neg,neu,no]);
  console.log(allLayers)
  //map.fitBounds(allLayers.getBounds())
  ;

  // step 1: turn allPoints into a turf.js featureCollection
  thePoints = turf.featureCollection(allPoints)
  // step 2: run the spatial analysis
  getBoundary(boundaryLayer)
}
let currentLayer;

//hovering over polygons
//post hover
  function resetHighlight(h) {
    currentLayer.resetStyle(h.target);
  }

//hover 
function highlightFeature(h) { 
  var layer = h.target;
  layer.openPopup()

  layer.setStyle({
      weight: 5,
      color: "#666",
      dashArray: '',
      fillOpacity: 0.7
  });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
  }
}

// Function for clicking on polygons and showing number of responses
function onEachFeature(feature, layer) {
  console.log(feature.properties)
  if (feature.properties.values.length > 0) {
    // Count the values within the polygon by using .length on the values array created from turf.js collect
  let count = layer.feature.properties.values.length
  let targetZcta = layer.feature.properties.zcta
    console.log(count) //see count on click
    let text = count.toString(); // Convert it to a string
    // layer.bindPopup ('Zipcode' + targetZcta + ': ' + text + 'Survey Responses'); // Bind the pop up to the number
   //console.log("Zipcode: " + feature.properties.zcta + " has " + count + " points");
   // console.log(feature.properties.values); // See what the count is on click
  }

  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: populateSidebar
  });
}
function populateSidebar(h){
  let layer = h.target;

  let targetZcta = layer.feature.properties.zcta
  let numOfStories = layer.feature.properties.values.length
  document.getElementById("stories").innerHTML = '<h2 style="text-align: center;">' + targetZcta + '</h2>';
  document.getElementById("stories").innerHTML += '<h3 style="text-align: center;">(' + numOfStories + ' Responses)</h3>';

  let stories = layer.feature.properties.values
  

     //add styling to story divs
  for (const s of document.getElementsByClassName("posStory")) {
    s.style.backgroundColor = '#AACFA0';
    s.style.padding = "10px";
    s.style.margin = "10px";
    s.style.borderRadius = "10px";
    
  }
  for (const s of document.getElementsByClassName("negStory")) {
    s.style.backgroundColor = '#F0939B';
    s.style.padding = "10px";
    s.style.margin = "10px";
    s.style.borderRadius = "10px";
  }
  for (const s of document.getElementsByClassName("neuStory")) {
    s.style.backgroundColor = '#00008B';
    s.style.padding = "10px";
    s.style.margin = "10px";
    s.style.borderRadius = "10px";
    
  }
  for (const s of document.getElementsByClassName("noStory")) {
    s.style.backgroundColor = '#964B00';
    s.style.padding = "10px";
    s.style.margin = "10px";
    s.style.borderRadius = "10px";
    
  }
  stories.forEach(story => addToStoryContent(story));
}

function addToStoryContent(thisRow){
  console.log(thisRow)
  let spaceForStories =  document.getElementById("stories")
  let thisStory = document.createElement("div")
  if (thisRow.feels == "Positive") {
    thisStory.innerHTML = `
      <div class="posStory">
        <b>Please describe your motivations for participation:</b>
        <p>${thisRow.why}</p>
        <b>Story:</b>
        <p>${thisRow.participateDesc}</p>
      </div>`;
  } else if (thisRow.feels == "Negative") {
    thisStory.innerHTML = `
      <div class="negStory">
        <b>We're sorry to hear your experience was negative. Please describe your motivations for participation:</b>
        <p>${thisRow.why}</p>
        <b>Story:</b>
        <p>${thisRow.participateDesc}</p>
      </div>`;
  } else if (thisRow.feels == "Neutral") {
    thisStory.innerHTML = `
      <div class="neuStory">
        <b>Please describe your motivations for participation:</b>
        <p>${thisRow.why}</p>
        <b>Story:</b>
        <p>${thisRow.participateDesc}</p>
      </div>`;
  } else if (thisRow.Experienced == "No") {
    thisStory.innerHTML = `
      <div class="noStory">
        <b>If you'd like, please describe your reasons for not participating:</b>
        <p>${thisRow.surveyNo}</p>
      </div>`;
  }
 console.log('thisStory')
 console.log(thisStory)
 spaceForStories.appendChild(thisStory);//this adds the button to our page.
 
 }
 
// New function to get the boundary layer and add data to it with turf.js
function getBoundary() {
  fetch(boundaryLayer)
    .then((response) => response.json())
    .then((sbzipcodes) => {
      boundary = sbzipcodes;
      collected = turf.collect(boundary, thePoints, 'surveyData', 'values');
      console.log(collected.features);
      // here is the geoJson of the `collected` result:
      currentLayer = L.geoJson(collected, {
        onEachFeature: onEachFeature,
        style: function(feature) {
          let zipCode = feature.properties.zcta;
          let color;
      
          if (zipCode == "93101") {
            color = "#04f200";
          } else if (zipCode == "93102") {
            color = "#191961";
          } else if (zipCode == "93103") {
            color = "#c34646";
          } else if (zipCode == "93105") {
            color = "#ff05cd"; // Replace with desired color
          } else if (zipCode == "93107") {
            color = "#67401e"; // Replace with desired color
          } else if (zipCode == "93108") {
            color = "#68b4ae"; // Replace with desired color
          } else if (zipCode == "93109") {
            color = "#e3a02f"; // Replace with desired color
          } else if (zipCode == "93110") {
            color = "#185027"; // Replace with desired color
          } else if (zipCode == "93120") {
            color = "#e7d768"; // Replace with desired color
          } else if (zipCode == "93121") {
            color = "##5c7c14"; // Replace with desired color
          } else if (zipCode == "93140") {
            color = "#e7d768"; // Replace with desired color
          } else if (zipCode == "93111") {
            color = "#0c0e82"; // Replace with desired color
          } else if (zipCode == "93013") {
            color = "#cf07e6"; // Replace with desired color
          } else if (zipCode == "93117") {
            color = "#ff8605"; // Replace with desired color
          } else if (zipCode == "93190") {
            color = "#008000"; // Replace with desired color
          } else {
            // Make the polygon gray and blend in with basemap if it doesn't have any values
            color = "#820c0c";
          }
      
          return { color: color, stroke: false };
        }
      });
      currentLayer.addTo(map);
      let polygons = document.getElementsByClassName('leaflet-interactive');

    // add the geojson to the map
        });
}



// Create a function to add markers -> needs to be a loop to loop through survey stories

  //if (surveyData['whyNot'] === 'positive') {}
    // Code to execute if 'Why not?' is equal to 'positive'
  
  




  // L.marker([thisRow.lat, thisRow.lng])
  //   .addTo(map)
  //   .bindPopup();
















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

loadData(dataUrl);