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
import dataCapaBase from 'src/data/capasbase.json';

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

const StepSecond = props => {
  const classes = useStyles();
  const [baseLayer, setBaseLayer] = useState([]);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState(
    props.data.baseLayer || ''
  );
  const [tipoZona, setTipoZona] = useState(props.data.tipoZona || '');
  const mapContext = useContext(MapContext);

  useEffect(() => {
    //Axios api call to set
    setBaseLayer(baseLayers);
  }, []);

  useEffect(() => {
    let baseLayer = selectedBaseLayer;
    let data = { baseLayer, tipoZona };
    props.sharedData(data);
  }, [selectedBaseLayer, tipoZona]);

  useEffect(() => {
    //Axios api call para traer geometrias de la capa base
    if (selectedBaseLayer) {
      mapContext.addGeoJSONLayer(dataCapaBase, 'ambientes_capa_base');
      mapContext.toggleSelected(false);
    }
  }, [selectedBaseLayer]);

  const handlerTipoZona = tipoZona => {
    setTipoZona(tipoZona);
  };

  return (
    <>
      {props.data.mode === 'layer' && (
        <Grid container className={classes.root}>
          <Grid item xs={12}>
            <Typography component="label" variant="subtitle2">
              Capa base
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Select
              style={{ minWidth: '100%' }}
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
      )}
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <TipoZona
            onChangeTipoZona={value => setTipoZona(value)}
            tipozona={tipoZona}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default StepSecond;