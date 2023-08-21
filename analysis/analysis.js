
var isActive = false;
function toggleAnalysis() {
	if (isActive) {
		document.getElementById("#p").backgroundColor = "orange";
	} else {
		document.getElementById("#p").backgroundColor = "green";
	}
	isActive = !isActive;
	console.log("should start? " + isActive);
}

