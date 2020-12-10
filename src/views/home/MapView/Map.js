import React, { Component } from 'react';
import L from 'leaflet';
// postCSS import of Leaflet's CSS
import 'leaflet/dist/leaflet.css';
// using webpack json loader we can import our geojson file like this
import geojson from 'src/data/bk_subway_entrances.json';
import lotes from 'src/data/Fields.json';
//Import asistentes
import ButtonActionAmbientes from 'src/components/Asistentes/Ambientes/ButtonAction';
import { MapProvider } from '../../../contexts/MapContext';
import { withStyles } from '@material-ui/core/styles';

// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
let config = {};
config.params = {
  center: [40.655769, -73.938503],
  zoomControl: false,
  zoom: 13,
  maxZoom: 19,
  minZoom: 4,
  scrollwheel: false,
  legends: true,
  infoControl: false,
  attributionControl: true
};
config.tileLayer = {
  uri: 'http://www.google.com/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
  params: {
    attribution: 'Google'
  }
};

const useStyles = theme => ({
  map: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%'
  }
});

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null,
      geojsonLayer: null,
      geojson: null,
      numEntrances: null,
      selected: null
    };
    this._mapNode = null;
    this.onEachFeature = this.onEachFeature.bind(this);
    this.highlight = this.highlight.bind(this);
    this.dehighlight = this.dehighlight.bind(this);
    this.select = this.select.bind(this);
  }

  componentDidMount() {
    // code to run just after the component "mounts" / DOM elements are created
    // we could make an AJAX request for the GeoJSON data here if it wasn't stored locally
    this.getData();
    // create the Leaflet map object
    if (!this.state.map) this.init(this._mapNode);
  }

  componentDidUpdate(prevProps, prevState) {
    // code to run when the component receives new props or state
    // check to see if geojson is stored, map is created, and geojson overlay needs to be added
    if (this.state.geojson && this.state.map && !this.state.geojsonLayer) {
      // add the geojson overlay
      this.addGeoJSONLayer(this.state.geojson);
    }
  }

  componentWillUnmount() {
    // code to run just before unmounting the component
    // this destroys the Leaflet map object & related event listeners
    //this.state.map.remove();
  }

  getData() {
    // could also be an AJAX request that results in setting state with the geojson data
    // for simplicity sake we are just importing the geojson data using webpack's json loader
    this.setState({
      numEntrances: geojson.features.length,
      geojson: lotes
    });
  }

  addGeoJSONLayer(geojson) {
    // create a native Leaflet GeoJSON SVG Layer to add as an interactive overlay to the map
    // an options object is passed to define functions for customizing the layer
    const geojsonLayer = L.geoJson(geojson, {
      onEachFeature: this.onEachFeature,
      style: function() {
        return {
          color: 'red'
        };
      }
    });
    // add our GeoJSON layer to the Leaflet map object
    geojsonLayer.addTo(this.state.map);
    // store the Leaflet GeoJSON layer in our component state for use later
    this.setState({ geojsonLayer });
    // fit the geographic extent of the GeoJSON layer within the map's bounds / viewport
    this.zoomToFeature(geojsonLayer);
  }

  zoomToFeature(target) {
    // set the map's center & zoom so that it fits the geographic extent of the layer
    this.state.map.fitBounds(target.getBounds());
  }

  onEachFeature(feature, layer) {
    layer.on('click', e => {
      this.select(e.target);
      this.setState(state => (state.map.selectedLayer = layer));
    });
  }

  highlight(layer) {
    layer.setStyle({
      color: 'blue'
    });
  }

  dehighlight(layer) {
    if (
      this.state.selected === null ||
      this.state.selected._leaflet_id !== layer._leaflet_id
    ) {
      layer.setStyle({
        color: 'red'
      });
    }
  }

  select(layer) {
    if (this.state.selected !== null) {
      var previous = this.state.selected;
    }

    this.state.map.fitBounds(layer.getBounds());
    this.setState(state => (state.map.selectedLayer = layer));
    this.setState(state => (state.selected = layer));
    if (previous) {
      this.dehighlight(previous);
    }

    this.highlight(layer);
  }

  init(id) {
    if (this.state.map) return;
    // this function creates the Leaflet map object and is called after the Map component mounts
    let map = L.map(id, config.params);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.control.scale({ position: 'bottomleft' }).addTo(map);

    // a TileLayer is used as the "basemap"
    const tileLayer = L.tileLayer(
      config.tileLayer.uri,
      config.tileLayer.params
    ).addTo(map);

    map.selectedLayer = null;
    map.baseLayer = null;

    // set our state to include the tile layer
    this.setState({ map, tileLayer });
  }

  render() {
    const { classes } = this.props;
    return (
      <div id="mapUI">
        <MapProvider value={this.state.map}>
          <ButtonActionAmbientes />
        </MapProvider>
        <div
          ref={node => (this._mapNode = node)}
          id="map"
          className={classes.map}
        />
      </div>
    );
  }
}

export default withStyles(useStyles)(Map);
