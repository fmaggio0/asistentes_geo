import React, { useState, useEffect, useContext } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import MapContext from 'src/contexts/MapContext';
import dataCapaBase from 'src/data/capasbase.json';
import L from 'leaflet';

function onEachFeature(feature, layer) {
  if (feature.properties) {
    layer.bindTooltip(
      function(layer) {
        return (
          '<pre>' +
          JSON.stringify(feature.properties, null, ' ').replace(/[{}"]/g, '') +
          '</pre>'
        );
      },
      { opacity: 0.75, offset: [0, -5], direction: 'top', sticky: true } //then add your options
    );
  }
}

const baseLayers = [
  { id: 1, name: 'mp: L 20 quantile 5' },
  { id: 2, name: 'mp: L 50 quantile 50' }
];

export default props => {
  const [baseLayer, setBaseLayer] = useState([]);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState([]);
  const mapContext = useContext(MapContext);
  const { capabase } = props;

  const handleChange = event => {
    let value = event.target.value;
    setSelectedBaseLayer(value);
    props.onChangeCapabase(baseLayer.find(layer => layer.id === value));
  };

  useEffect(() => {
    //Axios api call to set
    setBaseLayer(baseLayers);
  }, []);

  useEffect(() => {
    //Axios api call to set
    if (selectedBaseLayer.length === 0 && capabase) {
      setSelectedBaseLayer(capabase.id);
    }
  }, [capabase, selectedBaseLayer]);

  useEffect(() => {
    //Axios api call para traer geometrias de la capa base
    if (selectedBaseLayer > 0 && mapContext.state.map.baseLayer === null) {
      var capabase = new L.GeoJSON(dataCapaBase, {
        onEachFeature: onEachFeature
      });
      capabase.addTo(mapContext.state.map);
      mapContext.state.map.baseLayer = capabase;
    }
    // eslint-disable-next-line
  }, [selectedBaseLayer]);

  return (
    <div>
      <Box mt={2}>
        <Typography component="label" variant="subtitle2">
          Capa base
        </Typography>
      </Box>
      <Select
        style={{ minWidth: '100%' }}
        onChange={handleChange}
        value={selectedBaseLayer}
      >
        {baseLayer &&
          baseLayer.map(row => (
            <MenuItem value={row.id} key={row.id}>
              {row.name}
            </MenuItem>
          ))}
      </Select>
    </div>
  );
};
