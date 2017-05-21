import React, { Component } from 'react';
import './App.css';
import Map from 'google-maps-react'
import {GoogleApiWrapper} from 'google-maps-react'

let route = [
      { lat: 50.030303, lng: 19.907702 },
      { lat: 50.031696, lng: 19.909246 },
      { lat: 50.031848, lng: 19.908924 },
      { lat: 50.031703, lng: 19.908291 },
      { lat: 50.032054, lng: 19.906918 },
      { lat: 50.033033, lng: 19.907637 },
    ];
	
export class Container extends Component {
  render() {
	let campus = {
      lat: 50.030521,
      lng: 19.907176,
    };
	 return (
   <Map google={window.google} initialCenter={campus} onReady={this.onMapReady} />
	);
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyAyesbQMyKVVbBgKVi2g6VX7mop2z96jBo'
})(Container)