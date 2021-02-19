import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
/* Step by Step */
import StepByStepContext from 'src/contexts/StepByStepContext';
import MobileStepper from '@material-ui/core/MobileStepper';
import { faArrowRight, faArrowLeft } from '@fortawesome/pro-regular-svg-icons';
/* Components */
import SelectField from '../SelectField';
import SelectBaseLayer from '../SelectBaseLayer';

const useStyles = makeStyles(theme => ({
  root: {
    padding: 0,
    paddingBottom: 10
  }
}));

/* Data temporal */
const treatment = ['Fertilización', 'Pesticidas', 'Agua', 'Agroquimicos'];
const unit = ['tn/ha', 'kg/ha', 'hl/ha'];

const StepFirst = props => {
  const classes = useStyles();
  const {
    totalStep,
    activeStep,
    handleNext,
    handleBack,
    sharedData
  } = useContext(StepByStepContext);
  const [field, setField] = useState(sharedData.field || '');
  const [selectedBaseLayer, setSelectedBaseLayer] = useState(
    sharedData.baseLayer || ''
  );
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [input, setInput] = useState('');

  const nextStep = () => {
    let baseLayer = selectedBaseLayer;
    let data = {
      field,
      baseLayer,
      treatment: [...sharedData.treatment, selectedTreatment],
      unit: [...sharedData.unit, selectedUnit],
      input: [...sharedData.input, input]
    };
    props.sharedData(data);
    handleNext();
  };

  return (
    <>
      <SelectField
        onChange={value => setField(value)}
        disabled={sharedData.addCanal}
        value={field}
      />

      <SelectBaseLayer
        nameGroup={'prescripcion_capa_base'}
        onChange={value => setSelectedBaseLayer(value)}
        value={selectedBaseLayer}
        disabled={sharedData.addCanal}
      />

      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Typography component="label" variant="subtitle2">
            Tratamiento
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Select
            fullWidth
            onChange={e => setSelectedTreatment(e.target.value)}
            value={selectedTreatment}
          >
            {treatment &&
              treatment.map(row => (
                <MenuItem value={row} key={row}>
                  {row}
                </MenuItem>
              ))}
          </Select>
        </Grid>
      </Grid>

      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Typography component="label" variant="subtitle2">
            Unidad
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Select
            fullWidth
            onChange={e => setSelectedUnit(e.target.value)}
            value={selectedUnit}
          >
            {unit &&
              unit.map(row => (
                <MenuItem value={row} key={row}>
                  {row}
                </MenuItem>
              ))}
          </Select>
        </Grid>
      </Grid>

      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Typography component="label" variant="subtitle2">
            Insumo
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={input}
            fullWidth
            onChange={event => setInput(event.target.value)}
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
            onClick={nextStep}
            disabled={
              !field ||
              !selectedBaseLayer ||
              !selectedTreatment ||
              !selectedUnit ||
              !input
            }
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
