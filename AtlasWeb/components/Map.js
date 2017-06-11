var React = require('react');

var Map = React.createClass({

	componentDidMount(){
		this.componentDidUpdate();
	},

	componentDidUpdate(){

		if(this.lastLat == this.props.lat && this.lastLng == this.props.lng && this.lastRoute == this.props.route){

			return;
		}

		this.lastLat = this.props.lat;
		this.lastLng = this.props.lng
		this.lastRoute = this.props.route;

		var map = new GMaps({
			el: '#map',
			lat: this.props.lat,
			lng: this.props.lng
		});
		
		/*map.addMarker({
			lat: this.props.lat,
			lng: this.props.lng
		});*/
		
		map.drawPolyline({
		  path: this.props.route,
		  strokeColor: '#131540',
		  strokeOpacity: 0.6,
		  strokeWeight: 6
		});
	},

	render(){

		return (
			<div className="map-holder">
				<p>Loading...</p>
				<div id="map"></div>
			</div>
		);
	}

});

module.exports = Map;