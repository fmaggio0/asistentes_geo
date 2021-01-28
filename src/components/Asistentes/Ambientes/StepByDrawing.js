import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/pro-light-svg-icons';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import * as turf from '@turf/turf';
import L from 'leaflet';

//Context
import MapContext from '../../../contexts/MapContext';

const useStyles = makeStyles(theme360 => ({
  root: {
    padding: 0,
    paddingBottom: 10
  },
  labelTitle: {
    color: '#4A4A49',
    fontWeight: 'bold',
    fontSize: '14px'
  }
}));

const download = (content, fileName, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

export default props => {
  const classes = useStyles();
  const [groupName, setGroupName] = useState('drawAmbientes');
  const [ambiente, setAmbiente] = useState('');
  const [notes, setNotes] = useState('');
  const { ambientes, lote } = props;
  const mapContext = useContext(MapContext);

  useEffect(() => {
    setAmbiente(ambientes.properties[0]);
    return () => {
      // unmount
      mapContext.disableEditTool();
    };
  }, []);

  useEffect(() => {
    if (ambiente) {
      //Search previous layer
      let foundLayerGroup = mapContext.state.vectorLayers.find(
        e => e.name === groupName
      );
      let lastLayer = null;
      if (foundLayerGroup) {
        foundLayerGroup.layer.eachLayer(function(layer) {
          if (layer.feature.properties.id === ambiente.id) lastLayer = layer;
        });
      }

      //generate context layer
      let context = lote.toGeoJSON();
      let bbox = turf.bbox(context);
      let bboxPolygon = turf.bboxPolygon(bbox);
      let buffered = turf.buffer(bboxPolygon, 1000, { units: 'meters' });
      let bboxWithDifference = turf.difference(buffered, context);
      if (foundLayerGroup) {
        if (lastLayer) foundLayerGroup.layer.removeLayer(lastLayer);
        let context2 = foundLayerGroup.layer.toGeoJSON();
        bboxWithDifference = turf.union(
          ...context2.features,
          bboxWithDifference
        );
      }
      let contextLayer = L.geoJson();
      contextLayer.addData(bboxWithDifference);
      if (lastLayer) contextLayer.addLayer(lastLayer);

      //Init edittool
      mapContext.enableEditTool(lastLayer, contextLayer, groupName);
    }
  }, [ambiente]);

  const saveEditLayer = () => {
    const properties = {
      id: ambiente.id,
      value: ambiente.value,
      notes: notes
    };
    const styles = {
      fillColor: ambiente.color,
      opacity: 1,
      color: ambiente.color,
      fillOpacity: 0.8
    };

    mapContext.saveEditTool(properties, styles);
  };

  const handleChange = event => {
    setAmbiente(event.target.value);
    setNotes('');
    saveEditLayer();
  };

  const handleChangeNotas = event => {
    setNotes(event.target.value);
  };

  const finish = () => {
    saveEditLayer();
    let foundLayerGroup = mapContext.state.vectorLayers.find(
      e => e.name === groupName
    );
    console.log(foundLayerGroup.layer.toGeoJSON());
    download(
      JSON.stringify(foundLayerGroup.layer.toGeoJSON()),
      'result.geojson',
      'text/plain'
    );
  };

  /*useEffect(() => {
    if (featureGroupAmbientes) {
      let geoJsonResult = featureCollection(featureGroupAmbientes);
      let data = { geoJsonResult };
      props.sharedData(data);
    }
  }, [featureGroupAmbientes]);*/

  return (
    <>
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Tipo de ambiente:</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">{ambientes.name}</Typography>
        </Grid>
      </Grid>

      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Typography component="label" className={classes.labelTitle}>
            Ambiente:
          </Typography>
        </Grid>
        <Grid item xs={10}>
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
        </Grid>
        <Grid item xs={2}>
          <IconButton onClick={saveEditLayer} style={{ padding: 10 }}>
            <FontAwesomeIcon icon={faSave} />
          </IconButton>
        </Grid>
      </Grid>

      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Typography component="label" className={classes.labelTitle}>
            Notas:
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={notes}
            onChange={handleChangeNotas}
            style={{ minWidth: '100%' }}
          />
        </Grid>
      </Grid>
    </>
  );
};
