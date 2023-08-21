
var isActive = false;
function toggleAnalysis() {
	if (isActive) {
		document.getElementById("button").style.backgroundColor = "green";
	} else {
		document.getElementById("button").style.backgroundColor = "orange";
	}
	isActive = !isActive;
	console.log("should start? " + isActive);


}

