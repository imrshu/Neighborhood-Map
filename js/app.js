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
	// iterating over Model array & push objects into places array
	model.forEach(function(places) {
		this.places.push(places);
	});

	// This Will filter our array along with markers on the map
	this.results = ko.computed(function() {
		var filter = this.filter();
		if(!filter) {
			showMarkers();			
			return this.places();
		} else {
			return ko.utils.arrayFilter(model, function(place) {
				if(place.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
					showFilteredMarker(place);
					return place;
				} else {
					hideFilteredMarker(place);
				}
				
			});
		}
	}, this);

	// This function gets called when each of the list view item clicked
	this.getplaceInfo = function(place) {
		showPlaceInfo(place);
	};
}


// This function shows up all of the markers on the map
function showMarkers() {
	var self = this;

	for(var i=0; i<self.markerArray().length; i++) {
		self.markerArray()[i].setVisible(true);
		self.markerArray()[i].setAnimation(null);
		self.markerArray()[i].setIcon(defaultIcon);
	}
}


// This function hides an specific marker
function showFilteredMarker(place) {
	var self = this;

	closeInfoWindows();

	for(var i=0; i<self.markerArray().length; i++) {
		if(self.markerArray()[i].placeId === place.venue_id) {
			self.markerArray()[i].setVisible(true);
			self.markerArray()[i].setAnimation(google.maps.Animation.BOUNCE);
			self.markerArray()[i].setIcon(self.highLightedIcon); 
		    map.setCenter(self.markerArray()[i].getPosition());
		}
	}
}


// This function hides an specific marker
function hideFilteredMarker(place) {
	var self = this;

	closeInfoWindows();

	for(var i=0; i<self.markerArray().length; i++) {
		if(self.markerArray()[i].placeId === place.venue_id) {
			self.markerArray()[i].setVisible(false);
			self.markerArray()[i].setAnimation(null);
			self.markerArray()[i].setIcon(self.defaultIcon);
		}
	}
}


// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
    return markerImage;
}


// This function gets all information about a venue from foursquare & google api
// And stores them in knockout observables also shows information in infowindow
function showPlaceInfo(place) {
	var self = this;

	// This variable will store current clicked marker
	var clickedMarker;

	// This iteration is to find out which marker gets clicked
	for(var i=0; i<self.markerArray().length; i++) {
		if(self.markerArray()[i].placeId === place.venue_id) {
			clickedMarker = self.markerArray()[i];
		}
	}

	// Check if clicked marker is animated
	// Set it to Null else Set it to Bounce
	if(clickedMarker.getAnimation() !== null) {
		clickedMarker.setAnimation(null);
	} else {
		clickedMarker.setAnimation(google.maps.Animation.BOUNCE);
		setTimer(clickedMarker);
	}

	// Grabbing the coordinates of the place
	var lat = place.location.lat;

	var lng = place.location.lng;

	// Google street view api key
	var streetviewAPI = 'AIzaSyAJMGmn6aVOI32_ckijPm231lO8ySuAc7w';

	// Google street view api-endpoint
	var streetViewApiPoint = 'https://maps.googleapis.com/maps/api/streetview?' +
	'size=300x300&location='+ lat + ',' + lng + '&heading=100&pitch=10&scale=2' +
	'&key=' + streetviewAPI;

	// Check if no image available
	(!streetViewApiPoint) ?
	self.venue_pic('No Image Avaibale') :
	self.venue_pic(streetViewApiPoint);
	
	// FourSquare Credentials
	var foursquareClientId = 'TVX3WTBPLLE0DCFBNS0X3UESFS01RNCQZEJOWTDUZ2DGIAZM';
	var foursquareClientSecret = 'UHB04D40NMQL4BWSFOXQURO3WVVUQA0INOAUAETPYVE5IQAO';

	// FourSquare api-endpoint
	var fourSquareApiPoint = 'https://api.foursquare.com/v2/venues/' + place.venue_id +
	'?client_id=' + foursquareClientId + '&client_secret=' + foursquareClientSecret +
	'&v=20170808';

	// making AJAX request to foursquare API
	$.ajax({
		type: 'GET',
		url: fourSquareApiPoint,
		processData: false,
		
	})
	// If request succeeds done method gets called
	.done(function(data) {
			var place = data.response.venue;
			var address = place.location.formattedAddress;
			var contact = place.contact.phone;

			// Set the venue details
			self.venue_name(place.name);
			self.venue_likes(place.likes.count);
			self.venue_rating(place.rating);
			
			var place_address = '';
			address.forEach(function(address) {
				place_address += address + ' ';
			});

			// Set venue address
			self.venue_address(place_address);

			// Check if there is not contact available of the place
			// If available set it
			(contact === undefined)?
			self.venue_contact('NA'):
			self.venue_contact(contact.replace('+91', '0'));

			// Calling closeInfoWindows to close infoWindows
			closeInfoWindows();

			// Creating an DOM node for the content of infowindow
			var place_info = '';

			place_info += '<div id="place_info">';
			place_info += '<h2>' + self.venue_name() + '</h2>';
			place_info += '<img src='+ self.venue_pic() +'>';
			place_info += '<p>Address- '+ self.venue_address() +'</p>';
			place_info += '<p>Likes- '+ self.venue_likes() +'</p>';
			place_info += '<p>Rating- '+ self.venue_rating() +'</p>';
			place_info += '<p>Contact No- '+ self.venue_contact() +'</p>';
			place_info += '</div>';

			// Creating instance of infowindow
			var infoWindow = new google.maps.InfoWindow({
				content: place_info,
				position: {lat: lat, lng: lng},
				maxWidth: 300
			});

			// Pushing each of the infowindow to infoWindowArray
			self.infoWindowArray.push(infoWindow);

			// This will open infowindow on its marker
			infoWindow.open(map);

			// This will set search bar field to be empty once a list item is clicked
			self.filter('');

		    // Make sure the marker property is cleared if the infowindow is closed.
		    infoWindow.addListener('closeclick', function() {
		      this.marker = null;
		    });
	})
	// If request fails this function gets called
	.fail(function(error) {
		fourSquareAPIError();
	});
}


// This function close all of the infoWindows
function closeInfoWindows() {
	for(var i=0; i<this.infoWindowArray().length; i++) {
		this.infoWindowArray()[i].close();
	}
}


// Applying bindings of view with model
ko.applyBindings(viewModel);


// This function gets called when browser can't load the map.
function googleAPIError() {
	alert("Sorry Google Map can't be loaded");
}


// This function gets called when browser can't load foursquare api 
function fourSquareAPIError() {
	alert('Sorry Four Sqaure data cannot be loaded');
}
