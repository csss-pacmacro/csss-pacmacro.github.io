
var secretPassphrase = ""

var numMaps = 0;
var mapList = [];
var mapReady = [];
var markerStorage = []; // a list of lists
var edgeStorage = []; // ditto
var lineStorage = []; // ditto

var mapUpdateReq = null;

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

    let serverIp = "http://34.82.79.41:7555";
    
    var xhr = new XMLHttpRequest();
    // encrypted password
    xhr.open("GET", serverIp + "/host?pwd=" + secretPassphrase, true); // will need to send pwd with every request -> just... https?
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        if(xhr.readyState == 4 && xhr.status == 200) {
            let responseList = xhr.responseText.split("\n");
            console.log(responseList);

            numMaps = 0;
            mapList = [];

            document.getElementById("maps").innerHTML = "";

            if (responseList.length > 1 && responseList[1] == "right pass") {
                responseList.slice(2).forEach(line => {
                    let mapDataList = line.split("#")
                    let name = mapDataList[0];
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

                    // build widget
                    let tmp = "<div style=\"margin: 8px; padding: 8px; background-color: #def\">";
                    tmp += "<h4>Map Name: " + name + "</h4>"; // <div id="map" style="height: 400px; width: 400px;"></div>
                    tmp += "<p style=\"position:relative;left:380px;width:300px\">In order to move a marker left click it once, then left click a second time to place it. Right click to cancel movement.</p>";
                    tmp += "<div style=\"width: 350px; height: 350px; margin: 8px; margin-top: -65px;\" id=\"map"+mapList.length+"\"></div>"
                    tmp += "<button id=\"updatemap"+mapList.length+"\">update changes</button>";
                    tmp += "<button id=\"addmarkermap"+mapList.length+"\">add marker</button>";
                    tmp += "<button id=\"removemarkermap"+mapList.length+"\">remove marker</button>";
                    tmp += "</div>";

                    // create & init the map
                    numMaps += 1;
                    document.getElementById("maps").innerHTML += tmp;      
                    initMap();

                    mapList[numMaps-1].setCenter(pointList[0]);

                    // display points
                    markerStorage[numMaps-1] = [];
                    lineStorage[numMaps-1] = [];
                    edgeStorage[numMaps-1] = [];

                    pointList.forEach(point => {
                        let markerOptions = {
                            position: point,
                            map: mapList[numMaps-1],
                            draggable: true,                          
                        };

                        let marker = new google.maps.Marker(markerOptions);
                        markerStorage[numMaps-1].push(marker);
                    });
                    
                    // draw edges
                    edgeList.forEach(edge => {
                        let polyline = new google.maps.Polyline({
                            strokeColor: "#6699CC",
                            strokeOpacity: 1.0,
                            strokeWeight: 3,
                            geodesic: false,
                            map: mapList[numMaps-1],
                        });

                        let path = [markerStorage[numMaps-1][edge[0]].getPosition(), markerStorage[numMaps-1][edge[1]].getPosition()];
                        polyline.setPath(path);
                        
                        lineStorage[numMaps-1].push(polyline);
                        edgeStorage[numMaps-1].push(edge);
                    });

                    mapReady[numMaps-1] = true; // everything is setup to update now :)

                    // TODO: add option to hide markers, to better see the lines.

                });

                mapUpdateReq = window.requestAnimationFrame(mapUpdate);

                document.getElementById("password-notice").style.visibility = "hidden";

            } else {
                console.log("wrong pass");
                
                if (mapUpdateReq != null)
                    cancelAnimationFrame(mapUpdateReq);

                document.getElementById("password-notice").style.visibility = "visible";
            }
            
        }
    }
    xhr.send();
}

function POST_mapData() {
    
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

//   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCuJL-lFKGlIWGQhhm6wezUDI6WYgWW0PU&callback=initMap&v=quarterly" defer></script>

// Attach your callback function to the `window` object
window.initMap = function() {
    if (numMaps != 0) {
        let z = {lat:0,lng:0};
        let mapOptions = {
            zoom: 15, 
            center: z,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
        };
        
        let map = new google.maps.Map( document.getElementById("map"+mapList.length), mapOptions );
        mapList.push(map);
        mapReady.push(false); // not yet ready to update
    }

};
