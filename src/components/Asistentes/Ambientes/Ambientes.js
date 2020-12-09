import React, { useState, useEffect } from 'react';

/* Componentes */
import Capa from './Capa';
import Lote from './Lote';
import Modalidad from './Modalidad';
import TipoZona from './TipoZona';
import CapaBase from './CapaBase';
import StepCapaBase from './StepCapaBase';
import StepDrawing from './StepDrawing';

import { makeStyles } from '@material-ui/core/styles';
import { loadCSS } from 'fg-loadcss';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import PerfectScrollbar from 'react-perfect-scrollbar';

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

export default props => {
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

  const handleClose = () => {
    props.onHandleClose(false);
  };

  useEffect(() => {
    const node = loadCSS(
      'https://use.fontawesome.com/releases/v5.12.0/css/all.css',
      document.querySelector('#font-awesome-css')
    );
    return () => {
      node.parentNode.removeChild(node);
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
          <IconButton aria-label="settings" onClick={handleClose}>
            <Icon
              fontSize="small"
              style={{ color: '#ffffff' }}
              className="fa fa-times-circle"
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
