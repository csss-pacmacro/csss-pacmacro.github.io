
// TODO: this
var geo = document.getElementById("geo");
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        geo.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    geo.innerHTML = "Latitude: " + position.coords.latitude +
                    "<br>Longitude: " + position.coords.longitude;
}

getLocation();