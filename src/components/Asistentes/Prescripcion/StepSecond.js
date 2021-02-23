import React, { useState, useEffect, useContext } from 'react';
import { faPalette } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TableContainer from '@material-ui/core/TableContainer';
import FormHelperText from '@material-ui/core/FormHelperText';
import { faCircle } from '@fortawesome/pro-solid-svg-icons';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TextField from '@material-ui/core/TextField';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import Paper from '@material-ui/core/Paper';
import { SketchPicker } from 'react-color';
import Grid from '@material-ui/core/Grid';
import * as turf from '@turf/turf';
/* Step by Step */
import StepByStepContext from 'src/contexts/StepByStepContext';
import MobileStepper from '@material-ui/core/MobileStepper';
/* Map Context */
import MapContext from 'src/contexts/MapContext';

const useStyles = makeStyles(theme => ({
  grid: {
    padding: 0,
    paddingBottom: 10
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

const typesColors = {
  muybaja: '',
  baja: '',
  media: '',
  alta: '',
  muyalta: ''
};

const download = (content, fileName, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

const StepSecond = props => {
  const classes = useStyles();
  const {
    totalStep,
    activeStep,
    handleNext,
    handleBack,
    sharedData,
    handleComplete
  } = useContext(StepByStepContext);
  const [rows, setRows] = useState(data);
  const [dose, setDose] = useState(types);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [baseLayer, setBaseLayer] = useState(null);
  const [disableNext, setDisableNext] = useState(false);
  const [displayColorPicker, setDisplayColorPicker] = useState({
    muybaja: false,
    baja: false,
    media: false,
    alta: false,
    muyalta: false
  });
  const [colorPicker, setColorPicker] = useState(typesColors);
  const mapContext = useContext(MapContext);

  useEffect(() => {
    let baseLayerTemp = mapContext.getLayerByGroup('prescripcion_capa_base');
    setBaseLayer(baseLayerTemp);
    return () => {
      baseLayerTemp.layer.resetStyle();
    };
  }, []);

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

  useEffect(() => {
    let checkDose = Object.values(dose).some(x => x === null || x === '');
    let checkColors = Object.values(colorPicker).some(
      x => x === null || x === ''
    );
    if (!checkDose && !checkColors) setDisableNext(false);
    else setDisableNext(true);
  }, [dose, colorPicker]);

  const handleChange = row => event => {
    let selected = event.target.value;
    setDose({
      ...dose,
      [row.name]: selected
    });
  };

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
    let setAmbientesLayers = [];

    baseLayer.layer.eachLayer(function(layer) {
      if (layer.feature.properties.Class === row.class) {
        layer.setStyle({
          fillColor: color.hex,
          fillOpacity: '1',
          weight: '1',
          color: '#000000'
        });
      }
    });

    setColorPicker({
      ...colorPicker,
      [row.name]: color.hex
    });
  };

  const addCanal = () => {
    let data = {
      colors: [...sharedData.colors, colorPicker],
      doses: [...sharedData.doses, dose],
      addCanal: true
    };
    props.sharedData(data);
    handleBack();
  };

  const finish = () => {
    let geoBaseLayer = baseLayer.layer.toGeoJSON();
    let doses = [...sharedData.doses, dose];
    let colors = [...sharedData.colors, colorPicker];

    rows.forEach(element => {
      turf.featureEach(geoBaseLayer, function(currentFeature, featureIndex) {
        if (element.class === currentFeature.properties.Class) {
          geoBaseLayer.features[featureIndex].properties = {};

          sharedData.treatment.forEach(function(item, index) {
            geoBaseLayer.features[featureIndex].properties[
              'treatment ' + index
            ] = sharedData.treatment[index];
            geoBaseLayer.features[featureIndex].properties['unit ' + index] =
              sharedData.unit[index];
            geoBaseLayer.features[featureIndex].properties['input ' + index] =
              sharedData.input[index];
            geoBaseLayer.features[featureIndex].properties['dose ' + index] =
              doses[index][element.name];
            geoBaseLayer.features[featureIndex].properties['color ' + index] =
              colors[index][element.name];
          });
        }
      });
    });
    console.log(geoBaseLayer);
    download(
      JSON.stringify(geoBaseLayer),
      'result_prescription.geojson',
      'text/plain'
    );
    handleComplete();
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
                  Dosis ({sharedData.unit.slice(-1)[0]})
                </TableCell>
                <TableCell align="center" style={{ padding: 10 }}>
                  <FontAwesomeIcon icon={faPalette} />
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
        <Grid item xs={6}>
          <Typography component="label" variant="subtitle2">
            Tratamiento
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography component="label" variant="body2">
            {sharedData.treatment.slice(-1)[0]}
          </Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.grid}>
        <Grid item xs={6}>
          <Typography component="label" variant="subtitle2">
            Insumo
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography component="label" variant="body2">
            {sharedData.input.slice(-1)[0]}
          </Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.grid}>
        <Grid item xs={6}>
          <Typography component="label" variant="subtitle2">
            Promedio
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography component="label" variant="body2">
            {average} {sharedData.unit.slice(-1)[0]}
          </Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.grid}>
        <Grid item xs={6}>
          <Typography component="label" variant="subtitle2">
            Total
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography component="label" variant="body2">
            {total} {/*sharedData.unit.slice(-1)[0].substring(0, 2)*/}
          </Typography>
        </Grid>
      </Grid>

      <MobileStepper
        variant="dots"
        steps={totalStep}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button size="small" onClick={finish} disabled={disableNext}>
            Finalizar
          </Button>
        }
        backButton={
          <Button size="small" onClick={addCanal} disabled={disableNext}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 5 }} />
            Canal
          </Button>
        }
      />
    </>
  );
};

export default StepSecond;
