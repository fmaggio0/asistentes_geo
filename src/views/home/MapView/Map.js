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
    if (map) addGeoJSONLayer(lotes, 'lotes');
  }, [map]);

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

    // fit the geographic extent of the GeoJSON layer within the map's bounds / viewport
    zoomToFeature(geojsonLayer);
  };

  const zoomToFeature = target => {
    // set the map's center & zoom so that it fits the geographic extent of the layer
    map.fitBounds(target.getBounds());
  };

  const onEachFeatureClosure = groupName => {
    const onEachFeature = (feature, layer) => {
      //console.log(feature);
      layer.on('click', e => {
        select(e.target);
      });

      //Ver como se cargarán estilos
      if (feature.styles) {
        layer.setStyle(feature.styles);
      }

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

  const enableEditTool = (editlayer, contextlayer, groupName, advancedEdit) => {
    setEditTool({
      isActive: true,
      groupName: groupName,
      editLayer: editlayer,
      contextLayer: contextlayer,
      advancedEdit: advancedEdit
    });
  };

  const disableEditTool = () => {
    setEditTool({
      isActive: false,
      groupName: null,
      editLayer: null,
      contextLayer: null,
      advancedEdit: false
    });
  };

  const saveEditTool = (properties, style, groupName) => {
    /*console.log('saveedittol');*/
    editToolRef.current.saveEditLayer(properties, style);
  };

  const setResultEditTool = data => {
    let found = vectorLayers.find(e => e.name === data.type);
    if (found) {
      if (data.operation === 'create') {
        found.layer.addData(data.geojson);
      }
      if (data.operation === 'update') {
        found.layer.addData(data.geojson);
        found.layer.removeLayer(found.layer.getLayer(data.id));
      }
      if (data.operation === 'remove') {
        found.layer.removeLayer(found.layer.getLayer(data.id));
      }
    } else {
      if (data.operation === 'create') {
        addGeoJSONLayer(data.geojson, data.type, data.styles);
      }
    }

    setSelected(null);
  };

  const getResultEditTool = () => {
    return editTool.result;
  };

  const removeLayerById = (leafletId, groupName) => {
    let found = vectorLayers.find(e => e.name === groupName);
    if (found) found.layer.removeLayer(found.layer.getLayer(leafletId));
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

  return (
    <div id="mapUI">
      <MapProvider
        value={{
          state: { map, selected, vectorLayers },
          enableEditTool,
          cursorOnMap,
          removeVectorGroup,
          saveEditTool,
          disableEditTool,
          removeLayerById,
          setResultEditTool
        }}
      >
        <RightPanel />
        <MeasureTool />
        <CoordinatesTool />

        {editTool.isActive && (
          <EditTool
            editLayer={editTool.editLayer}
            contextLayer={editTool.contextLayer}
            groupName={editTool.groupName}
            //result={setResultEditTool}
            unmountMe={disableEditTool}
            ref={editToolRef}
            advancedEdit={editTool.advancedEdit}
          />
        )}
      </MapProvider>
      <div
        id="map"
        className={classes.map}
        style={cursor ? { cursor: cursor } : {}}
      />
    </div>
  );
};

export default Map;
