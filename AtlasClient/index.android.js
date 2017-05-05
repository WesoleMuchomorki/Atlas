import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

export default class AtlasClient extends Component {
  render() {
    let campus = {
      latitude: 50.030521,
      longitude: 19.907176,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    return (
      <MapView style={styles.map} initialRegion={campus}/>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

AppRegistry.registerComponent('AtlasClient', () => AtlasClient);
