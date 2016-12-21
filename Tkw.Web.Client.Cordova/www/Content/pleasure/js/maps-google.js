var MapsGoogle = {

	basic: function () {
		var map = new GMaps({
			el: '#gmaps_1',
			lat: 41.8819838,
			lng: -87.6331038,
			zoom: 15,
			zoomControl : true,
			zoomControlOpt: {
				style : 'SMALL',
				position: 'TOP_LEFT'
			},
			panControl : false,
			streetViewControl : false,
			mapTypeControl: false,
			overviewMapControl: false
		});
	},

	events: function () {
		var map = new GMaps({
			el: '#gmaps_9',
			zoom: 11,
			lat: 51.507351,
			lng: -0.127758,
			click: function(e){
				alert('click');
			},
			dragend: function(e){
				alert('dragend');
			}
		});
	},

	styled: function () {
		var map = new GMaps({
			el: "#gmaps_10",
			lat: 41.895465,
			lng: 12.482324,
			zoom: 5,
			zoomControl : true,
			zoomControlOpt: {
				style : "SMALL",
				position: "TOP_LEFT"
			},
			panControl : true,
			streetViewControl : false,
			mapTypeControl: false,
			overviewMapControl: false
		});

		var styles = [
				{
					stylers: [
						{ hue: "#00ffe6" },
						{ saturation: -20 }
					]
				}, {
						featureType: "road",
						elementType: "geometry",
						stylers: [
								{ lightness: 100 },
								{ visibility: "simplified" }
					]
				}, {
						featureType: "road",
						elementType: "labels",
						stylers: [
								{ visibility: "off" }
					]
				}
		];

		map.addStyle({
				styledMapName:"Styled Map",
				styles: styles,
				mapTypeId: "map_style"
		});

		map.setStyle("map_style");
	},

	init: function () {
		this.basic();
		this.contextual();
		this.geocoding();
		this.geolocation();
		this.cloudLayer();
		this.trafficLayer();
		this.events();
		this.styled();
	}
}
