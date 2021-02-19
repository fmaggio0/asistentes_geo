import React, { useState, useEffect, useContext } from 'react';
import { StepByStepProvider } from 'src/contexts/StepByStepContext';
import { faTimesCircle } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import { useSnackbar } from 'notistack';
/* Componentes */
import StepInit from './StepFirst';
import StepSecond from './StepSecond';
import StepThird from './StepThird';
/* Map Context */
import MapContext from 'src/contexts/MapContext';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    right: '50px',
    top: '10px',
    zIndex: 1000,
    width: '300px',
    maxHeight: 'calc(100% - 64px)',
    display: 'flex',
    flexDirection: 'column'
  },
  cardContent: {
    height: '100%',
    padding: '0px !important',
    overflowY: 'auto'
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
  const mapContext = useContext(MapContext);
  const [activeStep, setActiveStep] = useState(0);
  const totalStep = 3;
  const [sharedData, setSharedData] = useState({
    layerName: null,
    field: null,
    mode: null,
    tipoZona: null,
    baseLayer: null,
    geoJsonResult: null
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    mapContext.toggleSelected(true);
    return () => {
      // unmount
      mapContext.removeVectorGroup('ambientes_capa_base');
      mapContext.toggleSelected(true);
    };
    // eslint-disable-next-line
  }, []);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleSharedData = data => {
    setSharedData(prevState => {
      return { ...prevState, ...data };
    });
  };

  const handleComplete = () => {
    enqueueSnackbar('Layer created', {
      variant: 'success'
    });
    props.unmountMe();
  };

  useEffect(() => {
    console.log(sharedData);
  }, [sharedData]);

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
      <PerfectScrollbar options={{ suppressScrollX: true }}>
        <CardContent className={classes.cardContent}>
          <Box m={3}>
            <StepByStepProvider
              value={{
                sharedData,
                activeStep,
                totalStep,
                handleBack,
                handleNext,
                handleComplete
              }}
            >
              {activeStep === 0 && <StepInit sharedData={handleSharedData} />}
              {activeStep === 1 && <StepSecond sharedData={handleSharedData} />}
              {activeStep === 2 && <StepThird />}
            </StepByStepProvider>
          </Box>
        </CardContent>
      </PerfectScrollbar>
    </Card>
  );
};

export default Ambientes;
