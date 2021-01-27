import React, { useState, useEffect, useContext } from 'react';

/* Componentes */
import Capa from './Capa';
import Lote from './Lote';
import Modalidad from './Modalidad';
import TipoZona from './TipoZona';
import CapaBase from './CapaBase';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faHandPointer } from '@fortawesome/pro-light-svg-icons';

//Context
import MapContext from '../../../contexts/MapContext';

const useStyles = makeStyles(theme => ({
  root: {
    padding: 0,
    paddingBottom: 10
  },
  ToggleButtonGroup: {
    width: '100%',
    marginTop: 10
  },
  ToggleButton: {
    width: '50%'
  }
}));

/* Datos temporales */
const baseLayers = [
  { id: 1, name: 'mp: L 20 quantile 5' },
  { id: 2, name: 'mp: L 50 quantile 50' }
];

const StepInit = props => {
  const classes = useStyles();
  const [layerName, setLayerName] = useState(props.data.layerName || '');
  const [field, setField] = useState(props.data.field || '');
  const [mode, setMode] = useState(props.data.mode || '');
  const mapContext = useContext(MapContext);

  useEffect(() => {
    let data = { layerName, field, mode };
    console.log(field);
    props.sharedData(data);
  }, [layerName, field, mode]);

  useEffect(() => {
    if (mapContext.state.selected.layer) {
      setField(mapContext.state.selected.layer);
    } else {
      setField('');
      setMode('');
    }
  }, [mapContext.state.selected.layer]);

  return (
    <>
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Typography component="label" variant="subtitle2">
            Nombre de la capa
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            size="small"
            className={classes.layerName}
            value={layerName}
            onChange={e => setLayerName(e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Typography component="label" variant="subtitle2">
            Lote (seleccione en el mapa)
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          style={{ display: 'inline-flex', alignItems: 'flex-end' }}
        >
          <FontAwesomeIcon
            icon={faHandPointer}
            size={'lg'}
            style={{ marginRight: 10 }}
          />
          <TextField
            value={field ? field.feature.properties.Field : ''}
            InputProps={{
              readOnly: true
            }}
            fullWidth
          />
        </Grid>
      </Grid>
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Typography component="label" variant="subtitle2">
            Modalidad
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={mode}
            onChange={(e, newValue) => setMode(newValue)}
            className={classes.ToggleButtonGroup}
          >
            <ToggleButton
              value="drawing"
              className={classes.ToggleButton}
              disabled={!field}
            >
              Dibujo libre
            </ToggleButton>
            <ToggleButton
              value="layer"
              className={classes.ToggleButton}
              disabled={!field}
            >
              Capa base
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </>
  );
};

export default StepInit;
