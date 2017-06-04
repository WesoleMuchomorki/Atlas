import React, { Component } from 'react';
import
{
  ActivityIndicator,
  Alert,
  AppRegistry,
  BackAndroid,
  Button,
  ListView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import MapView from 'react-native-maps';
import KeepAwake from 'react-native-keep-awake';

var RNFS = require('react-native-fs');

var DISPLAY_ROUTES_TEXT = 'Display routes'
var CANCEL_ROUTE_TEXT   = 'Cancel route';
var RECORD_ROUTE_TEXT   = 'Record route';
var SAVE_ROUTE_TEXT     = 'Save route';
var MY_LOCATION_TEXT    = 'My location';
var LOAD_ROUTE_TEXT     = 'Load route';
var DELETE_ROUTE_TEXT   = 'Delete route';

var JSON_EXT = ".json";

var ROUTES_FOLDER_PATH = RNFS.ExternalDirectoryPath + "/AtlasRoute/";
var MAIN_SETTINGS_PATH = RNFS.ExternalDirectoryPath + "/AtlasMain" + JSON_EXT;
var LAST_LOCATION_PATH = RNFS.ExternalDirectoryPath + "/LastLocation" + JSON_EXT;

export default class AtlasClient extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      region : {
        latitude : 50.030521,
        longitude : 19.907176,
        latitudeDelta : 0.01,
        longitudeDelta : 0.01,
      },
      userPosition : {
        visible : false,
        latitude : 50.030521,
        longitude : 19.907176,
      },
      recordedRoute : [],
      displayedRoute : [],
      firstButtonText : DISPLAY_ROUTES_TEXT,
      secondButtonText : MY_LOCATION_TEXT,
      thirdButtonText : RECORD_ROUTE_TEXT,
      loading : false,
      disableThirdButton : false,
      inputRouteName : false,
      routeNameTextInput : '',
      displayRoutes : false,
      displayRoutesDataDs : this.ds.cloneWithRows([]),
      displayRoutesData : {},
      displayRoutesHighlightRow : -1,
    };
  }

  componentWillMount() {
    RNFS.mkdir(ROUTES_FOLDER_PATH)
    .then((result) => {
      console.info("Folder " + ROUTES_FOLDER_PATH + " succesfully created.");
    })
    .catch((err) => {
      alert(err);
      console.log(err);
    });
    RNFS.exists(LAST_LOCATION_PATH)
    .then((result) => {
      if (result) {
        RNFS.readFile(LAST_LOCATION_PATH).then((content) => {
          var obj = JSON.parse(content);
          console.log(obj);
          this.setState((prevState) => ({
            region : obj.region,
            userPosition : obj.userPosition,
            displayedRoute : obj.displayedRoute,
          }));
        }).catch((err) => {
          console.log(err);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }

  componentDidMount() {
    BackAndroid.addEventListener("hardwareBackPress", () => {
      var lastLocation = {
        region : this.state.region,
        userPosition : this.state.userPosition,
        displayedRoute : this.state.displayedRoute,
      };
      RNFS.writeFile(LAST_LOCATION_PATH, JSON.stringify(lastLocation), 'utf8')
      .then((success) => {
        console.log('The last location has been saved.');
      })
      .catch((err) => {
        console.log(err);
      });
      return false;
    });
  }

  onFirstButtonPress() {
    if (this.state.firstButtonText == DISPLAY_ROUTES_TEXT) {
      RNFS.readdir(ROUTES_FOLDER_PATH)
      .then((result) => {
        if (result.length == 0) {
          alert("No routes to display.");
          return;
        }
        var sortedResult = this.helperSortAndStrip(result);
        this.setState({
          displayRoutesDataDs : this.ds.cloneWithRows(sortedResult),
          displayRoutesData : sortedResult,
          displayRoutes : true,
          displayRoutesHighlightRow: -1,
          firstButtonText : CANCEL_ROUTE_TEXT,
          secondButtonText : LOAD_ROUTE_TEXT,
          thirdButtonText : DELETE_ROUTE_TEXT,
        });
      }).catch((err) => {
        console.log(err);
        alert(err);
      });
    } else if (this.state.firstButtonText == CANCEL_ROUTE_TEXT) {
      this.setState({
        displayRoutes : false,
        firstButtonText : DISPLAY_ROUTES_TEXT,
        secondButtonText : MY_LOCATION_TEXT,
        thirdButtonText : RECORD_ROUTE_TEXT,
      });
    }
  };

  onSecondButttonPress() {
    if (this.state.secondButtonText == MY_LOCATION_TEXT) {
      this.setState({
        loading : true,
      });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState((prevState) => ({
            region : {
              latitude : position.coords.latitude,
              longitude : position.coords.longitude,
              latitudeDelta : prevState.region.latitudeDelta,
              longitudeDelta : prevState.region.longitudeDelta,
            },
            userPosition : {
              latitude : position.coords.latitude,
              longitude : position.coords.longitude,
              visible : true,
            },
            loading : false,
          }));
        },
        (error) => {
          this.setState({
            loading : false,
          });
          alert('Unable to retrieve current location');
        },
        {enableHighAccuracy : true, timeout : 60000, maximumAge : 1000}
      );
    } else if (this.state.secondButtonText == CANCEL_ROUTE_TEXT){
      navigator.geolocation.clearWatch(this.watchID);
      this.setState({
          thirdButtonText : RECORD_ROUTE_TEXT,
          secondButtonText : MY_LOCATION_TEXT,
          userPosition :
          {
            visible : false,
          },
          disableThirdButton : false,
          inputRouteName : false,
      });
      alert("The route has been canceled.");
    } else if (this.state.secondButtonText == LOAD_ROUTE_TEXT) {
      if (this.state.displayRoutesHighlightRow == -1) {
        alert("Please select the route.");
        return;
      }
      var file = ROUTES_FOLDER_PATH +
                this.state.displayRoutesData[this.state.displayRoutesHighlightRow] +
                JSON_EXT;
      RNFS.readFile(file).then((content) => {
        var obj = JSON.parse(content);
        this.setState((prevState) => ({
          displayedRoute : obj,
          displayRoutes : false,
          region : {
              latitude : obj[0].latitude,
              longitude : obj[0].longitude,
              latitudeDelta : prevState.region.latitudeDelta,
              longitudeDelta : prevState.region.longitudeDelta,
          },
          firstButtonText : DISPLAY_ROUTES_TEXT,
          secondButtonText : MY_LOCATION_TEXT,
          thirdButtonText : RECORD_ROUTE_TEXT,
        }));
      }).catch((err) => {
        alert(err);
        console.log(err);
      });
    }
  };

  onThirdButtonPress() {
    if (this.state.thirdButtonText == RECORD_ROUTE_TEXT) {
      this.setState({
        userPosition : {
          visible : false,
        },
        loading : true,
        secondButtonText : CANCEL_ROUTE_TEXT,
        thirdButtonText : SAVE_ROUTE_TEXT,
        recordedRoute : [],
      })
      this.watchID = navigator.geolocation.watchPosition(
        (position) => {
          var newRecordedRoute = this.state.recordedRoute.slice();
          newRecordedRoute.push({
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
          });
          this.setState((prevState) => ({
            region : {
              latitude : position.coords.latitude,
              longitude : position.coords.longitude,
              latitudeDelta : prevState.region.latitudeDelta,
              longitudeDelta : prevState.region.longitudeDelta,
            },
            userPosition : {
              latitude : position.coords.latitude,
              longitude : position.coords.longitude,
              visible : true,
            },
            loading : false,
            displayedRoute : [],
            recordedRoute : newRecordedRoute,
          }));
        },
        (error) => {
          alert('Unable to retrieve current location');
          this.setState({
            loading : false,
          })
        },
        {enableHighAccuracy : true, timeout : 20000, maximumAge : 1000, distanceFilter : 3}
      );
    } else if (this.state.thirdButtonText == SAVE_ROUTE_TEXT) {
      this.setState({
        inputRouteName : true,
        disableThirdButton : true,
      });
    } else if (this.state.thirdButtonText == DELETE_ROUTE_TEXT) {
      if (this.state.displayRoutesHighlightRow == -1) {
        alert("Please select the route.");
        return;
      }
      var file = ROUTES_FOLDER_PATH +
                this.state.displayRoutesData[this.state.displayRoutesHighlightRow] +
                JSON_EXT;
      RNFS.unlink(file).then(() => {
        RNFS.readdir(ROUTES_FOLDER_PATH)
        .then((result) => {
          if (result.length == 0) {
            this.setState({
              displayRoutes : false,
              firstButtonText : DISPLAY_ROUTES_TEXT,
              secondButtonText : MY_LOCATION_TEXT,
              thirdButtonText : RECORD_ROUTE_TEXT,
            });
            return;
          }
          var sortedResult = this.helperSortAndStrip(result);
          this.setState({
            displayRoutesHighlightRow: -1,
            displayRoutesDataDs : this.ds.cloneWithRows(sortedResult),
            displayRoutesData : sortedResult,
          });
          alert("Route deleted.");
        }).catch((err) => {
          console.log(err);
          alert(err);
        });
      }).catch((err) => {
        alert(err);
      });
    }
  };

  onInputRouteNameSavePress(){
    var input = this.helperStrip(this.state.routeNameTextInput);
    if (input.length == 0) {
      alert("Please input the name of the route.");
      return;
    }
    var path = ROUTES_FOLDER_PATH + this.state.routeNameTextInput + JSON_EXT;
    RNFS.exists(path)
    .then((result) => {
      if (result == false) {
        navigator.geolocation.clearWatch(this.watchID);
        this.setState({
            inputRouteName : false,
            thirdButtonText : RECORD_ROUTE_TEXT,
            secondButtonText : MY_LOCATION_TEXT,
            disableThirdButton : false,
            userPosition :
            {
              visible : false,
            },
        });
        RNFS.writeFile(path, JSON.stringify(this.state.recordedRoute), 'utf8')
        .then((success) => {
          alert('The route has been saved.');
        })
        .catch((err) => {
          alert(err);
          console.log(err);
        });
      } else {
        alert("Route with this name already exists, please input different name.");
      }
    })
    .catch((err) => {
      alert(err);
      console.log(err);
    });
  }

  onInputRouteNameCancelPress() {
    this.setState({
      inputRouteName : false,
      disableThirdButton : false,
    });
  }

  onRegionChange(myRegion) {
    this.setState({
      region: myRegion,
    });
  }

  onTextInputChange(text) {
    this.setState({
      routeNameTextInput : text,
    });
  }

  onDisplayRouteRowPress(rowID) {
    this.setState({
      displayRoutesDataDs :  this.ds.cloneWithRows(this.state.displayRoutesData),
      displayRoutesHighlightRow : rowID,
    });
  }

  renderDisplayRouteRow(rowData, sectionID, rowID, highlightRow) {
    var s = styles.displayRoutesRow;
    if (rowID == this.state.displayRoutesHighlightRow) {
      s = styles.displayRoutesHighlightRow;
    }
    return (<Text style={s} onPress={() => {
        this.onDisplayRouteRowPress(rowID);
        highlightRow(sectionID, rowID);
      }}>{rowData}</Text>);
  }

  helperStrip(input) {
    if (input.length == 0) {
      return input;
    }
    if (input[0] == ' ') {
      return this.helperStrip(input.substring(1, input.length));
    }
    if (input[input.length-1] == ' ') {
      return this.helperStrip(input.substring(0, input.length-1));
    }
    return input;
  }

  helperSortAndStrip(input) {
    return input.sort().map((a) => a.substring(0, a.length - JSON_EXT.length));
  }

  render() {
    return (
        <View style={styles.main}>
          <MapView style={styles.map} region={this.state.region} onRegionChange={this.onRegionChange.bind(this)} >
            {this.state.userPosition.visible &&
              <MapView.Marker coordinate={this.state.userPosition}/>
            }
            <MapView.Polyline coordinates={this.state.recordedRoute} strokeWidth={3} strokeColor='red'/>
            <MapView.Polyline coordinates={this.state.displayedRoute} strokeWidth={3} strokeColor='blue'/>
          </MapView>
          <View />
          {this.state.loading &&
          <ActivityIndicator // there is bug in react-native : https ://stackoverflow.com/questions/38579665/reactnative-activityindicator-not-showing-when-animating-property-initiate-false
            style={styles.indicator}
            animating={true}
            size="large"
          />
          }
          {this.state.displayRoutes &&
          <View style={styles.displayRoutes}>
            <ListView style={styles.displayRoutesListView}
              dataSource={this.state.displayRoutesDataDs}
              renderRow={this.renderDisplayRouteRow.bind(this)}
              enableEmptySections={true}
             />
          </View>}
          {this.state.inputRouteName &&
          <View style={styles.inputRouteName}>
            <TextInput style={styles.inputRouteNameTextInput} onChangeText={this.onTextInputChange.bind(this)} />
            <Button style={styles.inputRouteNameButtonCancel} title='Cancel' onPress={this.onInputRouteNameCancelPress.bind(this)} color='green' />
            <Button style={styles.inputRouteNameButtonSave} title='Save' onPress={this.onInputRouteNameSavePress.bind(this)} color='green' />
          </View>
          }
          <View style={styles.buttons}>
            <Button title={this.state.firstButtonText} onPress={this.onFirstButtonPress.bind(this)} color='blue' disabled={this.state.loading} />
            <Button title={this.state.secondButtonText} onPress={this.onSecondButttonPress.bind(this)} color='green' disabled={this.state.loading} />
            <Button title={this.state.thirdButtonText} onPress={this.onThirdButtonPress.bind(this)} color='red' disabled={this.state.loading || this.state.disableThirdButton } />
          </View>
          <KeepAwake/>
        </View>);
  }
}

const styles = StyleSheet.create({
  global : {
    flex : 1,
  },
  main : {
    flex : 1,
    justifyContent : 'space-between',
  },
  map : {
    ...StyleSheet.absoluteFillObject,
  },
  buttons : {
    flexDirection : 'row',
    justifyContent : 'space-between',
  },
  indicator : {
    alignItems : 'center',
  },
  inputRouteName : {
    flexDirection : 'row',
    justifyContent : 'space-between',
    backgroundColor : 'white',
    borderColor : 'black',
    borderWidth : 1,
    alignItems : 'center',
    paddingLeft : 20,
    paddingRight : 20,
  },
  inputRouteNameButtonSave : {
  },
  inputRouteNameButtonCancel : {
  },
  inputRouteNameTextInput : {
    borderWidth : 0,
    width : 160,
  },
  displayRoutes : {
    backgroundColor : 'white',
    flexDirection : 'column',
    justifyContent : 'center',
  },
  displayRoutesRow : {
    padding: 10,
  },
  displayRoutesHighlightRow : {
    padding: 10,
    fontWeight: 'bold',
  }
});

AppRegistry.registerComponent('AtlasClient', () => AtlasClient);
