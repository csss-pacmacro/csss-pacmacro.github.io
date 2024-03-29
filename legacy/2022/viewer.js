
// lists
var markerList = []

// the beeg map
var map = null;
var marker = null;

var iconList = [
    "res/sprites/pacman.png",
    "res/sprites/red.png",
    "res/sprites/pink.png",
    "res/sprites/orange.png",
    "res/sprites/blue.png"
];

// -------------------------------------
// network requests

function getPlayerData() {
    let serverIp = "https://34.82.79.41:7555";

    var xhr = new XMLHttpRequest();
    // NOTE: code injection can be done here probably...
    xhr.open("GET", serverIp + "/view?request=locations", true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        // 4 means done
        if(xhr.readyState == 4 && xhr.status == 200) {
            //let columns = parseInt(xhr.responseText.split("\n")[1]);
 
            // write out player data
            let playerList = xhr.responseText.split("\n")[1].split(" ");
            
            console.log(xhr.responseText)

            let numberOfPlayers = 0
            for (let i = 0; i < playerList.length; i++) {
                if (playerList[i] == "")
                    break;
                else
                    numberOfPlayers += 1;
            }

            while (markerList.length < numberOfPlayers) {
                markerList.push( new google.maps.Marker({ position: {lat:0,lng:0}, map: map }) )
            }

            while (markerList.length > numberOfPlayers) {
                let marker = markerList.pop()
                marker.setMap(null);
            }
            
            let currentTime = parseFloat(Date.now())
            for (let i = 0; i < playerList.length; i++) {
                if (playerList[i] == "")
                    break;

                let uid = playerList[i].split(",")[0]
                let name = playerList[i].split(",")[1]
                let lat = playerList[i].split(",")[2]
                let lng = playerList[i].split(",")[3]
                let time = parseFloat(playerList[i].split(",")[4])
                let deltatime = currentTime - time
                let char = parseInt(playerList[i].split(",")[5])

                markerList[i].setLabel(name)
                markerList[i].setPosition({lat:parseFloat(lat), lng:parseFloat(lng)})

                let thisImage = {
                    url: iconList[char],
                    scaledSize: new google.maps.Size(48, 48),
                    // The origin for this image is (0, 0).
                    origin: new google.maps.Point(0, 0),
                    // The anchor for this image is the base of the flagpole at (0, 32).
                    anchor: new google.maps.Point(24, 48),
                };
                markerList[i].setIcon(thisImage)
                
                // TODO: give markers images
            }

        } else {
            console.log("game joining statusText: " + xhr.statusText);
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

var currentLoc = null;
var lastCurrentLoc = null;

function showPosition(position) {
    geo.innerHTML = "Latitude: " + position.coords.latitude +
                    "<br>Longitude: " + position.coords.longitude;
    
    // update current location
    lastCurrentLoc = currentLoc;
    currentLoc = {lat: position.coords.latitude, lng: position.coords.longitude};

    if (lastCurrentLoc == null)
        map.setCenter(currentLoc);
    map.setTilt(0);
    marker.setPosition(currentLoc);

    //geo.innerHTML += "<br> time: " + position.timestamp;
    //geo.innerHTML += "<br> speed: " + position.coords.speed;
    //geo.innerHTML += "<br> acc:" + position.coords.accuracy;

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

// --------------------------
// init

var interval;
function startTracking() {
    interval = setInterval(function() {
        getPlayerData()
    }, 1000/3); // 3 updates per second
}

function stopTracking() {
    clearInterval(interval)
}

function centerMap() {
    map.setCenter(currentLoc)
}