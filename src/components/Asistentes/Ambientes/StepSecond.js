import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import dataCapaBase from 'src/data/capasbase.json';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
/* Componentes */
import TipoZona from './TipoZona';
/* Map context */
import MapContext from 'src/contexts/MapContext';
/* Step by Step */
import StepByStepContext from 'src/contexts/StepByStepContext';
import MobileStepper from '@material-ui/core/MobileStepper';
import { faArrowRight, faArrowLeft } from '@fortawesome/pro-regular-svg-icons';

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
  const {
    totalStep,
    activeStep,
    handleNext,
    handleBack,
    sharedData
  } = useContext(StepByStepContext);
  const [baseLayer, setBaseLayer] = useState([]);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState('');
  const [tipoZona, setTipoZona] = useState(sharedData.tipoZona || '');
  const mapContext = useContext(MapContext);

  useEffect(() => {
    //Axios api call to set if mode baselayer
    if (sharedData.mode === 'layer') setBaseLayer(baseLayers);
    mapContext.toggleSelected(false);
  }, []);

  useEffect(() => {
    let baseLayer = selectedBaseLayer;
    let data = { baseLayer, tipoZona };
    props.sharedData(data);
  }, [selectedBaseLayer, tipoZona]);

  useEffect(() => {
    console.log(selectedBaseLayer);
    //Axios api call para traer geometrias de la capa base
    if (selectedBaseLayer) {
      mapContext.addGeoJSONLayer(dataCapaBase, 'ambientes_capa_base');
    }
  }, [selectedBaseLayer]);

  const onBack = () => {
    mapContext.removeVectorGroup('ambientes_capa_base');
    handleBack();
  };

  return (
    <>
      {sharedData.mode === 'layer' && (
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
      <MobileStepper
        variant="dots"
        steps={totalStep}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={
              !tipoZona ||
              (sharedData.mode === 'layer' ? !selectedBaseLayer : false)
            }
          >
            Siguiente
            <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 5 }} />
          </Button>
        }
        backButton={
          <Button size="small" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 5 }} />
            Atras
          </Button>
        }
      />
    </>
  );
};

export default StepSecond;
