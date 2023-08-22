var isActive = false;
function onStart() {
	document.getElementById("button").style.backgroundColor = "#c6f0a1";
	document.getElementById("p").innerHTML = "paused";
}

var fid;
function toggleAnalysis() {
	if (isActive) {
		document.getElementById("button").style.backgroundColor = "#c6f0a1";
		document.getElementById("p").innerHTML = "paused";
	} else {
		document.getElementById("button").style.backgroundColor = "#f0cca1";
		document.getElementById("p").innerHTML = "running";
	}

	isActive = !isActive;
	console.log("should start? " + isActive);
	
	if (isActive) { 
		fid = setInterval(() => {
			let ping = pingGoogle();
			let data = locationData();
			console.log("ping: " + ping);
			
			// TODO: process & save this
		}, 1000);
	} else {
		clearInterval(fid);
	}
}

function pingGoogle() {
	// TODO: ping google
}

function locationData() {
	// TODO: get location data
}