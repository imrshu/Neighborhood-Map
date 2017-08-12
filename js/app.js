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


// This function adds markers to the google map
function addMarkers(place) {
		var self = this;

		// Coordinates of the place location
		var latlng = {
			lat: place.location.lat,
			lng: place.location.lng
		};
		
		// Style the markers a bit. This will be our listing marker icon.
		self.defaultIcon = makeMarkerIcon('ec630f');

		// Style the markers a bit. This will be our selected marker icon.
		self.highLightedIcon = makeMarkerIcon('4ebf16');
	
		// Creating instance of marker
		self.marker = new google.maps.Marker({
			position: latlng,
			map: map,
			title: place.name,
			icon: defaultIcon,
			placeId: place.venue_id,
			animation: google.maps.Animation.DROP,		
		});

		// Push all of the markers into markerArray
		self.markerArray.push(self.marker);

		// Add Event Listener on each of the marker
		self.marker.addListener('click', function() {
			showPlaceInfo(place);
		});
}


// @constructor
function viewModel() {
	// Knockout observable arrays
	this.markerArray = ko.observableArray([]);
	this.infoWindowArray = ko.observableArray([]);
	this.places = ko.observableArray([]);

	// search bar observable
	this.filter = ko.observable();

	// Infowindow display area knockout observables
	this.venue_name = ko.observable();
	this.venue_pic = ko.observable();
	this.venue_rating = ko.observable();
	this.venue_likes = ko.observable();
	this.venue_contact = ko.observable();
	this.venue_address = ko.observable();
}

// Applying bindings of view with model
ko.applyBindings(viewModel);
