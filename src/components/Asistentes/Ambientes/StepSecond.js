import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
/* Componentes */
import TipoZona from './TipoZona';
import SelectBaseLayer from '../SelectBaseLayer';
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

const StepSecond = props => {
  const classes = useStyles();
  const {
    totalStep,
    activeStep,
    handleNext,
    handleBack,
    sharedData
  } = useContext(StepByStepContext);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState('');
  const [tipoZona, setTipoZona] = useState(sharedData.tipoZona || '');
  const mapContext = useContext(MapContext);

  useEffect(() => {
    let baseLayer = selectedBaseLayer;
    let data = { baseLayer, tipoZona };
    props.sharedData(data);
  }, [selectedBaseLayer, tipoZona]);

  const onBack = () => {
    mapContext.removeVectorGroup('ambientes_capa_base');
    handleBack();
  };

  return (
    <>
      {sharedData.mode === 'layer' && (
        <SelectBaseLayer
          nameGroup={'ambientes_capa_base'}
          onChange={value => setSelectedBaseLayer(value)}
        />
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
