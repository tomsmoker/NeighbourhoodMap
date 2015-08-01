var map;
var service;
var places = [];

function initialize() {

    var mapOptions = {
        center: { lat: -31.95351, lng: 	115.85705 },
        zoom: 16
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var searchBox = (document.getElementById('search-box'));
    var markerList = document.getElementById('marker-list');

    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(searchBox);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(markerList);

    infoWindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    google.maps.event.addListenerOnce(map, 'bounds_changed', performSearch);
}

function performSearch() {
    var request = {
        bounds: map.getBounds(),
        keyword: 'coffee'
    };
    service.nearbySearch(request, callback);
}

function callback(results, status, pagination) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
        alert(status);
        return;
    }

    for (var i = 0, result; result = results[i]; i++) {
        var marker = new google.maps.Marker({
            position: result.geometry.location,
            title: result.name
        });

        places.push({
            title: result.name,
            id: result.place_id,
            vicinity: result.vicinity,
            marker: marker
        });

        marker.setMap(map);
    }
}

google.maps.event.addDomListener(window, 'load', initialize);