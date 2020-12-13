import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// using webpack json loader we can import our geojson file like this
import lotes from 'src/data/Fields.json';
//Import asistentes
import ButtonActionAmbientes from 'src/components/Asistentes/Ambientes/ButtonAction';
import { MapProvider } from '../../../contexts/MapContext';
import { makeStyles } from '@material-ui/core/styles';
import * as turf from '@turf/turf';

// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
/*let config = {};
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
};*/

const useStyles = makeStyles(() => ({
  map: {
    position: 'absolute !important',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
}));

mapboxgl.accessToken =
  'pk.eyJ1IjoiZm1hZ2dpbzAiLCJhIjoiY2lyZGR0eTZnMDFoOWdkbmtuemFkMTQwbCJ9.N0HcWR84YaN4_uZfQ9Rp8g';

const Map = () => {
  const classes = useStyles();
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [11.195646, -22.428401],
      zoom: 2
    });

    let hoveredStateId = null;

    map.on('load', () => {
      map.addSource('lotes', {
        type: 'geojson',
        data: lotes,
        generateId: true
      });

      map.addLayer({
        id: 'lotes',
        type: 'fill',
        source: 'lotes',
        layout: {},
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.8
        }
      });

      map.addLayer({
        id: 'seledtedLote',
        type: 'line',
        source: 'lotes',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'click'], false],
            '#000',
            '#2e6fd9'
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'click'], false],
            4,
            1
          ]
        }
      });

      setMap(map);
    });

    map.on('sourcedata', function(e) {
      if (e.isSourceLoaded && e.sourceDataType === 'visibility') {
        let bbox = turf.bbox(e.source.data);
        map.fitBounds(bbox, { padding: 20 });
      }
    });

    /*this function would then be used to change the 'click' feature state
when the feature is clicked on*/
    map.on('click', 'lotes', function(e) {
      console.log(e);
      var features = map.queryRenderedFeatures(e.point, { layers: ['lotes'] });
      console.log(features);
      for (var i = 0; i < features.length; i++) {
        map.setFeatureState(
          { source: 'lotes', id: features[i].id },
          { click: true }
        );
      }
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /*const fitBounds = geojson => {
    if (map) {
      let bbox = turf.bbox(geojson);
      map.fitBounds(bbox, { padding: 20 });
    }
  };*/

  return (
    <div id="mapUI">
      <MapProvider value={map}>
        <ButtonActionAmbientes />
      </MapProvider>
      <div ref={mapContainerRef} id="map" className={classes.map} />
    </div>
  );
};

export default Map;
