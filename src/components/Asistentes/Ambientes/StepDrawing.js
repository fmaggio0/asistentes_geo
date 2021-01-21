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
  const [groupName, setGroupName] = useState('drawAmbientes');
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
      let editLayer = null;
      let context = lote.toGeoJSON();
      let context2 = mapContext.state.vectorLayers.find(
        e => e.name === groupName
      );
      let bbox = turf.bbox(context);
      let bboxPolygon = turf.bboxPolygon(bbox);
      let buffered = turf.buffer(bboxPolygon, 500, { units: 'meters' });
      let bboxWithDifference = turf.difference(buffered, context);

      if (context2) {
        context2 = context2.layer.toGeoJSON();
        bboxWithDifference = turf.union(
          ...context2.features,
          bboxWithDifference
        );
      }

      let contextLayer = L.GeoJSON.geometryToLayer(bboxWithDifference);
      mapContext.enableEditTool(editLayer, contextLayer, groupName);
    }
  }, [ambiente]);

  const handleChange = event => {
    /*let context2 = mapContext.state.vectorLayers.find(
      e => e.name === groupName
    );*/
    setAmbiente(event.target.value);

    mapContext.saveEditTool(event.target.value, {
      fillColor: '#000000',
      weight: 1,
      opacity: 1,
      color: '#000000',
      fillOpacity: 0,
      dashArray: 0
    });
  };

  const handleChangeNotas = event => {
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
