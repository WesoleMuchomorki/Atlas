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
			
				<img src='logo.png' alt='logo' width='439' height='100'/>
				
				<h1></h1>

				<Map lat={this.state.mapCoordinates.lat} lng={this.state.mapCoordinates.lng} />

			</div>

		);
	}

});

module.exports = App;