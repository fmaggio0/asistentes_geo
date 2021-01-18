import React, { useState, useContext, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import EditTool from 'src/components/GisTools/EditTool';
import L from 'leaflet';

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
  const { ambientes } = props;
  const mapContext = useContext(MapContext);

  /*useEffect(() => {
    let editlayer = mapContext.state.selected;
    let editlayer1 = L.featureGroup();

    console.log(editlayer1);

    let contextlayer = mapContext.state.vectorLayers.find(
      element => element.name === 'lotes'
    ).layer;

    mapContext.enableEditTool(editlayer, contextlayer);
  }, []);*/

  const handleChange = event => {
    console.log(event.target.value);

    setAmbiente(event.target.value);

    let editlayer = null;
    let contextlayer = mapContext.state.vectorLayers.find(
      element => element.name === 'lotes'
    ).layer;

    mapContext.enableEditTool(editlayer, contextlayer);

    /*mapContext.state.map.baseLayer.on('click', function(e) {
      console.log(e.layer.setStyle());
      e.layer.setStyle({
        fillColor: event.target.value.color,
        fillOpacity: '1',
        weight: '1',
        color: '#000000'
      });
    });*/
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
