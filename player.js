// globals

const HEARTBEAT_LENGTH = 10 // in seconds

var awaitingJoinGame = false
var joinedGame = false

var currentLoc = {lat: 0, lng: 0}
var player_uid = -1

var spaceOpen0 = 1
var spaceOpen1 = 1
var spaceOpen2 = 1
var spaceOpen3 = 1
var spaceOpen4 = 1

var realSelectedCharacter = -1
var selectedCharacter = -1

// -------------------------------------
// network requests

function joinGame() {
    if (selectedCharacter == -1) {
        alert("please choose a character!")
        return;
    } else if (awaitingJoinGame) {
        alert("awaiting join game")
        return;
    } else if (joinedGame) {
        alert("already joined game")
        return;
    }

    let name = document.getElementById('name').value.toString().trim()
    if (name == "") {
        alert("put in a name first please")
        return;
    } if (name.includes("?") || 
         name.includes("=") || 
         name.includes(" ") || 
         name.includes("\n") || 
         name.includes("\t")) {
        alert("name may not contain ?, =, or whitespace characters")
        return;
    }

    let serverIp = "https://34.82.79.41:7555";

    var xhr = new XMLHttpRequest();
    
    // NOTE: code injection can be done here probably... (name) -> wait nevermind, I kinda fixed it
    xhr.open("GET", serverIp + "/joingame?name=" + name + "?char=" + (selectedCharacter).toString(), true);
    realSelectedCharacter = selectedCharacter;

    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        // 4 means done
        if(xhr.readyState == 4 && xhr.status == 200) {
            player_uid = parseInt(xhr.responseText.split("\n")[1]);
            
            if (player_uid == -1) {
                alert("oops! That character has already been taken\n")
                spaceOpen0 = parseInt(xhr.responseText.split("\n")[2][0]);
                spaceOpen1 = parseInt(xhr.responseText.split("\n")[2][1]);
                spaceOpen2 = parseInt(xhr.responseText.split("\n")[2][2]);
                spaceOpen3 = parseInt(xhr.responseText.split("\n")[2][3]);
                spaceOpen4 = parseInt(xhr.responseText.split("\n")[2][4]);

                updateSpaceOpenStyle()

                // TODO: disable characters that have been chosen

                console.log(spaceOpen0 + " " + spaceOpen1 + " " + spaceOpen2 + " " + spaceOpen3 + " " + spaceOpen4)
                awaitingJoinGame = false

            } else {
                console.log("success joining game!\n")
                console.log("uid = " + player_uid.toString())

                document.getElementById("response").innerHTML = "successfully joined game"

                updateLocationOnServer()
                awaitingJoinGame = false
                joinedGame = true
            }
            
        } else if (xhr.readyState == 4) {
            // TODO: is this correct?
            awaitingJoinGame = false
            realSelectedCharacter = -1

            console.log(xhr.readyState.toString())
            console.log(xhr.status.toString())
            console.log("FAILED :: game joining statusText: " + xhr.statusText)
        }
    }

    xhr.send()
    awaitingJoinGame = true
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

// async
function leaveGame() {
    if (awaitingJoinGame) {
        console.log("awaiting join game; can't leave yet")
        return;
    } else if (!joinedGame) {
        alert("haven't joined game, so can't leave")
        return;
    }

    let serverIp = "https://34.82.79.41:7555";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", serverIp + "/player/leavegame?uid=" + player_uid, true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        // 4 means done 
        if(xhr.readyState == 4 && xhr.status == 200) {
            console.log("server accepts leaving game")

            document.getElementById("response").innerHTML = "successfully left game"
            
            player_uid = -1
            joinedGame = false
        }
    }
    xhr.send();

        /*
    fetch(serverIp + "/player/leavegame?uid=" + player_uid, {
        method:'POST',
        headers:{
            'Content-Type': 'text/plain',
        },
        body: "",
        keepalive: true // this is important!
    })*/
}

function leaveGameSync() {
    if (awaitingJoinGame) {
        console.log("awaiting join game; can't leave yet")
        return;
    } else if (!joinedGame) {
        alert("haven't joined game, so can't leave")
        return;
    }

    let serverIp = "https://34.82.79.41:7555";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", serverIp + "/player/leavegame?uid=" + player_uid, false);
    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.send(null);
    if (xhr.status === 200) {
        // your request has been sent
        console.log("sent! " + player_uid.toString());
        document.getElementById("response").innerHTML = "successfully left game"
    }
}

function sendHeartbeat() {
    if (awaitingJoinGame) {
        return;
    } else if (!joinedGame) {
        return;
    }

    let serverIp = "https://34.82.79.41:7555";

    /*

    var xhr = new XMLHttpRequest();
    xhr.open("POST", serverIp + "/player/leavegame?uid=" + player_uid, true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        // 4 means done 
        if(xhr.readyState == 4 && xhr.status == 200) {
            console.log("server accepts leaving game")
            
            player_uid = -1
            joinedGame = false
        }
    }
    xhr.send();*/

    fetch(serverIp + "/player/heartbeat?uid=" + player_uid, {
        method:'POST',
        headers:{
            'Content-Type': 'text/plain',
        },
        body: "empty",
        keepalive: false
    })
}

// -----------------------------------
// map stuff

var geo = document.getElementById("geo");
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition, showError, {maximumAge: 0, timeout: 5000, enableHighAccuracy: true});
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

window.addEventListener('pagehide', () => {
    alert("page hiding");

    let serverIp = "https://34.82.79.41:7555";
    fetch(serverIp + "/player/leavegame?uid=" + player_uid, {
        method:'POST',
        headers:{
            'Content-Type': 'text/plain',
            //'Keep-Alive': true,
        },
        body: "a",
        keepalive: true // this is important!
    });
    
    const time = Date.now();
    while ((Date.now() - time) < 500) {
    }
    
    return true;
})

window.addEventListener("popstate", function(e) {
    let serverIp = "https://34.82.79.41:7555";
    fetch(serverIp + "/player/leavegame?uid=" + player_uid, {
        method:'POST',
        headers:{
            'Content-Type': 'text/plain',
            'Keep-Alive': true,
        },
        body: "a",
        keepalive: true // this is important!
    });

    const time = Date.now();
    while ((Date.now() - time) < 500) {
    }
    
    return true;
});


// --------------

var interval

function startHeartbeats() {
    interval = setInterval(function() {
        sendHeartbeat()
    }, 1000)
}

function stopHeartbeats() {
    clearInterval(interval)
}

startHeartbeats()


// --------------------
// input

document.getElementById('pacman').ondragstart = function() { return false; };
document.getElementById('blue').ondragstart = function() { return false; };
document.getElementById('red').ondragstart = function() { return false; };
document.getElementById('orange').ondragstart = function() { return false; };
document.getElementById('pink').ondragstart = function() { return false; };
let shadow = "-moz-box-shadow: 0 0 16px #111; -webkit-box-shadow: 0 0 16px #111; box-shadow: 0 0 16px #111;"

function onClickPacman() {
    selectedCharacter = 0
    document.getElementById("pacman").style = shadow
    document.getElementById("blue").style = ""
    document.getElementById("red").style = ""
    document.getElementById("orange").style = ""
    document.getElementById("pink").style = ""
    updateSpaceOpenStyle()
}

function onClickBlue() {
    selectedCharacter = 4
    document.getElementById("pacman").style = ""
    document.getElementById("blue").style = shadow
    document.getElementById("red").style = ""
    document.getElementById("orange").style = ""
    document.getElementById("pink").style = ""
    updateSpaceOpenStyle()
}

function onClickRed() {
    selectedCharacter = 1
    document.getElementById("pacman").style = ""
    document.getElementById("blue").style = ""
    document.getElementById("red").style = shadow
    document.getElementById("orange").style = ""
    document.getElementById("pink").style = ""
    updateSpaceOpenStyle()
}

function onClickOrange() {
    selectedCharacter = 3
    document.getElementById("pacman").style = ""
    document.getElementById("blue").style = ""
    document.getElementById("red").style = ""
    document.getElementById("orange").style = shadow
    document.getElementById("pink").style = ""
    updateSpaceOpenStyle()
}

function onClickPink() {
    selectedCharacter = 2
    document.getElementById("pacman").style = ""
    document.getElementById("blue").style = ""
    document.getElementById("red").style = ""
    document.getElementById("orange").style = ""
    document.getElementById("pink").style = shadow
    updateSpaceOpenStyle()
}

function updateSpaceOpenStyle() {
    if (spaceOpen0 == 0)
        document.getElementById("pacman").style += "; filter: saturate(100%) brightness(60%);"
    if (spaceOpen1 == 0)
        document.getElementById("red").style += "; filter: saturate(100%) brightness(60%);"
    if (spaceOpen2 == 0)
        document.getElementById("pink").style += "; filter: saturate(100%) brightness(60%);"
    if (spaceOpen3 == 0)
        document.getElementById("orange").style += "; filter: saturate(100%) brightness(60%);"
    if (spaceOpen4 == 0)
        document.getElementById("blue").style += "; filter: saturate(100%) brightness(60%);"
}

var noSleep = new NoSleep();

// stop the screen from turning off automatically
document.addEventListener('click', function enableNoSleep() {
    document.removeEventListener('click', enableNoSleep, false);
    noSleep.enable();
}, false);

// --------------------
// compute device heading:

var heading;


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

const compassHeading = (alpha, beta, gamma) => {

    // Convert degrees to radians
    const alphaRad = alpha * (Math.PI / 180);
    const betaRad = beta * (Math.PI / 180);
    const gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    const cA = Math.cos(alphaRad);
    const sA = Math.sin(alphaRad);
    const cB = Math.cos(betaRad);
    const sB = Math.sin(betaRad);
    const cG = Math.cos(gammaRad);
    const sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    const rA = - cA * sG - sA * sB * cG;
    const rB = - sA * sG + cA * sB * cG;
    const rC = - cB * cG;

    // Calculate compass heading
    let compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if(rB < 0) {
        compassHeading += Math.PI;
    }else if(rA < 0) {
        compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;

    return compassHeading;
};

window.addEventListener('deviceorientation', handleOrientation, false);
