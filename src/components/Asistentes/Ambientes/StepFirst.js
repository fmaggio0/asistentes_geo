import React, { useState, useEffect, useContext } from 'react';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
/* Step by Step */
import StepByStepContext from 'src/contexts/StepByStepContext';
import MobileStepper from '@material-ui/core/MobileStepper';
import { faArrowRight, faArrowLeft } from '@fortawesome/pro-regular-svg-icons';
/* Components */
import SelectField from '../SelectField';

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

const StepFirst = props => {
  const classes = useStyles();
  const {
    totalStep,
    activeStep,
    handleNext,
    handleBack,
    sharedData
  } = useContext(StepByStepContext);
  const [layerName, setLayerName] = useState(sharedData.layerName || '');
  const [field, setField] = useState(sharedData.field || '');
  const [mode, setMode] = useState(sharedData.mode || '');

  useEffect(() => {
    let data = { layerName, field, mode };
    props.sharedData(data);
  }, [layerName, field, mode]);

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

      <SelectField onChange={value => setField(value)} />

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
      <MobileStepper
        variant="dots"
        steps={totalStep}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={!layerName || !mode || !field}
          >
            Siguiente
            <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 5 }} />
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={true}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 5 }} />
            Atras
          </Button>
        }
      />
    </>
  );
};

export default StepFirst;
