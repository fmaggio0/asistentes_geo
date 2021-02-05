import React, { useState, useEffect, useContext } from 'react';
import { StepByStepProvider } from 'src/contexts/StepByStepContext';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { faUpload, faLayerPlus, faCog } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
/* Componentes */
/*import StepInit from './StepFirst';
import StepSecond from './StepSecond';
import StepThird from './StepThird';*/
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
    //backgroundColor: theme.palette.primary.main,
    paddingTop: '2px',
    paddingBottom: '2px'
  },
  cardHeaderTitle: {
    //color: theme.palette.common.white
  },
  cardHeaderAction: {
    marginTop: '0px'
  },
  gridContainer: {
    marginTop: 10,
    marginBottom: 10
  }
}));

const NewLayerView = props => {
  const classes = useStyles();

  useEffect(() => {
    return () => {
      // unmount
    };
  }, []);

  return (
    <Card className={classes.root}>
      <CardHeader
        classes={{
          action: classes.cardHeaderAction,
          title: classes.cardHeaderTitle
        }}
        action={
          <IconButton aria-label="settings" onClick={() => props.unmountMe()}>
            <FontAwesomeIcon icon={faTimes} style={{ color: '#000000' }} />
          </IconButton>
        }
        title={'Nueva capa'}
        className={classes.cardHeader}
      />
      <Divider />
      <PerfectScrollbar options={{ suppressScrollX: true }}>
        <CardContent className={classes.cardContent}>
          <Box mx={4} mb={3}>
            <Grid container className={classes.gridContainer}>
              <Grid item xs={12}>
                <List component="nav" dense disablePadding>
                  <ListItem button style={{ padding: 0 }}>
                    <FontAwesomeIcon
                      icon={faUpload}
                      style={{ marginRight: 10 }}
                    />
                    <ListItemText primary="Importar" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
            <Divider />
            <Grid container className={classes.gridContainer}>
              <Grid item xs={12}>
                <FontAwesomeIcon
                  icon={faLayerPlus}
                  style={{ marginRight: 10 }}
                />
                <Typography component="label" variant="subtitle2">
                  Crear
                </Typography>
                <Box mx={1}>
                  <List component="nav" dense disablePadding>
                    <ListItem button onClick={() => props.open('ambientes')}>
                      <ListItemText primary="Ambientes" />
                    </ListItem>
                    <ListItem
                      button
                      onClick={() => props.open('prescripciones')}
                    >
                      <ListItemText primary="Prescripciones" />
                    </ListItem>
                    <ListItem button>
                      <ListItemText primary="Ensayos" />
                    </ListItem>
                    <ListItem button>
                      <ListItemText primary="Notas" />
                    </ListItem>
                  </List>
                </Box>
              </Grid>
            </Grid>
            <Divider />
            <Grid container className={classes.gridContainer}>
              <Grid item xs={12}>
                <FontAwesomeIcon icon={faCog} style={{ marginRight: 10 }} />
                <Typography component="label" variant="subtitle2">
                  Procesar
                </Typography>
                <Box mx={1}>
                  <List component="nav" dense disablePadding>
                    <ListItem button>
                      <ListItemText primary="Productividad" />
                    </ListItem>
                    <ListItem button>
                      <ListItemText primary="Rindes" />
                    </ListItem>
                    <ListItem button>
                      <ListItemText primary="Aplicaciones" />
                    </ListItem>
                    <ListItem button>
                      <ListItemText primary="Muestreos/Interpolaciones" />
                    </ListItem>
                  </List>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </PerfectScrollbar>
    </Card>
  );
};

export default NewLayerView;
