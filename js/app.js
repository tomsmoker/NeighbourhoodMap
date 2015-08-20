//Main Javascript file for Neighbourhood Map Project for Udacity FEND
//Author: Tom Smoker

//First thing done is to create the map (Set to Perth CBD)
var map = new google.maps.Map(document.getElementById('google_map'), {
    zoom:  17,
    center: {
      lat: -31.95351,
      lng: 115.85705
    }
});

//Setting up each coffee shop as an item
var CoffeeShop = function(data) {
  var self     = this;
  self.name    = ko.observable(data.name);
  self.fave    = ko.observable(data.fave);
  self.tag     = ko.observable(data.tag);
  self.address = ko.observable(data.address);
  self.latLng  = ko.observable(new google.maps.LatLng(data.lat, data.lng));
  //Will have to put Instagram API in here at some point
  //self.instaID = ko.observable(data.instaID);

  //Create markers for each coffee shop
  //Have them drop in when first opened
  self.marker = new google.maps.Marker({
      map:       null,
      position:  self.latLng(),
      title:     self.name(),
      animation: google.maps.Animation.DROP
  });

  //This displays the marker (nested ifs because it was flicking on and off)
  self.toggleMarker = function(value) {
    if (value === map) {
      if (self.marker.map === null) {
        self.marker.setMap(map);
      }
    }
    else {
      self.marker.setMap(null);
    }
  };
};

//Create the basic structure of the pop up box, to use later
var popupInfo =
  "<div id='popup' class='popup'>" +
    "<h2 id='popupTitle' class='popupTitle'></h2>" +
    "<h3 id='popupFave' class='popupFave'></h3>" +
    "<div>" +
      "<h1>Pictures</h1>" +
      "<ul class='photos'></ul>" +
    "</div>" +
  "</div>";

//Making sure I dissociate the worries
var ViewModel = function() {

  var self          = this;
  self.searchString = ko.observable('');

  //Create an array to store the coffee shops
  self.locations = ko.observableArray([]);
  coffeeShops.forEach(function(coffeeShopInfo) {
    self.locations.push(new CoffeeShop(coffeeShopInfo));
  });

  //Filter the possible locations based on what's typed into the search bar
  self.filteredLocations = ko.computed(function() {
    var possibleShops  = [],
        locationLength = self.locations().length;

    //Making it look nice
    for (i = 0; i < locationLength; i++) {
        if (self.locations()[i].name().toLowerCase().indexOf(self.searchString().toLowerCase()) != -1) {
          possibleShops.push(self.locations()[i]);
          self.locations()[i].toggleMarker(map);
        }
        else {
          self.locations()[i].toggleMarker();
        }
    }
    //Making sure the array is sorted
    return possibleShops.sort(function (l, r) {
      return l.name() > r.name() ? 1 : -1;
    });
  });

  //Need to add a listener for markers to be clicked
  self.locations().forEach(function(coffeeShop) {
    google.maps.event.addListener(coffeeShop.marker, 'click', function() {
      self.handleClick(coffeeShop);
    });
  });

  //Actually create the pop up window for each coffee shop
  self.infowindow = new google.maps.InfoWindow();
  self.infowindow.setContent(popupInfo);

  //Now to animate the markers
  self.handleClick = function(coffeeShop) {
    //Zoom in when clicked (only to 18, any more is jarring)
    map.setZoom(18);
    //Still not sure if this is the best, but will do for now
    //Makes the whole experience very jolting
    map.setCenter(coffeeShop.latLng());
    //Bounce markers with a time out of 800
    coffeeShop.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(
      function(){
        coffeeShop.marker.setAnimation(null);
      },
    800);

    //Lastly open the pop up box for the marker
    self.infowindow.open(map, coffeeShop.marker);
    $('#popupTitle').text(coffeeShop.name());
    $('#popupFave') .text(coffeeShop.fave());

    //This is where the call is made to the Instagram API
    self.getInstaFeed = function(feed) {

      //Set initial variables so can build the correct URL for each coffeeshop
      var hashtag  = coffeeShop.tag();
      var ID       = '79ac5dd1949b4383a20057cc28497fff';
      var token    = '2020752268.79ac5dd.563ec4488ff240fea17f6d6d2d6b5b86';
      var URLBuild = "https://api.instagram.com/v1/tags/" + hashtag + "/media/recent?client_id=" + ID + "&access_token=" + token;

      //AJAX call to Instagram
      $.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url: URLBuild, //Can the correct URL be accessed here? Is that the issue?
        success: function(response) {
          //Get the first five photos
          for (var i = 0; i < 6; i++) {
            //I think this is where it's going wrong but not sure why
            $(".photos").append("<li><a target='_blank' href='" + reponse.data[i].link +
              "'><img  src='" + reponse.data[i].images.low_resolution.url +"'></img></a></li>");
            }
          }
      })
    }
  };
};

//Bringing it all together
ko.applyBindings( new ViewModel() );
