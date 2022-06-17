
var geo = document.getElementById("geo");
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        geo.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    geo.innerHTML = "Latitude: " + position.coords.latitude +
                    "<br>Longitude: " + position.coords.longitude;
    
    let loc = {lat: position.coords.latitude, lng: position.coords.longitude};
    map.setCenter(loc);
    marker.setPosition(loc);

    console.log("here");
}

function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        geo.innerHTML = "User denied the request for Geolocation."
        break;
      case error.POSITION_UNAVAILABLE:
        geo.innerHTML = "Location information is unavailable."
        break;
      case error.TIMEOUT:
        geo.innerHTML = "The request to get user location timed out."
        break;
      case error.UNKNOWN_ERROR:
        geo.innerHTML = "An unknown error occurred."
        break;
    }
}

// --------------------------
// map config
var map = null;
var marker = null;

function initMap(coords) {
    //const uluru = { lat: -25.344, lng: 131.031 };
    map = new google.maps.Map(
        document.getElementById("map"), 
        {zoom: 4, center: coords} );

    marker = new google.maps.Marker({ position: coords, map: map });
}

window.initMap = initMap;


getLocation();