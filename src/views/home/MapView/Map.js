import React, { Component } from 'react';
import L from 'leaflet';
import 'leaflet-editable';
import 'leaflet-measure-path/leaflet-measure-path';
// import CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet-measure-path/leaflet-measure-path.css';
import 'src/assets/css/map.css';

import geojson from 'src/data/bk_subway_entrances.json';
import lotes from 'src/data/Fields.json';
import MeasureTool from 'src/components/GisTools/MeasureTool';
import CoordinatesTool from 'src/components/GisTools/CoordinatesTool';
import RightPanel from 'src/components/RightPanel/index';
import { MapProvider } from '../../../contexts/MapContext';
import { withStyles } from '@material-ui/core/styles';
import EditTool from 'src/components/GisTools/EditTool';

// store the map configuration properties in an object.

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
  attributionControl: true,
  editable: true
};
config.tileLayer = {
  uri: 'http://www.google.com/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
  params: {
    attribution: 'Google'
  }
};

const styleSelected = {
  weight: 6,
  opacity: 1,
  color: '#000000',
  fillOpacity: 0.2,
  dashArray: 0
};

const styleEmpty = {
  fillColor: '#BD0026',
  weight: 1,
  opacity: 1,
  color: '#BD0026',
  fillOpacity: 0,
  dashArray: 0
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
      vectorLayers: [],
      geojsonLayer: null,
      geojson: null,
      numEntrances: null,
      selected: null,
      editSelected: false,
      cursor: null,
      lastZoom: null,
      editTool: {
        isActive: false,
        editLayer: null,
        contextLayer: null,
        result: null
      }
    };
    this._mapNode = null;
    this.onEachFeatureClosure = this.onEachFeatureClosure.bind(this);
    this.highlight = this.highlight.bind(this);
    this.dehighlight = this.dehighlight.bind(this);
    this.select = this.select.bind(this);
    this.removeVectorGroup = this.removeVectorGroup.bind(this);
    this.enableEditTool = this.enableEditTool.bind(this);
    this.disableEditTool = this.disableEditTool.bind(this);
    this.setResultEditTool = this.setResultEditTool.bind(this);
    this.getResultEditTool = this.getResultEditTool.bind(this);
    this.saveEditTool = this.saveEditTool.bind(this);
    this.myRef = React.createRef();
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
      this.addGeoJSONLayer(this.state.geojson, 'lotes');
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

  cursorOnMap(type) {
    if (type) this.setState({ cursor: type });
    else this.setState({ cursor: null });
  }

  addGeoJSONLayer(geojson, groupName) {
    // create a native Leaflet GeoJSON SVG Layer to add as an interactive overlay to the map
    // an options object is passed to define functions for customizing the layer
    const geojsonLayer = L.geoJson(geojson, {
      onEachFeature: this.onEachFeatureClosure(groupName),
      style: function() {
        return styleEmpty;
      }
    });
    // add our GeoJSON layer to the Leaflet map object
    geojsonLayer.addTo(this.state.map);

    //lotes
    let layer = {
      name: groupName,
      layer: geojsonLayer
    };

    // store the Leaflet GeoJSON layer in our component state for use later
    this.setState({
      geojsonLayer,
      vectorLayers: [...this.state.vectorLayers, layer]
    });

    // fit the geographic extent of the GeoJSON layer within the map's bounds / viewport
    this.zoomToFeature(geojsonLayer);
  }

  zoomToFeature(target) {
    // set the map's center & zoom so that it fits the geographic extent of the layer
    this.state.map.fitBounds(target.getBounds());
  }

  onEachFeatureClosure(groupName) {
    const onEachFeature = (feature, layer) => {
      layer.on('click', e => {
        this.select(e.target);
      });

      //Only Fields
      if (groupName === 'lotes') {
        layer
          .bindTooltip(
            feature.properties.Field + ' <br> ' + feature.properties.Crop,
            {
              permanent: true,
              direction: 'center'
            }
          )
          .openTooltip();
      }
    };

    return onEachFeature;
  }

  highlight(layer) {
    layer.setStyle(styleSelected);
    layer.options.highlight = true;
    this.setState({ ...this.state, selected: layer });
  }

  dehighlight(layer) {
    layer.setStyle(styleEmpty);
    layer.options.highlight = false;
    this.setState({ ...this.state, selected: null });
  }

  select(layer) {
    if (this.state.selected !== null) {
      var previous = this.state.selected;
    }

    this.state.map.fitBounds(layer.getBounds());

    if (previous && previous !== layer) {
      this.dehighlight(previous);
      this.highlight(layer);
    } else if (this.state.selected === layer) {
      this.dehighlight(previous);
    } else {
      this.highlight(layer);
    }
  }

  enableEditTool(editlayer, contextlayer, featureGroup) {
    this.setState(prevState => ({
      editTool: {
        ...prevState.editTool,
        isActive: true,
        featureGroup: featureGroup,
        editLayer: editlayer,
        contextLayer: contextlayer
      }
    }));
  }

  disableEditTool() {
    this.setState(prevState => ({
      editTool: {
        ...prevState.editTool,
        isActive: false,
        featureGroup: null,
        editLayer: null,
        contextLayer: null
      }
    }));
  }

  saveEditTool() {
    console.log('saveedittol');
    this.myRef.current.saveEditLayer();
  }

  setResultEditTool(data) {
    console.log(data);
    data.forEach(element => {
      let found = this.state.vectorLayers.find(e => e.name === element.type);
      if (element.operation === 'create' && found) {
        found.layer.addData(element.geojson);
      }

      if (element.operation === 'create' && !found) {
        this.addGeoJSONLayer(element.geojson, element.type);
      }

      if (element.operation === 'update') {
        found.layer.removeLayer(found.layer.getLayer(element.id));
        found.layer.addData(element.geojson);
      }

      if (element.operation === 'remove') {
        found.layer.removeLayer(found.layer.getLayer(element.id));
      }
    });
    this.setState({ ...this.state, selected: null });
  }

  getResultEditTool() {
    return this.state.editTool.result;
  }

  removeVectorGroup(groupName) {
    let found = this.state.vectorLayers.find(e => e.name === groupName);
    if (found) {
      this.state.map.removeLayer(found.layer);
      this.setState(prevState => ({
        vectorLayers: prevState.vectorLayers.filter(
          layer => layer.name !== groupName
        )
      }));
    }
  }

  init(id) {
    if (this.state.map) return;

    let map = L.map(id, config.params);
    //L.control.zoom({ position: 'bottomleft' }).addTo(map);
    //L.control.scale({ position: 'bottomleft' }).addTo(map);

    // a TileLayer is used as the "basemap"
    const tileLayer = L.tileLayer(
      config.tileLayer.uri,
      config.tileLayer.params
    ).addTo(map);

    map.measureTool = L.layerGroup().addTo(map);

    //Zoom at level 12
    let tooltipThreshold = 14;
    map.on('zoomend', () => {
      let zoom = map.getZoom();
      let lastZoom;
      if (this.state.lastZoom) lastZoom = this.state.lastZoom;
      else lastZoom = map.getZoom();

      if (
        zoom < tooltipThreshold &&
        (!lastZoom || lastZoom >= tooltipThreshold)
      ) {
        map.getPane('tooltipPane').style.display = 'none';
      } else if (
        zoom >= tooltipThreshold &&
        (!lastZoom || lastZoom < tooltipThreshold)
      ) {
        map.getPane('tooltipPane').style.display = 'block';
      }
      this.setState({ lastZoom: zoom });
    });

    // set our state to include the tile layer
    this.setState({ map, tileLayer });
  }

  render() {
    const { classes } = this.props;
    return (
      <div id="mapUI">
        <MapProvider value={this}>
          <RightPanel />
          <MeasureTool />
          <CoordinatesTool />

          {this.state.editTool.isActive && (
            <EditTool
              editLayer={this.state.editTool.editLayer}
              contextLayer={this.state.editTool.contextLayer}
              featureGroup={this.state.editTool.featureGroup}
              result={this.setResultEditTool}
              unmountMe={this.disableEditTool}
              //ref={ref => (this.editToolRef = ref)}
              ref={this.myRef}
            />
          )}
        </MapProvider>
        <div
          ref={node => (this._mapNode = node)}
          id="map"
          className={classes.map}
          style={this.state.cursor ? { cursor: this.state.cursor } : {}}
        />
      </div>
    );
  }
}

export default withStyles(useStyles)(Map);
