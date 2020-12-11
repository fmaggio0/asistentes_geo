import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
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
    position: 'absolute',
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
      center: [-79.38, 43.65],
      zoom: 12.5
    });

    map.on('load', () => {
      setMap(map);

      map.addSource('lotes', {
        type: 'geojson',
        data: lotes
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
    });

    map.on('sourcedata', function(e) {
      if (e.isSourceLoaded && e.sourceDataType === 'visibility') {
        console.log(e);
        fitBounds(e.source.data);
      }
    });

    // change cursor to pointer when user hovers over a clickable feature
    /*map.on('mouseenter', e => {
      if (e.features.length) {
        map.getCanvas().style.cursor = 'pointer';
      }
    });

    // reset cursor to default when user is no longer hovering over a clickable feature
    map.on('mouseleave', () => {
      map.getCanvas().style.cursor = '';
    });

    // add tooltip when users mouse move over a point
    map.on('mousemove', e => {
      const features = map.queryRenderedFeatures(e.point);
      if (features.length) {
        const feature = features[0];

        // Create tooltip node
        const tooltipNode = document.createElement('div');
        ReactDOM.render(<Tooltip feature={feature} />, tooltipNode);

        // Set tooltip on map
        tooltipRef.current
          .setLngLat(e.lngLat)
          .setDOMContent(tooltipNode)
          .addTo(map);
      }
    });*/

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fitBounds = geojson => {
    let bbox = turf.bbox(geojson);
    console.log(bbox);
    console.log(map);
    map.fitBounds(bbox, { padding: 20 });
  };

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
