var React = require('react');

var Map = require('./Map');


var App = React.createClass({

	getInitialState(){


		return {
			currentAddress: 'Cracow, Campus',
			mapCoordinates: {
				lat: 50.030521,
				lng: 19.907176,
			}
		};
	},
	
	render(){

		return (

			<div>
			
				<img src='logo.png' alt='logo' width="96" height="96"/>
				
				<h1>Atlas</h1>

				<Map lat={this.state.mapCoordinates.lat} lng={this.state.mapCoordinates.lng} />

			</div>

		);
	}

});

module.exports = App;