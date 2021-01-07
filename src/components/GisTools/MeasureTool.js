import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRulerVertical,
  faRulerCombined,
  faTimes,
  faRuler
} from '@fortawesome/free-solid-svg-icons';
import MapContext from 'src/contexts/MapContext';

const useStyles = makeStyles(theme => ({
  buttongroup: {
    position: 'absolute',
    zIndex: 800,
    bottom: '20px',
    right: '10px',
    backgroundColor: theme.palette.background.paper1,
    borderRadius: 4
    //display: 'inline-flex',
    //marginLeft: 10
  },
  button: {
    width: 35,
    height: 35,
    minWidth: 35,
    '&:disabled': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      borderRight: 'inherit !important',
      //borderRadius: 0,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0
    },
    '&:not(:last-child)': {
      borderRight: 0
    }
  }
}));

const MeasureTool = props => {
  const classes = useStyles();
  const [toggleGroup, setToggleGroup] = useState(false);
  const mapContext = useContext(MapContext);

  const measureByPolygon = () => {
    let geom = mapContext.state.map.editTools
      .startPolygon()
      .addTo(mapContext.state.map.measureTool)
      .showMeasurements({ ha: true });

    geom.setStyle({
      color: '#ff9204'
    });

    geom.on(
      'editable:vertex:drag editable:vertex:deleted editable:vertex:new',
      geom.updateMeasurements
    );
  };

  const measureByLine = () => {
    let geom = mapContext.state.map.editTools
      .startPolyline()
      .addTo(mapContext.state.map.measureTool)
      .showMeasurements({ ha: true });

    geom.setStyle({
      color: '#ff9204'
    });

    geom.on(
      'editable:vertex:drag editable:vertex:deleted editable:vertex:new',
      geom.updateMeasurements
    );
  };

  const openToggleGroup = () => {
    setToggleGroup(true);
  };

  const closeToggleGroup = () => {
    mapContext.state.map.measureTool.clearLayers();
    setToggleGroup(false);
  };

  return (
    <>
      <Box className={classes.buttongroup}>
        <Button
          onClick={openToggleGroup}
          variant="contained"
          color="default"
          className={classes.button}
        >
          <FontAwesomeIcon icon={faRuler} />
        </Button>
      </Box>
      {toggleGroup && (
        <Box className={classes.buttongroup}>
          <Button className={classes.button} disabled>
            <FontAwesomeIcon icon={faRuler} />
          </Button>
          <Button
            onClick={measureByLine}
            className={classes.button}
            style={{ borderRadius: 0 }}
          >
            <FontAwesomeIcon icon={faRulerVertical} />
          </Button>
          <Button
            onClick={measureByPolygon}
            className={classes.button}
            style={{ borderRadius: 0 }}
          >
            <FontAwesomeIcon icon={faRulerCombined} />
          </Button>
          <Button
            onClick={closeToggleGroup}
            className={classes.button}
            style={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </Box>
      )}
    </>
  );
};

export default MeasureTool;
