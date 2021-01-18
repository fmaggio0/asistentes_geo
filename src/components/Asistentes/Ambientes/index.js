import React, { useState, useEffect, useContext } from 'react';

/* Componentes */
import Capa from './Capa';
import Lote from './Lote';
import Modalidad from './Modalidad';
import TipoZona from './TipoZona';
import CapaBase from './CapaBase';
import StepCapaBase from './StepCapaBase';
import StepDrawing from './StepDrawing';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/pro-regular-svg-icons';

//Context
import MapContext from '../../../contexts/MapContext';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    right: '10px',
    top: '10px',
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

const Ambientes = props => {
  const classes = useStyles();
  const [step, setStep] = useState('init');
  const [capa, setCapa] = useState('');
  const handlerCapa = value => setCapa(value);
  const [lote, setLote] = useState('');
  const handlerLote = value => setLote(value);
  const [modalidad, setModalidad] = useState('');
  const handlerModalidad = value => setModalidad(value);
  const [capabase, setCapabase] = useState('');
  const handlerCapabase = value => setCapabase(value);
  const [tipoZona, setTipoZona] = useState('');
  const handlerTipoZona = value => setTipoZona(value);
  const mapContext = useContext(MapContext);

  useEffect(() => {
    return () => {
      // unmount
      mapContext.removeVectorGroup('ambientes_capa_base');
    };
  }, []);

  const nextStep = () => {
    if (modalidad === 'layer') {
      setStep('setAmbienteCapaBase');
    }

    if (modalidad === 'drawing') {
      setStep('setAmbienteDrawing');
    }
  };

  const onUpdateStep = step => {
    setStep(step);
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
            {step === 'init' && (
              <>
                <Capa onChangeCapa={handlerCapa} capa={capa} />
                <Lote onChangeLote={handlerLote} lote={lote} />
                <Modalidad
                  onChangeModalidad={handlerModalidad}
                  modalidad={modalidad}
                />
                {modalidad === 'layer' && (
                  <CapaBase
                    onChangeCapabase={handlerCapabase}
                    capabase={capabase}
                  />
                )}
                {(modalidad === 'drawing' || capabase) && (
                  <TipoZona
                    onChangeTipoZona={handlerTipoZona}
                    tipozona={tipoZona}
                  />
                )}
                <Box
                  my={2}
                  display="flex"
                  justifyContent="space-between"
                  style={{ float: 'right' }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={nextStep}
                    disabled={
                      capa === '' ||
                      lote === '' ||
                      modalidad === '' ||
                      tipoZona === ''
                    }
                  >
                    Siguiente
                  </Button>
                </Box>
              </>
            )}

            {step === 'setAmbienteDrawing' && (
              <>
                <StepDrawing ambientes={tipoZona} />
                <Box my={2} display="flex" justifyContent="space-between">
                  <Button
                    onClick={() => setStep('init')}
                    disabled={step === 'init'}
                  >
                    Atras
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={nextStep}
                  >
                    Siguiente
                  </Button>
                </Box>
              </>
            )}

            {step === 'setAmbienteCapaBase' && (
              <>
                <StepCapaBase
                  ambientes={tipoZona}
                  baseLayer={
                    mapContext.state.vectorLayers.find(
                      element => element.name === 'ambientes_capa_base'
                    ).layer
                  }
                  onUpdateStep={onUpdateStep}
                />
              </>
            )}
          </Box>
        </PerfectScrollbar>
      </CardContent>
    </Card>
  );
};

export default Ambientes;
