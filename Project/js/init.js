// Declare variables
let mapOptions = { 'center': [34.5027, -120.0360], 'zoom': 11.5 };

// define the leaflet map
const map = L.map('map').setView(mapOptions.center, mapOptions.zoom);

let boundary; // place holder for the data
let collected; // variable for turf.js collected points 
let allPoints = []; // array for all the data points

// add layer control box

// Use the variables


let Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 12
  
});

Esri_WorldGrayCanvas.addTo(map);

function getStyles(sbzipcodes){
  console.log(sbzipcodes)
  let myStyle = {
      "color": "#ff7800",
      "weight": 1,
      "opacity": .0,
      "stroke": .5
  };
  if (data.properties.values.length > 0){
      myStyle.opacity = 0
      
  }
  return myStyle
}

// Create a function to add markers -> needs to be a loop to loop through survey stories
function addMarker(thisRow) {
  let surveyData = { 

    'surveyZip': thisRow ['What is the zip code of your residence in Santa Barbara?'],
    'whyEngagement': thisRow['What led you to participate in civic engagement?'],
    'howFeel': thisRow['How would you describe your overall experience in civic engagement?'],
    'participateDesc': thisRow['Please describe your experience.'],
    'whyNot': thisRow['Why not?'],
  } 

  let thisPoint = turf.point([Number(thisRow.lng),Number(thisRow.lat)],{surveyData})
        // put all the turfJS points into `allPoints`
    allPoints.push(thisPoint)

  // L.marker([thisRow.lat, thisRow.lng])
  //   .addTo(map)
  //   .bindPopup();
}

const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHNN772WiQdrmo-wtACIMvYencHdlL6qrR1DpW4CzouypvSAuKuPzddjsbTTPsab19JlFGS8tKXMOD/pub?output=csv';
const boundaryLayer = './geojson/sbzipcodes.geojson';

function loadData(url) {
  Papa.parse(url, {
    header: true,
    download: true,
    complete: (results) => {
      processData(results.data);
      
    },
  });
}

function processData(data) {
  data.forEach((row) => {
    const { lat, lng, 'Please describe your experience.': message1, 'Why not?': message2 } = row;
    addMarker(row)
  });
  thePoints = turf.featureCollection(allPoints)
  getBoundary(boundaryLayer)
}
//function for clicking on polygons
function onEachFeature(feature, layer) {
  //console.log(feature.properties)
  if (feature.properties.values.length > 0) {
      
      //count the values within the polygon by using .length on the values array created from turf.js collect
      let count = feature.properties.values.length
      // console.log(feature.properties)
      console.log("Zipcode: " + feature.properties.zcta + " has " + count + " points")
      console.log(feature.properties.values) // see what the count is on click
      let text = count.toString() // convert it to a string
      layer.bindPopup(text); //bind the pop up to the number
  }
}
// new function to get the boundary layer and add data to it with turf.js
function getBoundary() {
  fetch(boundaryLayer)
    .then((response) => response.json())
    .then((sbzipcodes) => {
      boundary = sbzipcodes
    // run the turf collect geoprocessing
      collected = turf.collect(boundary, thePoints, 'surveyData', 'values');
      // just for fun, you can make buffers instead of the collect too:
      // collected = turf.buffer(thePoints, 50,{units:'miles'});
      console.log(collected.features)

      // here is the geoJson of the `collected` result:
      L.geoJson(collected,{onEachFeature: onEachFeature,style:function(feature)
      {
          //console.log(feature)
          if (feature.properties.values.length > 0) {
              return {color: "#ff0000",stroke: false};
          }
          else{
              // make the polygon gray and blend in with basemap if it doesn't have any values
              return{opacity:0,color:"#efefef" }
          }
      }
      // add the geojson to the map
          }).addTo(map)
    });
}

loadData(dataUrl);

// Add this script at the end to show the modal on page load
document.addEventListener('DOMContentLoaded', (event) => {
  const modal = document.getElementById('myModal');
  modal.innerHTML = 
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
