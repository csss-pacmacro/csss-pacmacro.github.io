// --------------------- 
// map config 

var map = null;
var marker = null;
function initMap() {
    let zero = { lat: 0, lng: 0 };
    map = new google.maps.Map(
        document.getElementById("map"), 
        { 
            zoom: 4, 
            center: zero, 
            streetViewControl: false,
            rotateControl: false,
        },
    );
    map.setZoom(14.5);

    marker = new google.maps.Marker({ position: zero, map: map });
}

window.initMap = initMap;