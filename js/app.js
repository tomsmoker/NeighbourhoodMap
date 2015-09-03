
//Main Javascript file for Neighbourhood Map Project for Udacity FEND
//Author: Tom Smoker
"use strict";

//First thing done is to create the map (Set to Perth CBD)
var map = new google.maps.Map(document.getElementById('google_map'), {
    zoom: 17,
    center: {
        lat: -31.95351,
        lng: 115.85705
    }
});


//Setting up each coffee shop as an item
var CoffeeShop = function(data) {
    var self = this;
    self.name = ko.observable(data.name);
    self.fave = ko.observable(data.fave);
    self.tag = ko.observable(data.tag);
    self.photos = ko.observableArray();
    self.address = ko.observable(data.address);
    self.latLng = ko.observable(new google.maps.LatLng(data.lat, data.lng));
    //Will have to put Instagram API in here at some point
    //self.instaID = ko.observable(data.instaID);

    //Create markers for each coffee shop
    //Have them drop in when first opened
    self.marker = new google.maps.Marker({
        map: null,
        position: self.latLng(),
        title: self.name(),
        animation: google.maps.Animation.DROP
    });

    //This displays the marker (nested ifs because it was flicking on and off)
    self.toggleMarker = function(value) {
        if (value === map) {
            if (self.marker.map === null) {
                self.marker.setMap(map);
            }
        } else {
            self.marker.setMap(null);
        }
    };
};

//Create the basic structure of the pop up box, to use later
var popupInfo = function(coffeeShop) {

    "<div id='popup' class='popup'>" +
    "<h2 id='popupTitle' class='popupTitle'></h2>" +
    "<h3 id='popupFave' class='popupFave'></h3>" +
    "<div>" +
    "<h1 id='latestSnaps' class='latestSnaps'>Latest Snaps</h1>" +
    "<ul class='photos'></ul>" +
    "<img width='200' src='" + coffeeShop.photos()[0] + "'/>" +
    "</div>" +
    "</div>";
};

//Making sure I dissociate the worries
var ViewModel = function() {

    var self = this;
    self.searchString = ko.observable('');

    //Attempting to create variable names that can be accessed within the popupInfo function
    $(function(coffeeShop){
      $('#Title').val('coffeeshop.name');
      $('#Fave').val('coffeeshop.fave');
    });

    var infowindow = new google.maps.InfoWindow(); //Declare the info window

    //Create an array to store the coffee shops
    self.locations = ko.observableArray([]);
    coffeeShops.forEach(function(coffeeShopInfo) {
        self.locations.push(new CoffeeShop(coffeeShopInfo));
    });

    //Filter the possible locations based on what's typed into the search bar
    self.filteredLocations = ko.computed(function() {
        var possibleShops = [],
            locationLength = self.locations().length;

        //Making it look nice
        for (var i = 0; i < locationLength; i++) {
            if (self.locations()[i].name().toLowerCase().indexOf(self.searchString().toLowerCase()) != -1) {
                possibleShops.push(self.locations()[i]);
                self.locations()[i].toggleMarker(map);
            } else {
                self.locations()[i].toggleMarker();
            }
        }
        //Making sure the array is sorted
        return possibleShops.sort(function(l, r) {
            return l.name() > r.name() ? 1 : -1;
        });
    });

    //Iterate through each coffee shop to add information
    self.locations().forEach(function(coffeeShop) {
        google.maps.event.addListener(coffeeShop.marker, 'click', function() {

            //Zoom in when clicked (only to 18, any more is jarring)
            map.setZoom(18);

            //Set map center to the marker
            map.setCenter(coffeeShop.latLng());

            //Bounce markers with a time out of 800
            coffeeShop.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(
                function() {
                    coffeeShop.marker.setAnimation(null);
                },
                800);

            //Actually create the pop up window for each coffee shop
            self.infowindow = new google.maps.InfoWindow({
            maxHeight: 200,
            maxWidth:  200
            });

            //Populating the window with the preset HTML for each coffee shop
            self.infowindow.setContent(popupInfo(coffeeShop));

            //Lastly open the pop up box
            self.infowindow.open(map, coffeeShop.marker);
            //$('#popupTitle').text(coffeeShop.name());
            //$('#popupFave').text("My favourite: " + coffeeShop.fave());
            //$('#lastestSnaps').text("Lastest Snaps");

        });
    });

    //This is where the call is made to the Instagram API
    self.getInstaFeed = ko.computed(function() {

        self.locations().forEach(function(coffeeShop) {

            //Set initial variables so can build the correct URL for each coffeeshop
            var hashtag = coffeeShop.tag();
            var ID = '79ac5dd1949b4383a20057cc28497fff';
            var token = '2020752268.79ac5dd.563ec4488ff240fea17f6d6d2d6b5b86';
            var URLBuild = "https://api.instagram.com/v1/tags/" + hashtag + "/media/recent?client_id=" + ID + "&access_token=" + token;

            //AJAX call to Instagram
            $.ajax({
                type: "GET",
                dataType: "jsonp",
                cache: false,
                url: URLBuild, //Can the correct URL be accessed here? Is that the issue?
                success: function(response) {
                        for (var i = 0; i < 1; i++) {
                            //I think this is where it's going wrong but not sure why
                            //$(".photos").append("<li><a target='_blank' href='" + response.data[i].link +
                                //"'><img  src='" + response.data[i].images.low_resolution.url + "'></img></a></li>");
                            coffeeShop.photos.push(response.data[i].images.standard_resolution.url);
                        }
                    }
            //If it fails
            }).fail(function(response, status, error) {
                $('#popupTitle').text('Instagram feed could not be loaded');
            });
        });
    });
};

//Bringing it all together
ko.applyBindings(new ViewModel());