
var isActive = false;
function toggleAnalysis() {
	if (isActive) {
		document.getElementById("button").style.backgroundColor = "orange";
	} else {
		document.getElementById("button").style.backgroundColor = "green";
	}
	isActive = !isActive;
	console.log("should start? " + isActive);
}

