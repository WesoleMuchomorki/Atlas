import React, { Component } from 'react';
import { ActivityIndicator, Alert, AppRegistry, Button, StyleSheet, Text, TextInput, View } from 'react-native';
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
        visible: false,
        latitude: 50.030521,
        longitude: 19.907176,
      },
      recordedRoute :
      [],
      displayedRoute: [
        { latitude: 50.030303, longitude: 19.907702 },
        { latitude: 50.031696, longitude: 19.909246 },
        { latitude: 50.031848, longitude: 19.908924 },
        { latitude: 50.031703, longitude: 19.908291 },
        { latitude: 50.032054, longitude: 19.906918 },
        { latitude: 50.033033, longitude: 19.907637 },
      ],
      thirdButton: 'Record route',
      loading : false,
      disableSecondButton : false,
      disableThirdButton : false,
      inputRouteName : false,
    };
  }

  onFirstButtonPress() {
    Alert.alert('Display has been pressed!');
  };

  onSecondButttonPress() {
    this.setState({
      loading : true,
      userPosition :
      {
        visible : false,
      }
    });
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
            visible: true,
          },
          loading : false,
        });
      },
      (error) => {
        this.setState({
          loading : false,
        });
        alert('Unable to retrieve current location');
      },
      {enableHighAccuracy: true, timeout: 60000, maximumAge: 1000}
    );
  };

  onThirdButtonPress() {
    if (this.state.thirdButton == 'Record route') {
      this.setState({
        userPosition : {
          visible : false,
        },
        loading : true,
        disableSecondButton : true,
        thirdButton: 'Save route',
        recordedRoute: [],
      })
      this.watchID = navigator.geolocation.watchPosition(
        (position) => {
          var newRecordedRoute = this.state.recordedRoute.slice();
          newRecordedRoute.push({
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
              visible : true,
            },
            loading : false,
            recordedRoute : newRecordedRoute,
          });
        },
        (error) => {
          alert('Unable to retrieve current location');
          this.setState({
            loading: false,
          })
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 5}
      );
    } else {
      this.setState({
        inputRouteName : true,
      });
    }
  };

  onInputRouteNameSavePress(){
    navigator.geolocation.clearWatch(this.watchID);
    this.setState({
        inputRouteName : false,
        thirdButton: 'Record route',
        disableSecondButton : false,
    });
    /*var path = RNFS.ExternalDirectoryPath + '/AtlasRoute.json';
      RNFS.writeFile(path, JSON.stringify(this.state.recordedRoute), 'utf8')
      .then((success) => {
        alert('The route has been saved.');
      })
      .catch((err) => {
        alert('Unable to save the route.');
      });*/
  }

  onInputRouteNameCancelPress() {
    this.setState({
      inputRouteName : false,
    });
  }

  render() {
    return (
      <View style={styles.main}>
        <MapView style={styles.map} region={this.state.region}>
          {this.state.userPosition.visible &&
            <MapView.Marker coordinate={this.state.userPosition}/>
          }
          <MapView.Polyline coordinates={this.state.recordedRoute} strokeWidth={3} strokeColor='red'/>
          <MapView.Polyline coordinates={this.state.displayedRoute} strokeWidth={3} strokeColor='blue'/>
        </MapView>
        <View />
        {this.state.loading &&
        <ActivityIndicator // there is bug in react-native: https://stackoverflow.com/questions/38579665/reactnative-activityindicator-not-showing-when-animating-property-initiate-false
          style={styles.indicator}
          animating={true}
          size="large"
        />
        }
        {this.state.inputRouteName &&
        <View style={styles.inputRouteName}>
          <TextInput style={styles.inputRouteNameTextInput} />
          <Button style={styles.inputRouteNameButtonCancel} title='Cancel' onPress={this.onInputRouteNameCancelPress.bind(this)} color='green' />
          <Button style={styles.inputRouteNameButtonSave} title='Save' onPress={this.onInputRouteNameSavePress.bind(this)} color='green' />
        </View>
        }
        <View style={styles.buttons}>
          <Button title='Display route' onPress={this.onFirstButtonPress.bind(this)} color='blue' disabled={this.state.loading} />
          <Button title='My location' onPress={this.onSecondButttonPress.bind(this)} color='green' disabled={this.state.loading || this.state.disableSecondButton } />
          <Button title={this.state.thirdButton} onPress={this.onThirdButtonPress.bind(this)} color='red' disabled={this.state.loading || this.state.disableThirdButton } />
        </View>
        <KeepAwake/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'space-between',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indicator: {
    alignItems: 'center',
  },
  inputRouteName: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  inputRouteNameButtonSave: {
  },
  inputRouteNameButtonCancel: {
  },
  inputRouteNameTextInput: {
    borderWidth: 0,
    width: 160,
  }
});

AppRegistry.registerComponent('AtlasClient', () => AtlasClient);
