// globals

var currentLoc = {lat: 0, lng: 0}
var player_uid = -1

// -------------------------------------
// network requests

function joinGame() {
    if (document.getElementById('name').value == "") {
        alert("put in a name first please")
        return;
    }

    let serverIp = "https://34.82.79.41:7555";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", serverIp + "/joingame?name=" + document.getElementById('name').value, true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        // 4 means done
        if(xhr.readyState == 4 && xhr.status == 200) {
            player_uid = parseInt(xhr.responseText.split("\n")[1]);
            console.log("success joining game!\n")
            console.log("uid = " + player_uid.toString())

            updateLocationOnServer()
        } else {
            console.log("game joining statusText: " + xhr.statusText);
        }
    }

    xhr.send();
}

function updateLocationOnServer() {
    if (player_uid == -1)
        return

    let serverIp = "https://34.82.79.41:7555";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", serverIp + "/player/updateloc?uid=" + player_uid + "?lat=" + currentLoc.lat + "?lng=" + currentLoc.lng, true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        // 4 means done 
        if(xhr.readyState == 4 && xhr.status == 200) {
            // success
            console.log("server recieved location update")
        }
    }

    xhr.send();
}

// -----------------------------------
// map stuff

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
    
    // update current location
    currentLoc = {lat: position.coords.latitude, lng: position.coords.longitude};
    map.setCenter(currentLoc);
    map.setTilt(0);
    marker.setPosition(currentLoc);

    geo.innerHTML += "<br> time: " + position.timestamp;
    geo.innerHTML += "<br> speed: " + position.coords.speed;
    geo.innerHTML += "<br> acc:" + position.coords.accuracy;

    // do a post request, giving this info to the server
    updateLocationOnServer()
    
    // TODO: do interpolation on client side i think
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

getLocation();