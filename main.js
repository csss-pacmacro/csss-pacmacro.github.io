
var geo = document.getElementById("geo");
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition, showError, {maximumAge: 0, timeout: 2000, enableHighAccuracy: true});
    } else {
        geo.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    geo.innerHTML = "Latitude: " + position.coords.latitude +
                    "<br>Longitude: " + position.coords.longitude;
    
    let loc = {lat: position.coords.latitude, lng: position.coords.longitude};
    map.setCenter(loc);
    map.setTilt(0);
    marker.setPosition(loc);

    geo.innerHTML += "<br> time: " + position.timestamp;
    geo.innerHTML += "<br> speed: " + position.coords.speed;
    geo.innerHTML += "<br> acc:" + position.coords.accuracy;
}

function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        geo.innerHTML = "User denied the request for Geolocation.<br> On ios, go to settings, location services, and make sure it's set to 'Ask Next Time Or When I Share', with 'Precise Location' enabled"
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

function initMap() {
    let z = {lat:0,lng:0};
    map = new google.maps.Map(
        document.getElementById("map"), 
        {zoom: 4, center: z} );
    map.setZoom(14.5);

    marker = new google.maps.Marker({ position: z, map: map });
}

window.initMap = initMap;

// networking test

function postTest() {
    let serverIp = "http://34.82.79.41:7555"; // 7555

    console.log("did a POST hi");

    var xhr = new XMLHttpRequest();
    xhr.open("POST", serverIp, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    //xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.onreadystatechange = function() { 
        // 4 means done
        if(xhr.readyState == 4 && xhr.status == 200) {
            console.log("responseText: " + xhr.responseText);
        }
        console.log("statusText: " + xhr.statusText);
    }

    xhr.send(JSON.stringify({
        msg: "hi",
        lat: marker.getPosition().lat,
        lng: marker.getPosition().lng,
    }));
}

getLocation();