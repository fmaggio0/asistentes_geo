import React, { useState, useEffect, useContext } from 'react';

/* Componentes */
import StepByCapaBase from './StepByCapaBase';
import StepByDrawing from './StepByDrawing';
import StepInit from './StepInit';
import StepSecond from './StepSecond';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import PerfectScrollbar from 'react-perfect-scrollbar';
import MobileStepper from '@material-ui/core/MobileStepper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimesCircle,
  faArrowRight,
  faArrowLeft
} from '@fortawesome/pro-regular-svg-icons';

//Context
import MapContext from '../../../contexts/MapContext';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    right: '50px',
    top: '20px',
    zIndex: 1000,
    width: '300px',
    height: '600px',
    maxHeight: 'calc(100% - 64px)'
  },
  cardContent: {
    height: '100%',
    padding: '0px 0px 48px 0px !important'
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
    paddingTop: '2px',
    paddingBottom: '2px'
  },
  cardHeaderTitle: {
    color: theme.palette.common.white
  },
  cardHeaderAction: {
    marginTop: '0px'
  }
}));

const download = (content, fileName, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

const Ambientes = props => {
  const classes = useStyles();
  //const [step, setStep] = useState('init');
  /*const [capa, setCapa] = useState('');
  const handlerCapa = value => setCapa(value);
  const [lote, setLote] = useState('');
  const handlerLote = value => setLote(value);
  const [modalidad, setModalidad] = useState('');
  const handlerModalidad = value => setModalidad(value);
  const [capabase, setCapabase] = useState('');
  const handlerCapabase = value => setCapabase(value);
  const [tipoZona, setTipoZona] = useState('');
  const handlerTipoZona = value => setTipoZona(value);*/
  const mapContext = useContext(MapContext);
  const [activeStep, setActiveStep] = useState(0);
  const [totalStep, setTotalStep] = useState(3);
  const [sharedData, setSharedData] = useState({
    layerName: null,
    field: null,
    mode: null,
    tipoZona: null,
    baseLayer: null,
    geoJsonResult: null
  });

  useEffect(() => {
    return () => {
      // unmount
      mapContext.removeVectorGroup('ambientes_capa_base');
      mapContext.toggleSelected(true);
    };
  }, []);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleSharedData = data => {
    setSharedData({
      ...sharedData,
      layerName: data.layerName || sharedData.layerName,
      field: data.field || sharedData.field,
      mode: data.mode || sharedData.mode,
      baseLayer: data.baseLayer || sharedData.baseLayer,
      tipoZona: data.tipoZona || sharedData.tipoZona,
      geoJsonResult: data.geoJsonResult || sharedData.geoJsonResult
    });
  };

  const handleFinish = () => {
    let result = sharedData.geoJsonResult;
    if (sharedData.mode === 'drawing') {
      let foundLayerGroup = mapContext.state.vectorLayers.find(
        e => e.name === 'drawAmbientes'
      );
      result = foundLayerGroup.layer.toGeoJSON();
    }
    console.log(result);
    download(JSON.stringify(result), 'result.geojson', 'text/plain');
    props.unmountMe();
  };

  useEffect(() => {
    console.log(sharedData);
  }, [sharedData]);

  const handleDisableNext = () => {
    if (
      activeStep === 0 &&
      sharedData.layerName &&
      sharedData.field &&
      sharedData.mode
    ) {
      return false;
    } else if (
      activeStep === 1 &&
      //sharedData.baseLayer &&
      sharedData.tipoZona
    ) {
      return false;
    }
    return true;
  };

  return (
    <Card id="ambientes" className={classes.root}>
      <CardHeader
        classes={{
          action: classes.cardHeaderAction,
          title: classes.cardHeaderTitle
        }}
        action={
          <IconButton aria-label="settings" onClick={() => props.unmountMe()}>
            <FontAwesomeIcon
              icon={faTimesCircle}
              style={{ color: '#ffffff' }}
            />
          </IconButton>
        }
        title={'Asistente de Ambientes'}
        className={classes.cardHeader}
      />
      <CardContent className={classes.cardContent}>
        <PerfectScrollbar options={{ suppressScrollX: true }}>
          <Box m={2}>
            {activeStep === 0 && (
              <StepInit sharedData={handleSharedData} data={sharedData} />
            )}
            {activeStep === 1 && (
              <StepSecond sharedData={handleSharedData} data={sharedData} />
            )}
            {activeStep === 2 && sharedData.mode === 'drawing' && (
              <>
                <StepByDrawing
                  ambientes={sharedData.tipoZona}
                  lote={sharedData.field}
                  sharedData={handleSharedData}
                />
              </>
            )}
            {activeStep === 2 && sharedData.mode === 'layer' && (
              <>
                <StepByCapaBase
                  ambientes={sharedData.tipoZona}
                  baseLayer={
                    mapContext.state.vectorLayers.find(
                      element => element.name === 'ambientes_capa_base'
                    ).layer
                  }
                  sharedData={handleSharedData}
                />
              </>
            )}
            <MobileStepper
              variant="dots"
              steps={totalStep}
              position="static"
              activeStep={activeStep}
              nextButton={
                activeStep === totalStep - 1 ? (
                  <Button
                    size="small"
                    onClick={handleFinish}
                    //disabled={handleDisableNext()}
                  >
                    Finalizar
                  </Button>
                ) : (
                  <Button
                    size="small"
                    onClick={handleNext}
                    disabled={handleDisableNext()}
                  >
                    Siguiente
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      style={{ marginLeft: 5 }}
                    />
                  </Button>
                )
              }
              backButton={
                <Button
                  size="small"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    style={{ marginRight: 5 }}
                  />
                  Atras
                </Button>
              }
            />
          </Box>
        </PerfectScrollbar>
      </CardContent>
    </Card>
  );
};

export default Ambientes;
