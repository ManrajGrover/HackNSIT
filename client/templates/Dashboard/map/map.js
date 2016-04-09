/*
* @Author: Manraj Singh
* @Date:   2016-04-09 21:32:18
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-04-10 00:44:59
*/

function initialize(){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			console.log("LOL");
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			var myLatlng = new google.maps.LatLng(latitude, longitude);
			var mapOptions = {
				zoom: 2,
				center: myLatlng
			}
			map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
			var marker = new google.maps.Marker({
				position: myLatlng,
				map: map,
				title:"Your Location"
			});
			var circleOptions = {
				strokeColor: '#B0C4DE',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#B0C4DE',
				fillOpacity: 0.35,
				map: map,
				center: myLatlng,
				radius: 2609.34
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


Template.map.onRendered(function(){
	initialize();
  $('.ui.checkbox').checkbox();
  $('#eventForm')
    .form({
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
});


Template.map.events({
  'submit #eventForm': function(e, template) {
    e.preventDefault();
    var obj={};
    obj.crimeType=e.target.crime.value;
    obj.broadcast=e.target.broadcast.value;
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