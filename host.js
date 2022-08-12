
var secretPassphrase = ""

var numMaps = 0;
var mapList = [];
var mapNames = [];
var mapReady = [];
var markerStorage = []; // a list of lists
var edgeStorage = []; // ditto
var lineStorage = []; // ditto

var mapUpdateReq = null;

// -----------------------------------

var isHoldingCtrl = false;

document.onkeyup = onKeyUp;       
document.onkeydown = onKeyDown;       
function onKeyUp(event) {
    if (!event.ctrlKey) {
        isHoldingCtrl = false;
    }
}
function onKeyDown(event) {
    if (event.ctrlKey) {
        isHoldingCtrl = true;
    }
}

// -----------------------------------

function curry(f) { // curry(f) does the currying transform
    return function(a) {
        return function(b) {
            return f(a, b);
        };
    };
}

// TODO: add removing of edges
var firstVal = null;
function onMarkerClick(index, event) {
    if (isHoldingCtrl) {
        let i = markerStorage[index].findIndex(marker => marker.getPosition() == event.latLng);
        if (firstVal == null) {
            firstVal = i;
        } else {
            if (firstVal == i) {
                firstVal = null; 
                return;
            }

            // TODO: check if there exists a duplicate edges & don't place if so

            let edge = [firstVal, i];
            let polyline = new google.maps.Polyline({
                strokeColor: "#6699CC",
                strokeOpacity: 1.0,
                strokeWeight: 3,
                geodesic: false,
                map: mapList[index],
            });

            let path = [markerStorage[index][edge[0]].getPosition(), markerStorage[index][edge[1]].getPosition()];
            polyline.setPath(path);
            
            lineStorage[index].push(polyline);
            edgeStorage[index].push(edge);

            firstVal = null;
        }
    }
}

var firstVal_rc = null;
function onMarkerRightClick(index, event) {
    if (isHoldingCtrl) {
        console.log("rc");
        let i = markerStorage[index].findIndex(marker => marker.getPosition() == event.latLng);
        console.log(i);
        if (firstVal_rc == null) {
            firstVal_rc = i;
        } else {
            if (firstVal_rc == i) {
                firstVal_rc = null; 
                return;
            }

            mapReady[index] = false; // uncertain if this mutex works -> but at least it might help!

            let endVal = edgeStorage[index].length;
            for(let j = 0; j < endVal; j++) {
                let edge = edgeStorage[index][j];
                if (edge[0] == firstVal_rc && edge[1] == i || 
                    edge[0] == i && edge[1] == firstVal_rc) {
                    
                    console.log("removed an edge");
                    
                    // swap edge location
                    let tmp = edgeStorage[index][j];
                    edgeStorage[index][j] = edgeStorage[index][edgeStorage[index].length-1];
                    edgeStorage[index][edgeStorage[index].length-1] = tmp;

                    tmp = lineStorage[index][j];
                    tmp.setMap(null);
                    lineStorage[index][j] = lineStorage[index][lineStorage[index].length-1];
                    lineStorage[index][lineStorage[index].length-1] = tmp;

                    // remove from end
                    edgeStorage[index].pop(); 
                    lineStorage[index].pop(); 

                    break; // assume there is only one edge!
                }
            }

            mapReady[index] = true;

            firstVal_rc = null;
        }
    }
}

function sendSecretPassphrase() {
    secretPassphrase = document.getElementById("password-input").value;
    document.getElementById("password-input").value = "";

    // TODO: for now, just send the password via plaintext -> in the future, the user asks server for a random string, then we encode that passphrase using our guess as to what the key is

    // NOTE: this should work
    /*
    var passphrase = 'default';//document.getElementById("password-input").value;
    passphrase = CryptoJS.SHA256(passphrase)

    var KEY = passphrase.toString();//'ddfbccae-b4c4-11';
    var IV = passphrase.toString();//'ddfbccae-b4c4-11';

    console.log(passphrase.toString());
    console.log(passphrase.toString(CryptoJS.Base64));

    var plaintext = "msg";
    var input_bytes = CryptoJS.enc.Utf8.parse(plaintext);
    var key = CryptoJS.enc.Utf8.parse(KEY);
    var options = {iv: CryptoJS.enc.Utf8.parse(IV), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7};
    var encrypted = CryptoJS.AES.encrypt(input_bytes, key, options);
    console.log(encrypted.ciphertext.toString()); // this is the value you send over the wire
    */

    //var encrypted_b64 = btoa(encrypted);
    //console.log(encrypted_b64); 

    /*
    let passphrase = document.getElementById("password-input").value;
    let encrypted = CryptoJS.AES.encrypt("msg", utf8Encode.encode(passphrase)); // Let's go!??!!?
    console.log(encrypted);
    console.log(btoa(encrypted.iv));
    console.log(btoa(encrypted.key));
    console.log(btoa(encrypted.salt));
    */

    let serverIp = "https://34.82.79.41:7555";
    
    var xhr = new XMLHttpRequest();
    // encrypted password
    xhr.open("GET", serverIp + "/host?pwd=" + secretPassphrase, true); // will need to send pwd with every request -> just... https?
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        if(xhr.readyState == 4 && xhr.status == 200) {
            let responseList = xhr.responseText.split("\n");
            console.log(responseList);

            document.getElementById("controls").innerHTML = "<button id=\"startgame\" onclick=\"startGame()\">StartGame?</button><br><br>";
            document.getElementById("controls").innerHTML += "<label for=\"gamemode\">game mode: </label>";
            document.getElementById("controls").innerHTML += "<select name=\"gamemode\" id=\"gamemode\"><option>normal</option><option>roleswap</option></select><br><br>";
            
            document.getElementById("controls").innerHTML += "<label for=\"maptouse\">map to use: </label>";
            let tmpval = "<select name=\"maptouse\" id=\"maptouse\">";
            for (let i = 0; i < responseList.slice(2).length; i++) {
                tmpval += "<option>map " + i + "</option>";
            }
            document.getElementById("controls").innerHTML += tmpval + "</select><br><br>";
            
            document.getElementById("controls").innerHTML += "<button id=\"checklobbystart\" onclick=\"startLobbyTracking()\">Start Polling Lobby</button><br>";
            document.getElementById("controls").innerHTML += "<button id=\"checklobbystop\" onclick=\"stopLobbyTracking()\">Stop Polling Lobby</button><br>";
            document.getElementById("controls").innerHTML += "<label for=\"lobby\">game mode: </label>";
            document.getElementById("controls").innerHTML += "<div id=\"lobby\"></div>";

            numMaps = 0;
            mapList = [];
            mapNames = [];
            
            document.getElementById("maps").innerHTML = "";

            if (responseList.length > 1 && responseList[1] == "right pass") {
                // create html for maps
                {
                    let i = 0;
                    responseList.slice(2).forEach(line => {
                        let mapDataList = line.split("#");
                        let name = mapDataList[0];
                        mapNames.push(name);

                        // build widget
                        let tmp = "<div style=\"margin: 8px; padding: 8px; background-color: #def\">";
                        tmp += "<h4>Map Name: " + name + "</h4>"; // <div id="map" style="height: 400px; width: 400px;"></div>
                        tmp += "<p style=\"position:relative;left:380px;width:300px\">In order to move a marker left click it once, then left click a second time to place it. Right click to cancel movement.</p>";
                        tmp += "<p style=\"position:relative;left:380px;width:300px\">Hold [Ctrl] & left click two markers to make a connection between them. Right click instead to remove a connection.</p>";
                        tmp += "<div style=\"width: 350px; height: 350px; margin: 8px; margin-top: -65px;\" id=\"map"+i+"\"></div>"
                        tmp += "<button id=\"updatemap"+i+"\" onclick=\"POST_mapData("+i+")\">update changes</button>";
                        tmp += "<button id=\"addmarkermap"+i+"\" onclick=\"addMarker("+i+")\">add marker</button>";
                        tmp += "<button id=\"removemarkermap"+i+"\" onclick=\"removeMarker("+i+")\">remove marker</button>";
                        tmp += "</div>";

                        // create & init the map
                        numMaps += 1;
                        document.getElementById("maps").innerHTML += tmp;    

                        i++;
                    });
                }

                // init maps
                {
                    var mapOptions = {
                        zoom: 15,
                        center: {lat:0,lng:0},
                        disableDefaultUI: true
                    };

                    let i=0;
                    responseList.slice(2).forEach( _ => {
                        // have to call these in order or it doesn't work ffs
                        mapList[i] = new google.maps.Map(document.getElementById("map"+i), mapOptions);
                        i++;
                    });
                }

                // manual synchronization ahahahahaha js why ;-;
                {
                    responseList.slice(2).forEach( _ => {
                        mapReady.push(false);
                    });
                }

                // add data to maps & parse things
                {
                    let i = 0;
                    responseList.slice(2).forEach(line => {
                        let mapDataList = line.split("#")
                        let pointString = mapDataList[1];
                        let edgeString = mapDataList[2];

                        // convert string into list of points
                        let pointList = pointString.split(" ");
                        pointList = pointList.map(pointStr => {
                            let coords = pointStr.split(",");
                            if (coords.length == 2) {
                                return {lat: parseFloat(coords[0]), lng: parseFloat(coords[1])};
                            } else {
                                // TODO: deal with accidental nulls
                                return null; 
                            }
                        });
                        console.log(pointList);

                        let edgeList = edgeString.split(" ");
                        edgeList = edgeList.map(edgeStr => {
                            let indices = edgeStr.split(",");
                            if (indices.length == 2) {
                                return [parseInt(indices[0]), parseInt(indices[1])];
                            } else {
                                // TODO: deal with accidental nulls
                                return null; 
                            }
                        });
                        console.log(edgeList);

                        mapList[i].setCenter(pointList[0]);

                        markerStorage[i] = [];
                        lineStorage[i] = [];
                        edgeStorage[i] = [];

                        // add points
                        pointList.forEach(point => {
                            let markerOptions = {
                                position: point,
                                map: mapList[i],
                                draggable: true,      
                                clickable: true,
                                title: markerStorage[i].length.toString(),
                            };
                            
                            let marker = new google.maps.Marker(markerOptions);
                            marker.addListener("click", curry(onMarkerClick)(i));
                            marker.addListener("contextmenu", curry(onMarkerRightClick)(i));
                            markerStorage[i].push(marker);
                        });
                        
                        // draw edges
                        edgeList.forEach(edge => {
                            let polyline = new google.maps.Polyline({
                                strokeColor: "#6699CC",
                                strokeOpacity: 1.0,
                                strokeWeight: 3,
                                geodesic: false,
                                map: mapList[i],
                            });

                            let path = [markerStorage[i][edge[0]].getPosition(), markerStorage[i][edge[1]].getPosition()];
                            polyline.setPath(path);
                            
                            lineStorage[i].push(polyline);
                            edgeStorage[i].push(edge);
                        });

                        mapReady[i] = true; // everything is setup to update now :)

                        // TODO: add option to hide markers, to better see the lines.

                        i++;
                    });
            
                }

                mapUpdateReq = window.requestAnimationFrame(mapUpdate);

                document.getElementById("password-notice").style.visibility = "hidden";
                document.getElementById("password-notice").style.position = "absolute";

            } else {
                console.log("wrong pass");
                
                if (mapUpdateReq != null)
                    cancelAnimationFrame(mapUpdateReq);

                document.getElementById("password-notice").style.visibility = "visible";
                document.getElementById("password-notice").style.position = "relative";
            }
            
        }
    }
    xhr.send();
}

function POST_mapData(index) {
    let name = mapNames[index];
    let points = "";
    let edges = "";
    for (let i = 0; i < markerStorage[index].length; i++) {
        points += markerStorage[index][i].getPosition().lat() + "," + markerStorage[index][i].getPosition().lng()
        if(i != markerStorage[index].length-1) {
            points += " "
        }
    }
    for (let i = 0; i < edgeStorage[index].length; i++) {
        edges += edgeStorage[index][i][0].toString() + "," + edgeStorage[index][i][1].toString()
        if(i != edgeStorage[index].length-1) {
            edges += " "
        }
    }
    let mapString = name + "#" + points + "#" + edges;

    console.log(mapString)

    let serverIp = "https://34.82.79.41:7555/host/mapdata" + "?map_name=map" + (index).toString() + ".dat";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", serverIp, true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        if(xhr.readyState == 4 && xhr.status == 200) { // 4 means done
            console.log("post mapdata's responseText: " + xhr.responseText);
        }
    }

    xhr.send(mapString);
}

function startGame() {
    console.log("does nothing...")
}

function checkLobby() {
    let serverIp = "https://34.82.79.41:7555/host/viewlobby" + "?pwd=" + secretPassphrase;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", serverIp, true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        if(xhr.readyState == 4 && xhr.status == 200) { // 4 means done
            document.getElementById("lobby").innerHTML = "";

            let currentTime = parseFloat(Date.now())


            if ((typeof xhr.responseText) != "string") {
                console.log("failed to recieve valid response")
                return;
            }

            // write out player data
            let playerList = xhr.responseText.split("\n")[1].split(" ");
            for (let i = 0; i < playerList.length; i++) {
                if (playerList[i] == "")
                    break;

                let uid = playerList[i].split(",")[0]
                let name = playerList[i].split(",")[1]
                let lat = playerList[i].split(",")[2]
                let lng = playerList[i].split(",")[3]
                //console.log(xhr.responseText)
                let time = parseFloat(playerList[i].split(",")[4])
                let deltatime = currentTime - time

                let str = "<p>&nbsp;" + uid + " :: " + name + " @ " + lat + ", " + lng + " d: <span style=\"color:green;\">" + deltatime / 1000.0 + "s</span></p>";
                document.getElementById("lobby").innerHTML += str;
            }

        }
    }
    xhr.send();
}

// -----------------------------------

function addMarker(index) {
    let mapCenter = mapList[index].getCenter();
    let markerOptions = {
        position: mapCenter,
        map: mapList[index],
        draggable: true,
        clickable: true,
        title: markerStorage[index].length.toString(),
    };

    let marker = new google.maps.Marker(markerOptions);
    marker.addListener("click", curry(onMarkerClick)(index));
    marker.addListener("contextmenu", curry(onMarkerRightClick)(index));
    markerStorage[index].push(marker);
}

function removeMarker(index) {
    mapReady[index] = false; // haha look I had to make a mutex b/c js scary
    
    let endIndex = markerStorage[index].length-1;
    markerStorage[index][endIndex].setMap(null);
    markerStorage[index].pop();

    let endVal = edgeStorage[index].length;
    for(let i = 0; i < endVal; i++) {
        let edge = edgeStorage[index][i];
        if (edge[0] == endIndex || edge[1] == endIndex) {
            console.log("removed an edge");
            
            // swap edge location
            let tmp = edgeStorage[index][i];
            edgeStorage[index][i] = edgeStorage[index][edgeStorage[index].length-1];
            edgeStorage[index][edgeStorage[index].length-1] = tmp;

            tmp = lineStorage[index][i];
            tmp.setMap(null);
            lineStorage[index][i] = lineStorage[index][lineStorage[index].length-1];
            lineStorage[index][lineStorage[index].length-1] = tmp;

            // remove from end
            edgeStorage[index].pop(); 
            lineStorage[index].pop(); 

            endVal -= 1; // no overcounting
            i -= 1;
        }
    }

    mapReady[index] = true;
}

function mapUpdate() {
    // update all edge locations
    for(let i = 0; i < mapList.length; i++) {
        if (mapReady[i] == false || mapReady[i] == undefined) continue;

        let j = 0;
        lineStorage[i].forEach(polyline => {
            let path = [markerStorage[i][edgeStorage[i][j][0]].getPosition(), 
                        markerStorage[i][edgeStorage[i][j][1]].getPosition()];
            polyline.setPath(path);
            j += 1;
        });
    }

    mapUpdateReq = window.requestAnimationFrame(mapUpdate);
}

window.initMap = function() {
    // ?
};

// --------------------------
// init

var interval;
function startLobbyTracking() {
    interval = setInterval(function() {
        checkLobby()
    }, 1000/3); // 3 updates per second
}

function stopLobbyTracking() {
    clearInterval(interval)
}