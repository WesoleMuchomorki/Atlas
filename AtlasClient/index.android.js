import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import KeepAwake from 'react-native-keep-awake';

export default class AtlasClient extends Component {

  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: 50.030521,
        longitude: 19.907176,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      userPosition: {
        latitude: 50.030521,
        longitude: 19.907176,
      },
    };
  }

  onDisplayPress() {
    Alert.alert('Display has been pressed!');
  };

  onLocationPress() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          userPosition: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
        });
      },
      (error) => alert('Unable to retrieve current location'),
      {enableHighAccuracy: true, timeout: 60000, maximumAge: 1000}
    );
  };

  onRecordPress() {
    Alert.alert('Record has been pressed!');
  };

  render() {
    let route = [
      { latitude: 50.030303, longitude: 19.907702 },
      { latitude: 50.031696, longitude: 19.909246 },
      { latitude: 50.031848, longitude: 19.908924 },
      { latitude: 50.031703, longitude: 19.908291 },
      { latitude: 50.032054, longitude: 19.906918 },
      { latitude: 50.033033, longitude: 19.907637 },
    ];
    return (
      <View style={styles.parent}>
        <MapView style={styles.map} region={this.state.region}>
          <MapView.Marker coordinate={this.state.userPosition}/>
          <MapView.Polyline coordinates={route} strokeWidth={3} strokeColor='blue'/>
        </MapView>
        <View style={styles.buttons}>
          <Button title='Display route' onPress={this.onDisplayPress.bind(this)} color='blue'/>
          <Button title='My location' onPress={this.onLocationPress.bind(this)} color='green'/>
          <Button title='Record route' onPress={this.onRecordPress.bind(this)} color='red'/>
        </View>
        <KeepAwake/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

AppRegistry.registerComponent('AtlasClient', () => AtlasClient);
