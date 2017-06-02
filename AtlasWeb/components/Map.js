var React = require('react');

var Map = React.createClass({

	componentDidMount(){
		this.componentDidUpdate();
	},

	componentDidUpdate(){

		if(this.lastLat == this.props.lat && this.lastLng == this.props.lng){

			return;
		}

		this.lastLat = this.props.lat;
		this.lastLng = this.props.lng

		var map = new GMaps({
			el: '#map',
			lat: this.props.lat,
			lng: this.props.lng
		});
		
		map.addMarker({
			lat: this.props.lat,
			lng: this.props.lng
		});
		
		let route = [
		  [  50.030303,  19.907702 ],
		  [  50.031696,  19.909246 ],
		  [  50.031848,  19.908924 ],
		  [  50.031703,  19.908291 ],
		  [  50.032054,  19.906918 ],
		  [  50.033033,  19.907637 ],
		];
		map.drawPolyline({
		  path: route,
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