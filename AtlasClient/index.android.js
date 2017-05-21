import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import KeepAwake from 'react-native-keep-awake';

var RNFS = require('react-native-fs');

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
      route: [
        { latitude: 50.030303, longitude: 19.907702 },
        { latitude: 50.031696, longitude: 19.909246 },
        { latitude: 50.031848, longitude: 19.908924 },
        { latitude: 50.031703, longitude: 19.908291 },
        { latitude: 50.032054, longitude: 19.906918 },
        { latitude: 50.033033, longitude: 19.907637 },
      ],
      recordTitle: 'Record route',
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
    if (this.state.recordTitle == 'Record route') {
      this.recordedRoute = [];
      this.watchID = navigator.geolocation.watchPosition(
        (position) => {
          this.recordedRoute.push({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
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
            },
            route: this.recordedRoute.slice(),
          });
        },
        (error) => {},
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
      );
      this.setState({ route: this.recordedRoute.slice(), recordTitle: 'Save route' });
    } else {
      navigator.geolocation.clearWatch(this.watchID);
      var path = RNFS.ExternalDirectoryPath + '/AtlasRoute.json';
      RNFS.writeFile(path, JSON.stringify(this.recordedRoute), 'utf8')
      .then((success) => {
        alert('The route has been saved.');
      })
      .catch((err) => {
        alert('Unable to save the route.');
      });
      this.setState({ route: this.recordedRoute.slice(), recordTitle: 'Record route' });
    }
  };

  render() {
    return (
      <View style={styles.parent}>
        <MapView style={styles.map} region={this.state.region}>
          <MapView.Marker coordinate={this.state.userPosition}/>
          <MapView.Polyline coordinates={this.state.route} strokeWidth={3} strokeColor='blue'/>
        </MapView>
        <View style={styles.buttons}>
          <Button title='Display route' onPress={this.onDisplayPress.bind(this)} color='blue'/>
          <Button title='My location' onPress={this.onLocationPress.bind(this)} color='green'/>
          <Button title={this.state.recordTitle} onPress={this.onRecordPress.bind(this)} color='red'/>
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
