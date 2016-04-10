/*
* @Author: Manraj Singh
* @Date:   2016-04-09 21:32:18
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-04-10 08:12:44
*/

var visible=new ReactiveVar(false);

var map;

function markOnMap(event, details){
  var longitude = event.longitude;
  var latitude = event.latitude;
  var screen_name = event.username;
  var text = event.description;
  var profileImageURL = details[0].profile.picture;
  var image = {
    url: profileImageURL,
    // This marker is 30 pixels wide by 30 pixels high.
    scaledSize: new google.maps.Size(30, 30),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(15, 15)
  };
  marker = new google.maps.Marker({
    position: new google.maps.LatLng(latitude, longitude),
    map: map,
    icon: image,
    title: screen_name
  });
  var infowindow = new google.maps.InfoWindow({
    content: screen_name+": "+text
  });
  marker.addListener('click', function() {
  	console.log(infowindow.content);
    infowindow.open(map, marker);
  });
}

function initialize(){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			console.log("LOL");
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			var myLatlng = new google.maps.LatLng(latitude, longitude);
			var myLatlng2 = new google.maps.LatLng(latitude, longitude+1);
			var mapOptions = {
				streetViewControl: false,
				tilt: 0,
				center:myLatlng,
				zoom:15
			};
			map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
			var mapMinZoom = 12;
			var mapMaxZoom = 18;
			var geoloccontrol = new klokantech.GeolocationControl(map, mapMaxZoom);
			// var marker = new google.maps.Marker({
			// 	position: myLatlng,
			// 	map: map,
			// 	title:"Your Location"
			// });
			var circleOptions = {
				strokeColor: '#B0C4DE',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#B0C4DE',
				fillOpacity: 0.35,
				map: map,
				center: myLatlng,
				radius: 1009.34
			};
			var circle = new google.maps.Circle(circleOptions);
		},
		function(msg){
			//var s = document.getElementById("status");
			//s.innerHTML = (typeof msg == "string") ? "<h1 style='text-align:center;'>"+msg+"</h1>" : "<h1>Failed to access your location!</h1><p>Please change your browser location settings and allow this website to access your location.</p>";
		});
	} else { 
		// show error message
	}
}
Template.map.helpers({
  icon: function(){
    return visible.get()?'fa-minus':'fa-plus';
  }
});

Template.map.onRendered(function(){
	initialize();
  $('.ui.checkbox').checkbox();
  $('#eventForm').form({
      fields: {
        crime: {
          identifier : 'crime',
          rules: [
            {
              type   : 'empty',
              prompt : 'Please enter a valid Crime Type.'
            }
          ]
        },
        broadcast:{
          identifier: 'broadcast'
        }
      }
    });
  $(".ui.dropdown").dropdown();
  this.autorun(function(){
      var x = Events.find({}, {sort: {timestamp: -1}}).fetch();
      console.log(x);
      if(x.length===0)
        return; 
      var event = x[0];
      var y =  Meteor.users.find({_id: event.userId}).fetch();
      console.log(y);
      markOnMap(event,y);
  }.bind(this));
});



Template.map.events({
  'click #formButton': function(){
    if(!visible.get()){
      $('.form-container').addClass('visible');
      visible.set(true);
    }else{
      $('.form-container').removeClass('visible');
      visible.set(false);
    }
  },

  'click #map-canvas': function(){
  	if(visible.get()){
  		$('.form-container').removeClass('visible');
  		visible.set(false);
  	}
  },
  
  'submit #eventForm': function(e, template) {
    e.preventDefault();
    var obj={};
    obj.crimeType=e.target.crime.value;
    obj.broadcast = $('#broadcastCheck').prop('checked') ? 'on' : 'off';
    console.log(obj.broadcast);
    obj.description=e.target.description.value;
    obj.latitude=Session.get('setLat');
    obj.longitude=Session.get('setLong');
    obj.address=Session.get('address');
    console.log(obj);
     $('#submitButton').addClass('loading');
    Meteor.call('setEvent',obj,function(err,result){
     
      if(err){
        console.log(err);
        sAlert.error(err.reason);
      }
      else{
        if(result.logged===false){
          sAlert.error('Logged out');   
          Router.go('signin');
        }else{
          sAlert.info('Crime reported successfully.');
          $('#submitButton').removeClass('loading');  
        }
        
      }
    });

    // var email = e.target.email.value;
    // var password = e.target.password.value;
    // var confirm = e.target.confirm.value;
    // if(!username)
    //   throwError('Username is required!');
    // else if(!email)
    //   throwError('E-mail is required');
    // else if(password!==confirm)
    //   throwError('The confirm password should match');
    // else

   

  }
});