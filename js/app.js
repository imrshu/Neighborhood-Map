// Defines map a global variable
var map;


// This function renders the google map
function initMap() {
	// Creating Instance of Map
	map = new google.maps.Map(document.getElementById('map'), {
		center: new google.maps.LatLng(28.60172901103076, 77.22937578649113),
		zoom: 15,
		styles: styles
	});

	// Creating Instance of LatLngBounds
	var bounds = new google.maps.LatLngBounds();

	// Iterating over the model array in model.js
	model.forEach(function(places) {
		addMarkers(places);
		bounds.extend(places.location);
	});

	// This will fit all of the markers inside the map
	map.fitBounds(bounds);
}
