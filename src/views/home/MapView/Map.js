import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core';
import L from 'leaflet';
import 'leaflet-editable';
import 'leaflet-measure-path/leaflet-measure-path';
// import CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet-measure-path/leaflet-measure-path.css';
import 'src/assets/css/map.css';

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

const useStyles = makeStyles(theme => ({
  map: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%'
  }
}));

const Map = props => {
  const classes = useStyles();
  var useStateRef = require('react-usestateref');
  const [map, setMap] = useState(null);
  const [tileLayer, setTileLayer] = useState(null);
  const [vectorLayers, setVectorLayers] = useState([]);
  const [selected, setSelected, selectedRef] = useStateRef(null);
  const [editSelected, setEditSelected] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [lastZoom, setLastZoom] = useState(null);
  const [editTool, setEditTool] = useState({
    isActive: false,
    editLayer: null,
    contextLayer: null,
    result: null
  });
  const editToolRef = useRef();

  useEffect(() => {
    let map = L.map('map', config.params);
    //L.control.zoom({ position: 'bottomleft' }).addTo(map);

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
      let lastZoomMap;
      if (lastZoom) lastZoomMap = lastZoom;
      else lastZoomMap = map.getZoom();

      if (
        zoom < tooltipThreshold &&
        (!lastZoomMap || lastZoomMap >= tooltipThreshold)
      ) {
        map.getPane('tooltipPane').style.display = 'none';
      } else if (
        zoom >= tooltipThreshold &&
        (!lastZoomMap || lastZoomMap < tooltipThreshold)
      ) {
        map.getPane('tooltipPane').style.display = 'block';
      }
      setLastZoom(zoom);
    });

    // set our state to include the tile layer and map
    setMap(map);
    setTileLayer(tileLayer);
  }, []);

  useEffect(() => {
    if (map) {
      addGeoJSONLayer(lotes, 'lotes');
    }
  }, [map]);

  /*componentDidMount() {
    // code to run just after the component "mounts" / DOM elements are created
    // we could make an AJAX request for the GeoJSON data here if it wasn't stored locally
    getData();
    // create the Leaflet map object
    if (!state.map) init(_mapNode);
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(prevState);
    if (prevState.vectorLayers !== state.vectorLayers) {
      console.log('cambio:', state.vectorLayers);
    }
    //console.log(prevProps);
    // code to run when the component receives new props or state
    // check to see if geojson is stored, map is created, and geojson overlay needs to be added
    if (state.geojson && state.map && !state.geojsonLayer) {
      // add the geojson overlay
      addGeoJSONLayer(state.geojson, 'lotes');
    }
  }

  componentWillUnmount() {
    // code to run just before unmounting the component
    // this destroys the Leaflet map object & related event listeners
    //state.map.remove();
  }*/

  /*const getData = () => {
    // could also be an AJAX request that results in setting state with the geojson data
    // for simplicity sake we are just importing the geojson data using webpack's json loader
    setState({
      geojson: lotes
    });
  };*/

  const cursorOnMap = type => {
    if (type) setCursor(type);
    else setCursor(null);
  };

  const addGeoJSONLayer = (geojson, groupName, styles) => {
    // create a native Leaflet GeoJSON SVG Layer to add as an interactive overlay to the map
    // an options object is passed to define functions for customizing the layer
    let geojsonLayer = L.geoJson(geojson, {
      onEachFeature: onEachFeatureClosure(groupName),
      style: function() {
        if (styles) {
          return styles;
        }
        return styleEmpty;
      }
    });
    // add our GeoJSON layer to the Leaflet map object
    geojsonLayer.addTo(map);

    //lotes
    let layer1 = {
      name: groupName,
      layer: geojsonLayer
    };

    setVectorLayers([...vectorLayers, layer1]);
    //console.log(layer);
    //setState({ ...state, prueba: layer });

    // store the Leaflet GeoJSON layer in our component state for use later
    //let copy = [...state.vectorLayers];
    /*setState({
      geojsonLayer: geojsonLayer.toGeoJSON(),
      vectorLayers: [...state.vectorLayers, layer1]
    });*/

    /*const currentScores = state.vectorLayers;
    const newScores = currentScores.concat(layer);
    setState({ vectorLayers: newScores }, function() {
      console.log(state.vectorLayers);
    });*/

    // fit the geographic extent of the GeoJSON layer within the map's bounds / viewport
    zoomToFeature(geojsonLayer);
  };

  const zoomToFeature = target => {
    // set the map's center & zoom so that it fits the geographic extent of the layer
    map.fitBounds(target.getBounds());
  };

  const onEachFeatureClosure = groupName => {
    const onEachFeature = (feature, layer) => {
      layer.on('click', e => {
        select(e.target);
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
  };

  const highlight = layer => {
    layer.setStyle(styleSelected);
    layer.options.highlight = true;
    setSelected(layer);
  };

  const dehighlight = layer => {
    layer.setStyle(styleEmpty);
    layer.options.highlight = false;
    setSelected(null);
  };

  const select = layer => {
    let previous;
    if (selectedRef.current !== null) {
      previous = selectedRef.current;
    }
    map.fitBounds(layer.getBounds());
    if (previous && previous !== layer) {
      dehighlight(previous);
      highlight(layer);
    } else if (selectedRef.current === layer) {
      dehighlight(previous);
    } else {
      highlight(layer);
    }
  };

  const enableEditTool = (editlayer, contextlayer, featureGroup) => {
    /*setState(prevState => ({
      editTool: {
        ...prevState.editTool,
        isActive: true,
        featureGroup: featureGroup,
        editLayer: editlayer,
        contextLayer: contextlayer
      }
    }));*/
    setEditTool({
      isActive: true,
      featureGroup: featureGroup,
      editLayer: editlayer,
      contextLayer: contextlayer
    });
  };

  const disableEditTool = () => {
    /*setState(prevState => ({
      editTool: {
        ...prevState.editTool,
        isActive: false,
        featureGroup: null,
        editLayer: null,
        contextLayer: null
      }
    }));*/
    setEditTool({
      isActive: false,
      featureGroup: null,
      editLayer: null,
      contextLayer: null
    });
  };

  const saveEditTool = (properties, style) => {
    //console.log('saveedittol');
    editToolRef.current.saveEditLayer(properties, style);
  };

  const setResultEditTool = data => {
    data.forEach(element => {
      let found = vectorLayers.find(e => e.name === element.type);
      if (found) {
        if (element.operation === 'create') {
          found.layer.addData(element.geojson);
        }
        if (element.operation === 'update') {
          found.layer.removeLayer(found.layer.getLayer(element.id));
          found.layer.addData(element.geojson);
        }
        if (element.operation === 'remove') {
          found.layer.removeLayer(found.layer.getLayer(element.id));
        }
      } else {
        if (element.operation === 'create' && !found) {
          addGeoJSONLayer(element.geojson, element.type, element.styles);
        }
      }
    });
    setSelected(null);
  };

  const getResultEditTool = () => {
    return editTool.result;
  };

  const removeVectorGroup = groupName => {
    let found = vectorLayers.find(e => e.name === groupName);
    if (found) {
      map.removeLayer(found.layer);

      /*
      setState(prevState => ({
        vectorLayers: prevState.vectorLayers.filter(
          layer => layer.name !== groupName
        )
      }));*/
    }
  };

  /*
  init(id) {
    if (state.map) return;

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
      if (state.lastZoom) lastZoom = state.lastZoom;
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
      setState({ lastZoom: zoom });
    });

    // set our state to include the tile layer
    setState({ map, tileLayer });
  }*/

  return (
    <div id="mapUI">
      <MapProvider
        value={{
          state: { map, selected, vectorLayers },
          enableEditTool,
          cursorOnMap,
          removeVectorGroup,
          saveEditTool,
          disableEditTool
        }}
      >
        <RightPanel />
        <MeasureTool />
        <CoordinatesTool />

        {editTool.isActive && (
          <EditTool
            editLayer={editTool.editLayer}
            contextLayer={editTool.contextLayer}
            featureGroup={editTool.featureGroup}
            result={setResultEditTool}
            unmountMe={disableEditTool}
            //ref={ref => (editToolRef = ref)}
            ref={editToolRef}
          />
        )}
      </MapProvider>
      <div
        //ref={node => (_mapNode = node)}
        id="map"
        className={classes.map}
        style={cursor ? { cursor: cursor } : {}}
      />
    </div>
  );
};

export default Map;
