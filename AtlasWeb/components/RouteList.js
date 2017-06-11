var React = require('react');
var RouteItem = require('./RouteItem');

var RouteList = React.createClass({

	render(){

		var self = this;

		var routes = this.props.routes.map(function(l){

			var active = self.props.activeRouteAddress == l;

			return <RouteItem address={l[0]} route={l} active={active} onClick={self.props.onClick} />
		});

		if(!routes.length){
			return null;
		}

		return (
			<div className="list-group col-xs-12 col-md-6 col-md-offset-3">
				<span className="list-group-item active">Saved Routes</span>
				{routes}
			</div>
		)

	}

});

module.exports = RouteList;