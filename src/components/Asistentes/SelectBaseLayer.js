import React, { useState, useEffect, useContext } from 'react';
import { faHandPointer } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
/* Map Context */
import MapContext from 'src/contexts/MapContext';

const useStyles = makeStyles(theme => ({
  root: {
    padding: 0,
    paddingBottom: 10
  }
}));

/* Datos temporales */
const baseLayers = [
  { id: 1, name: 'mp: L 20 quantile 5' },
  { id: 2, name: 'mp: L 50 quantile 50' }
];

const SelectBaseLayer = props => {
  const classes = useStyles();
  const [selectedBaseLayer, setSelectedBaseLayer] = useState('');
  const [baseLayer, setBaseLayer] = useState([]);
  const mapContext = useContext(MapContext);

  useEffect(() => {
    //Axios api call to set if mode baselayer
    setBaseLayer(baseLayers);
    mapContext.toggleSelected(false);
  }, []);

  useEffect(() => {
    props.onChange(selectedBaseLayer);
  }, [selectedBaseLayer]);

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12}>
        <Typography component="label" variant="subtitle2">
          Capa base
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Select
          fullWidth
          onChange={e => setSelectedBaseLayer(e.target.value)}
          value={selectedBaseLayer}
        >
          {baseLayer &&
            baseLayer.map(row => (
              <MenuItem value={row.id} key={row.id}>
                {row.name}
              </MenuItem>
            ))}
        </Select>
      </Grid>
    </Grid>
  );
};

export default SelectBaseLayer;
