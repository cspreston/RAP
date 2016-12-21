var raApp = angular.module('raApp',['ngMaterial']);

raApp.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('docs-dark','default')
      .primaryPalette('yellow')
      .accentPalette('orange');
});



raApp.controller('RAController', function($scope, $http) {

  $scope.editmode = 1;
  alert("1");	
  $scope.keys = [
    { name: 'Air Scrubber', img: 'Content/pleasure/images/hotspots/air_scrubber2.png' },
    { name: 'Air Mover', img: 'Content/pleasure/images/hotspots/air_mover2.png' },
    { name: 'Moisture Sensor', img: 'Content/pleasure/images/hotspots/moisture_sensor2.png' },
    { name: 'Power Shutoff', img: 'Content/pleasure/images/hotspots/power_shutoff2.png' },
    { name: 'Electric Panel', img: 'Content/pleasure/images/hotspots/electric_panel2.png' },
    { name: 'Comm Panel', img: 'Content/pleasure/images/hotspots/comm_panel2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/power_disconnect2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/video2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/electrical_room2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/generator2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/transformer2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/elevator2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/dumpster2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/knox_box.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/trash_chute2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/fire_hydrant2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/fire_dept_connection2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/fire_control_panel2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/fire_sprinkler_shutoff2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/smoke_alarm2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/fire_alarm2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/gas_shutoff2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/nitrogen2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/nitrous_oxide2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/oxygen2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/image2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/notes2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/protocol_form2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/text2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/water_heater2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/water_shutoff2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/sprinkler2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/dehumidifier2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/backflow_prevent2.png' },
    { name: '', img: 'Content/pleasure/images/hotspots/sprinkler_ctrl_valve2.png' }    

  ];


  $scope.views = [
    { name: 'Site Plan', img: 'Content/pleasure/images/01.jpg', newMessage: true },
    { name: 'North Lobby', img: 'Content/pleasure/images/02.jpg', newMessage: false },
    { name: 'South Lobby', img: 'Content/pleasure/images/03.jpg', newMessage: false },
    { name: 'Typical Floor', img: 'Content/pleasure/images/04.jpg', newMessage: false },
    { name: 'Lower Lobby', img: 'Content/pleasure/images/05.jpg', newMessage: false },
    { name: 'Garage - Upper', img: 'Content/pleasure/images/06.jpg', newMessage: false },
    { name: 'Garage - Lower', img: 'Content/pleasure/images/07.jpg', newMessage: false },
    { name: 'Boiler Room', img: 'Content/pleasure/images/08.jpg', newMessage: false },
    { name: 'Office 1', img: 'Content/pleasure/images/09.jpg', newMessage: false },
    { name: 'Office 2', img: 'Content/pleasure/images/10.jpg', newMessage: false },
    { name: 'Maintenance Office', img: 'Content/pleasure/images/11.jpg', newMessage: false },
    { name: 'Fourth Floor', img: 'Content/pleasure/images/12.jpg', newMessage: false },
    { name: 'Undergound Parking', img: 'Content/pleasure/images/13.jpg', newMessage: false }
  ];


  $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
      'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
      'WY').split(' ').map(function(state) {
          return {abbrev: state};
        })


  $scope.getFiltered= function(obj, idx){
     //Set a property on the item being repeated with its actual index
     //return true only for every 1st item in 3 items
      return !((obj._index = idx) % 3);
  };


  $scope.getFiltered4= function(obj, idx){
     //Set a property on the item being repeated with its actual index
     //return true only for every 1st item in 3 items
      return !((obj._index = idx) % 4);
  };

  $http.get('http://api.everlive.com/v1/dX7yaqTia9i57PIG/functions/getSites').success(function(data){
        $scope.sites = data.result;
      });

  $scope.user = {
        title: 'Developer',
        email: 'ipsum@lorem.com',
        firstName: '',
        lastName: '',
        company: 'Google',
        address: '1600 Amphitheatre Pkwy',
        city: 'Mountain View',
        state: 'CA',
        biography: 'Loves kittens, snowboarding, and can type at 130 WPM.\n\nAnd rumor has it she bouldered up Castle Craig!',
        postalCode: '94043'
      };


  $scope.driversList = [
        {
            Driver: {
                givenName: 'Sebastian',
                familyName: 'Vettel'
            },
            points: 322,
            nationality: "German",
            Constructors: [
                {name: "Red Bull"}
            ]
        },
        {
            Driver: {
            givenName: 'Fernando',
                familyName: 'Alonso'
            },
            points: 207,
            nationality: "Spanish",
            Constructors: [
                {name: "Ferrari"}
            ]
        }
      ];

});
