import React, { useState, useEffect, useContext } from 'react';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointer, faPalette } from '@fortawesome/pro-light-svg-icons';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { faCircle } from '@fortawesome/pro-solid-svg-icons';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
/* Step by Step */
import StepByStepContext from 'src/contexts/StepByStepContext';
import MobileStepper from '@material-ui/core/MobileStepper';
import { faArrowRight, faArrowLeft } from '@fortawesome/pro-regular-svg-icons';
/* Map Context */
import MapContext from 'src/contexts/MapContext';
/* Components */
import SelectField from '../SelectField';
import SelectBaseLayer from '../SelectBaseLayer';

import * as turf from '@turf/turf';
import { SketchPicker } from 'react-color';

const useStyles = makeStyles(theme => ({
  grid: {
    padding: 0,
    paddingBottom: 10
  },
  ToggleButtonGroup: {
    width: '100%',
    marginTop: 10
  },
  ToggleButton: {
    width: '50%'
  },
  popoverPicker: {
    position: 'absolute',
    zIndex: '2',
    right: '45px',
    paddingBottom: '20px'
  },
  coverPicker: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px'
  }
}));

const iconPalette = <FontAwesomeIcon icon={faPalette} />;
const iconColor = color => {
  color = color || '#000000';
  return <FontAwesomeIcon style={{ color: color }} icon={faCircle} />;
};

const label = (text, helperText) => {
  return (
    <>
      {text}
      <FormHelperText style={{ marginTop: '0px', textAlign: 'center' }}>
        {helperText}
      </FormHelperText>
    </>
  );
};

/* Data temporal */
const data = [
  {
    name: 'muybaja',
    label: label('Muy baja', '(xx has - xx %)'),
    class: 1
  },
  {
    name: 'baja',
    label: label('Baja', '(xx has - xx %)'),
    class: 2
  },
  {
    name: 'media',
    label: label('Media', '(xx has - xx %)'),
    class: 4
  },
  {
    name: 'alta',
    label: label('Alta', '(xx has - xx %)'),
    class: 6
  },
  {
    name: 'muyalta',
    label: label('Muy alta', '(xx has - xx %)'),
    class: 7
  }
];

const types = {
  muybaja: '',
  baja: '',
  media: '',
  alta: '',
  muyalta: ''
};

const StepSecond = props => {
  const classes = useStyles();
  const {
    totalStep,
    activeStep,
    handleNext,
    handleBack,
    sharedData
  } = useContext(StepByStepContext);
  const [rows, setRows] = useState(data);
  const [dose, setDose] = useState(types);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [displayColorPicker, setDisplayColorPicker] = useState({
    muybaja: false,
    baja: false,
    media: false,
    alta: false,
    muyalta: false
  });
  const [colorPicker, setColorPicker] = useState({
    muybaja: '#000000',
    baja: '#000000',
    media: '#000000',
    alta: '#000000',
    muyalta: '#000000'
  });
  const mapContext = useContext(MapContext);

  const handleChange = row => event => {
    let selected = event.target.value;

    /*let copyRows = [...rows];
    let foundIndex = rows.findIndex(x => x.name === row.name);
    copyRows[foundIndex].color = selected.color;
    setRows(copyRows);*/

    setDose({
      ...dose,
      [row.name]: selected
    });

    /*let setAmbientesLayers = [];

    baseLayer.eachLayer(function(layer) {
      if (layer.feature.properties.Class === row.class) {
        let foundIndex = featureGroupAmbientes.findIndex(
          x => x.id === layer._leaflet_id
        );

        let properties = {};
        properties['Id tipo ambientes'] = ambientes.id;
        properties['Tipo ambiente'] = ambientes.name;
        properties['Id ambiente'] = selected.id;
        properties['Nombre ambiente'] = selected.value;
        properties['Notas'] = '';

        if (foundIndex !== -1) {
          let old = featureGroupAmbientes[foundIndex];
          let clone = [...featureGroupAmbientes];
          old.properties = properties;
          clone[foundIndex] = old;
          setFeatureGroupAmbientes(clone);
        } else {
          let layergeo = layer.toGeoJSON();
          layergeo.id = layer._leaflet_id;
          layergeo.properties = properties;
          setAmbientesLayers.push(layergeo);
        }

        layer.setStyle({
          fillColor: selected.color,
          fillOpacity: '1',
          weight: '1',
          color: '#000000'
        });
      }
    });

    const combined2 = [...setAmbientesLayers, ...featureGroupAmbientes];
    setFeatureGroupAmbientes(combined2);*/
  };

  useEffect(() => {
    /* Total */
    let arrayValues = Object.values(dose);
    let total = arrayValues.reduce(function(acc, val) {
      return Number(acc) + Number(val);
    }, 0);
    setTotal(total);
    /* Average per ha */
    let area = turf.area(sharedData.field.toGeoJSON());
    let average1 = total / (area / 10000);
    setAverage(average1.toFixed(2));
  }, [dose]);

  const handleOpenPicker = row => {
    setDisplayColorPicker({
      ...displayColorPicker,
      [row.name]: true
    });
  };

  const handleClosePicker = row => {
    setDisplayColorPicker({
      ...displayColorPicker,
      [row.name]: false
    });
  };

  const handleChangeColor = (color, row) => {
    setColorPicker({
      ...colorPicker,
      [row.name]: color.hex
    });
  };

  return (
    <>
      <Grid item xs={12}>
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table className={classes.table} size="medium">
            <TableHead>
              <TableRow>
                <TableCell align="center" style={{ width: '43%', padding: 10 }}>
                  Zona
                </TableCell>
                <TableCell align="center" style={{ padding: 10 }}>
                  Dosis ({sharedData.unit})
                </TableCell>
                <TableCell align="center" style={{ padding: 10 }}>
                  {iconPalette}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell
                    component="th"
                    scope="row"
                    align="center"
                    style={{ padding: 10 }}
                  >
                    {row.label}
                  </TableCell>
                  <TableCell
                    component="th"
                    scope="row"
                    align="center"
                    style={{ padding: 10 }}
                  >
                    <TextField
                      fullWidth
                      type="number"
                      name={row.name}
                      onChange={handleChange(row)}
                      value={dose[row.name] || ''}
                    />
                  </TableCell>
                  <TableCell
                    component="th"
                    scope="row"
                    align="center"
                    style={{ padding: 10 }}
                  >
                    <IconButton
                      aria-label="set color"
                      onClick={() => handleOpenPicker(row)}
                    >
                      <FontAwesomeIcon
                        style={{ color: colorPicker[row.name] }}
                        icon={faCircle}
                      />
                    </IconButton>
                    {displayColorPicker[row.name] ? (
                      <div className={classes.popoverPicker}>
                        <div
                          className={classes.coverPicker}
                          onClick={() => handleClosePicker(row)}
                        />
                        <SketchPicker
                          disableAlpha
                          color={colorPicker[row.name]}
                          onChangeComplete={color =>
                            handleChangeColor(color, row)
                          }
                        />
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Divider style={{ marginBottom: 10, marginTop: 10 }} />
      <Grid container className={classes.grid}>
        <Grid item xs={4}>
          <Typography component="label" variant="subtitle2">
            Tratamiento
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography component="label" variant="body2">
            {sharedData.treatment}
          </Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.grid}>
        <Grid item xs={4}>
          <Typography component="label" variant="subtitle2">
            Insumo
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography component="label" variant="body2">
            {sharedData.input}
          </Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.grid}>
        <Grid item xs={4}>
          <Typography component="label" variant="subtitle2">
            Promedio
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography component="label" variant="body2">
            {average} {sharedData.unit}
          </Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.grid}>
        <Grid item xs={4}>
          <Typography component="label" variant="subtitle2">
            Total
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography component="label" variant="body2">
            {total} {sharedData.unit.substring(0, 2)}
          </Typography>
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
            //disabled={!layerName || !mode || !field}
          >
            Siguiente
            <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 5 }} />
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 5 }} />
            Atras
          </Button>
        }
      />
    </>
  );
};

export default StepSecond;
