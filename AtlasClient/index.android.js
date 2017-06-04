import React, { Component } from 'react';
import
{
  ActivityIndicator,
  Alert,
  AppRegistry,
  Button,
  ListView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
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
var MAIN_SETTINGS_PATH = RNFS.ExternalDirectoryPath + "/AtlasMain.json";

var SERVER_URL = "http://10.0.2.2:8000/";

class DisplayRouteRowSyncButton extends Component {
  uploadRoute() {
    routeName = this.props.routeName
    url = SERVER_URL + "routes/" + routeName
    console.log("sync route: " + url)
    var file = ROUTES_FOLDER_PATH +
                routeName +
                JSON_EXT;

    RNFS.readFile(file).then((content) => {
      fetch(url, {
          method: "PUT",
          body: content
        })
        .then((response) => {
          if (response.ok == true) {
            alert("Route uploaded successfully")
          } else {
            alert("Failed to upload route")
            console.log(response)
          }
        })
        .catch((err) => {
          alert(err);
          console.log(err);
        })
    }).catch((err) => {
      alert(err);
      console.log(err);
    });

    return fetch('https://facebook.github.io/react-native/movies.json')
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson.movies;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handlePress() {
    this.uploadRoute()
  }

  render() {
    return (<Button title="Upload" onPress={this.handlePress.bind(this)} />)
  }
}

class ServerRoutesListView extends Component {
  constructor(props) {
    super(props)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      empty: true,
      dataSource: ds.cloneWithRows([]),
    };
  }

  componentWillMount() {
    const url = SERVER_URL + "routes/"
    fetch(url, {
        method: "GET"
      })
      .then((response) => response.json())
      .then((responseJson) => responseJson.map((name) => SERVER_URL + "routes/" + name))
      .then((responseJson) => {
        console.log(responseJson)

        var empty = false
        if (responseJson.length == 0) {
          empty = true
        }

        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseJson),
          empty: empty
        })
      })
      .catch((err) => {
        alert(err);
        console.log(err);
      });
  }

  render() {
    if (this.state.empty) {
      return (<Text>No server routes</Text>)
    } else {
      return (<ListView dataSource={this.state.dataSource} renderRow={this._renderRow.bind(this)} />)
    }
  }

  _renderRow(rowData, sectionID, rowID, highlightRow) {
    return (
      <TouchableHighlight
          onPress={
            () => {
              this._setRoute(rowData)
              highlightRow(sectionID, rowID)
            }
          }
      >
        <Text>
          {rowData}
        </Text>
      </TouchableHighlight>
    )
  }

  _setRoute(uri) {
    fetch(uri, {
        method: "GET"
      })
      .then((response) => response.json())
      .then((responseJson) => {
        this.props.setRoute(responseJson)
        console.log(responseJson)
      })
      .catch((err) => {
        alert(err);
        console.log(err);
      })

  }
}

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
      recordedRoute :
      [],
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
    RNFS.mkdir(ROUTES_FOLDER_PATH)
    .then((result) => {
      console.info("Folder " + ROUTES_FOLDER_PATH + " succesfully created.");
    })
    .catch((err) => {
      alert(err);
      console.log(err);
    })
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
          secondButtonText : DELETE_ROUTE_TEXT,
          thirdButtonText : LOAD_ROUTE_TEXT,
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
    } else if (this.state.secondButtonText == DELETE_ROUTE_TEXT) {
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
    } else if (this.state.thirdButtonText == SAVE_ROUTE_TEXT){
      this.setState({
        inputRouteName : true,
        disableThirdButton : true,
      });
    } else if (this.state.thirdButtonText == LOAD_ROUTE_TEXT) {
      if (this.state.displayRoutesHighlightRow == -1) {
        alert("Please select the route.");
        return;
      }
      var file = ROUTES_FOLDER_PATH +
                this.state.displayRoutesData[this.state.displayRoutesHighlightRow] +
                JSON_EXT;
      RNFS.readFile(file).then((content) => {
        var obj = JSON.parse(content);
        this.setRoute(obj)
      }).catch((err) => {
        alert(err);
        console.log(err);
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

  setRoute(obj) {
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
  }

  renderDisplayRouteRow(rowData, sectionID, rowID, highlightRow) {
    var s = styles.displayRoutesRow;
    if (rowID == this.state.displayRoutesHighlightRow) {
      s = styles.displayRoutesHighlightRow;
    }
    return (<View>
        <Text style={s}
            onPress={() => {
              this.onDisplayRouteRowPress(rowID);
              highlightRow(sectionID, rowID);
            }}
        >{rowData}</Text>
        <DisplayRouteRowSyncButton routeName={rowData}/>
      </View>);
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
            <ServerRoutesListView setRoute={this.setRoute.bind(this)} />
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

// vim: ts=2:sw=2:et:ai
