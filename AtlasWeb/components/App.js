var React = require('react');

var Map = require('./Map');

var RouteList = require('./RouteList');

var App = React.createClass({

	getInitialState(){

		var cName = ['Campus'];
		var routes = [
			[ 'Campus',
			  [  50.030303,  19.907702 ],
			  [  50.031696,  19.909246 ],
			  [  50.031848,  19.908924 ],
			  [  50.031703,  19.908291 ],
			  [  50.032054,  19.906918 ],
			  [  50.033033,  19.907637 ],
			],
			[
				'Kazimierz',
				[50.050,19.936],
				[50.053,19.937],
				[50.055,19.934],
				[50.061,19.932],
				[50.064,19.931],
				[50.068,19.926],
				[50.071,19.920]
			]
		];

		let currentRoute = [
			'Campus',
		  [  50.030303,  19.907702 ],
		  [  50.031696,  19.909246 ],
		  [  50.031848,  19.908924 ],
		  [  50.031703,  19.908291 ],
		  [  50.032054,  19.906918 ],
		  [  50.033033,  19.907637 ],
		];
		
		return {
			routes: routes,
			currentRoute: currentRoute,
			cName: cName,
			currentAddress: 'Cracow, Campus',
			mapCoordinates: {
				lat: 50.030521,
				lng: 19.907176,
			}
		};
	},
	
	setRoute(address,route,name){
		
		var self = this;

		GMaps.geocode({
			lat: address[0],
			lng: address[1],
			callback: function(results, status) {

				if (status !== 'OK') return;

				var latlng = results[0].geometry.location;

				self.setState({
					currentRoute: route,
					cName: name,
					currentAddress: results[0].formatted_address,
					mapCoordinates: {
						lat: latlng.lat(),
						lng: latlng.lng()
					}
				});

			}
		});

	},
	
	render(){

		return (

			<div>
			
				<img src='logo.png' alt='logo' width='439' height='100'/>
				
				<h1></h1>

				<Map lat={this.state.mapCoordinates.lat} lng={this.state.mapCoordinates.lng} route={this.state.currentRoute}/>
				
				<RouteList routes={this.state.routes} route={this.state.currentRoute} activeRoute={this.state.cName} 
					onClick={this.setRoute} />
				
			</div>

		);
	}

});

module.exports = App;