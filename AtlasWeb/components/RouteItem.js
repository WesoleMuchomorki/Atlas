var React = require('react');
var RouteItem = require('./RouteItem');
var moment = require('moment');

var RouteItem = React.createClass({

	handleClick(){
		this.props.onClick(this.props.address,this.props.route);
	},

	render(){

		var cn = "list-group-item";

		if(this.props.active){
			cn += " active-location";
		}

		return (
			<a className={cn} onClick={this.handleClick}>
				{'Route'}
				<span className="glyphicon glyphicon-menu-right"></span>
			</a>
		)

	}

});

module.exports = RouteItem;
