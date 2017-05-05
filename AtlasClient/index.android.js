import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

export default class AtlasClient extends Component {
  render() {
    let campus = {
      latitude: 50.030521,
      longitude: 19.907176,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    let route = [
      { latitude: 50.030303, longitude: 19.907702 },
      { latitude: 50.031696, longitude: 19.909246 },
      { latitude: 50.031848, longitude: 19.908924 },
      { latitude: 50.031703, longitude: 19.908291 },
      { latitude: 50.032054, longitude: 19.906918 },
      { latitude: 50.033033, longitude: 19.907637 },
    ];
    return (
      <MapView style={styles.map} initialRegion={campus}>
        <MapView.Polyline coordinates={route} strokeWidth={3} strokeColor='blue'/>
      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

AppRegistry.registerComponent('AtlasClient', () => AtlasClient);
