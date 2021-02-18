import React, { useState, useEffect, useContext } from 'react';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointer } from '@fortawesome/pro-light-svg-icons';
import ToggleButton from '@material-ui/lab/ToggleButton';
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
/* Map Context */
import MapContext from 'src/contexts/MapContext';
/* Components */
import SelectField from '../SelectField';
import SelectBaseLayer from '../SelectBaseLayer';

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
  const [selectedTreatment, setSelectedTreatment] = useState(
    sharedData.treatment || ''
  );
  const [selectedUnit, setSelectedUnit] = useState(sharedData.unit || '');
  const [input, setInput] = useState(sharedData.input || '');
  const mapContext = useContext(MapContext);

  useEffect(() => {
    let baseLayer = selectedBaseLayer;
    let treatment = selectedTreatment;
    let unit = selectedUnit;
    let data = { field, baseLayer, treatment, unit, input };
    props.sharedData(data);
  }, [field, selectedBaseLayer, selectedTreatment, selectedUnit, input]);

  /*useEffect(() => {
    //Axios api call para traer geometrias de la capa base
    if (selectedBaseLayer) {
      mapContext.addGeoJSONLayer(dataCapaBase, 'prescripcion_capa_base');
    }
  }, [selectedBaseLayer]);*/

  return (
    <>
      <SelectField onChange={value => setField(value)} />

      <SelectBaseLayer
        nameGroup={'prescripcion_capa_base'}
        onChange={value => setSelectedBaseLayer(value)}
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
            onClick={handleNext}
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
