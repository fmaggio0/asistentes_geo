import React, { useState, useContext, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import EditTool from 'src/components/GisTools/EditTool';
import L from 'leaflet';
import * as turf from '@turf/turf';

//Context
import MapContext from '../../../contexts/MapContext';

const useStyles = makeStyles(theme360 => ({
  labelTitle: {
    color: '#4A4A49',
    fontWeight: 'bold',
    fontSize: '14px'
  }
}));

export default props => {
  const classes = useStyles();
  const [ambiente, setAmbiente] = useState('');
  const [notas, setNotas] = useState('');
  const { ambientes, lote } = props;
  const mapContext = useContext(MapContext);

  useEffect(() => {
    /*let editlayer = null;
    let bbox = turf.bbox(lote.toGeoJSON());
    let bboxPolygon = turf.bboxPolygon(bbox);
    let buffered = turf.buffer(bboxPolygon, 500, { units: 'meters' });
    let bboxWithDifference = turf.difference(buffered, lote.toGeoJSON());
    let contextLayer = L.GeoJSON.geometryToLayer(bboxWithDifference);
    mapContext.enableEditTool(editlayer, contextLayer, 'drawAmbientes');*/
    setAmbiente(ambientes.properties[0]);
    return () => {
      // unmount
      mapContext.disableEditTool();
    };
  }, []);

  useEffect(() => {
    if (ambiente) {
      let type = 'drawAmbientes';
      let editlayer = null;

      let context;
      let context2 = mapContext.state.vectorLayers.find(e => e.name === type);
      console.log(context2);
      if (context2) {
        context = turf.combine(context, context2);
        console.log('hay contexto 2');
        console.log(context);
      } else {
        context = lote.toGeoJSON();
      }
      context = lote.toGeoJSON();
      let bbox = turf.bbox(lote.toGeoJSON());
      let bboxPolygon = turf.bboxPolygon(bbox);
      let buffered = turf.buffer(bboxPolygon, 500, { units: 'meters' });
      let bboxWithDifference = turf.difference(buffered, lote.toGeoJSON());
      let contextLayer = L.GeoJSON.geometryToLayer(bboxWithDifference);
      mapContext.enableEditTool(editlayer, contextLayer, type);
    }
  }, [ambiente]);

  useEffect(() => {
    console.log(mapContext.state.vectorLayers);
  }, [mapContext.state.vectorLayers]);

  const handleChange = event => {
    setAmbiente(event.target.value);

    mapContext.saveEditTool();
  };

  const handleChangeNotas = event => {
    console.log('notas');
    setNotas(event.target.value);
  };

  return (
    <>
      <Box my={2}>
        <Typography variant="subtitle2">Tipo de ambiente:</Typography>
        <Typography variant="body1">{ambientes.name}</Typography>
      </Box>
      <Box my={2}>
        <Typography component="label" className={classes.labelTitle}>
          Ambiente:
        </Typography>

        <Select
          style={{ minWidth: '100%' }}
          color="primary"
          onChange={handleChange}
          value={ambiente}
        >
          {ambientes.properties &&
            ambientes.properties.map(row => (
              <MenuItem value={row} key={row.value}>
                {row.value}
              </MenuItem>
            ))}
        </Select>
      </Box>
      <Box my={2}>
        <Typography component="label" className={classes.labelTitle}>
          Notas:
        </Typography>

        <TextField
          value={notas}
          onChange={handleChangeNotas}
          style={{ minWidth: '100%' }}
        />
      </Box>
    </>
  );
};
