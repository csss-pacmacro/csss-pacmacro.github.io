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

var geo_inner_html_before = "";
const geo = document.getElementById("geo");
function getLocation() {
    const showPosition = (position) => {
        if (geo_inner_html_before != "")
            geo.innerHTML = geo_inner_html_before;
        geo_inner_html_before = geo.innerHTML;

        //"Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
        geo.innerHTML += "<br>"; 
        
        // update current location
        currentLoc = {lat: position.coords.latitude, lng: position.coords.longitude};
        map.setCenter(currentLoc);
        map.setTilt(0);
        marker.setPosition(currentLoc);

        //geo.innerHTML += "<br> time: " + position.timestamp;
        geo.innerHTML += "spd: " + position.coords.speed;
        geo.innerHTML += "<br> acc:" + position.coords.accuracy;

        // TODO: update this to the new kind
        // do a post request, giving this info to the server
        // updateLocationOnServer()
        
        // TODO: do interpolation on client side i think
    }
    
    const showError = (error) => {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            geo.innerHTML = "User denied the request for Geolocation.<br>On IOS, go to 'settings' -> 'location services', then ensure it's set to 'Ask Next Time Or When I Share', with 'Precise Location' enabled"
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

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition, showError, {
            maximumAge: 0, 
            timeout: 5000, 
            enableHighAccuracy: true
        });
    } else {
        geo.innerHTML += "Geolocation is not supported by this browser.";
    }
}

window.initMap = initMap;
getLocation();

// --------------------
// slow down users from prematurely exiting

window.onbeforeunload = function (e) {
    confirm("leave?");

    if(!e) e = window.event;

    // For IE and Firefox prior to version 4
    if (e) {
        e.returnValue = 'Sure?';
    }

	//e.cancelBubble is supported by IE - this will kill the bubbling process.
	e.cancelBubble = true;
	e.returnValue = 'You sure you want to leave?'; //This is displayed on the dialog

	//e.stopPropagation works in Firefox.
	if (e.stopPropagation) {
		e.stopPropagation();
		e.preventDefault();
	}

    // For Safari
    return 'Sure?';
};

/*
window.addEventListener('pagehide', () => {
    const time = Date.now();
    while ((Date.now() - time) < 500) { }
    return true;
})

window.addEventListener("popstate", function(e) {
    const time = Date.now();
    while ((Date.now() - time) < 500) { }
    return true;
});
*/

// --------------------
// compute device heading:

document.getElementById("orientation-permissions").onclick = onClockOrientationPerms;

var heading;
function onClockOrientationPerms() {
    const compassHeading = (alpha, beta, gamma) => {
        // deg to rad
        const alphaRad = alpha * (Math.PI / 180);
        const betaRad = beta * (Math.PI / 180);
        const gammaRad = gamma * (Math.PI / 180);
    
        // Calculate equation components
        const cA = Math.cos(alphaRad);
        const sA = Math.sin(alphaRad);
        //const cB = Math.cos(betaRad);
        const sB = Math.sin(betaRad);
        const cG = Math.cos(gammaRad);
        const sG = Math.sin(gammaRad);
    
        // Calculate A, B, C rotation components
        const rA = - cA * sG - sA * sB * cG;
        const rB = - sA * sG + cA * sB * cG;
        //const rC = - cB * cG;
    
        let compassHeading = Math.atan(rA / rB);
    
        // Convert from half unit circle to whole unit circle
        if (rB < 0) {
            compassHeading += Math.PI;
        } else if (rA < 0) {
            compassHeading += 2 * Math.PI;
        }
    
        compassHeading *= 180 / Math.PI;
        return compassHeading;
    };

    const handleOrientation = (event) => {
        if (event.webkitCompassHeading) {
            // some devices don't understand "alpha" (especially IOS devices)
            heading = event.webkitCompassHeading;
        } else {
            heading = compassHeading(event.alpha, event.beta, event.gamma);
        }
    
        let dir = ['north','north east', 'east','south east', 'south','south west', 'west','north west'][Math.floor(((heading+22.5)%360)/45)]
        document.getElementById("direction").innerHTML = dir + " at " + heading.toString()
    };

    // feature detect
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation, false);
                    updateOrientationPanel();
                } else {
                    alert('failed to get device orientation permission, please try again');
                }
            })
            .catch(console.error);
    } else {
        console.log("TODO: handle regular non iOS 13+ devices");
    }
}

function updateOrientationPanel() {
    let button = document.getElementById("orientation-permissions");
    let display = document.getElementById("direction");

    // hide button & show number
    button.hidden = true;
    display.hidden = false;
}
