import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRulerVertical,
  faRulerCombined,
  faTimes,
  faRuler
} from '@fortawesome/free-solid-svg-icons';
import MapContext from 'src/contexts/MapContext';

const useStyles = makeStyles(theme => ({
  buttonGroup: {
    position: 'absolute',
    zIndex: 800,
    bottom: '20px',
    right: '10px'
  },
  button: {
    width: 35,
    height: 35,
    padding: 0,
    '&:disabled': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      borderRight: 'inherit !important'
    }
  }
}));

const MeasureTool = props => {
  const classes = useStyles();
  const [toggleGroup, setToggleGroup] = useState(false);
  const map = useContext(MapContext);

  const measureByPolygon = () => {
    let geom = map.editTools
      .startPolygon()
      .addTo(map.measureTool)
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
    let geom = map.editTools
      .startPolyline()
      .addTo(map.measureTool)
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
    map.measureTool.clearLayers();
    setToggleGroup(false);
  };

  return (
    <>
      <ButtonGroup className={classes.buttonGroup}>
        <Button
          onClick={openToggleGroup}
          variant="contained"
          color="default"
          className={classes.button}
        >
          <FontAwesomeIcon icon={faRuler} />
        </Button>
      </ButtonGroup>
      {toggleGroup && (
        <ButtonGroup
          variant="contained"
          color="default"
          className={classes.buttonGroup}
          aria-label="contained primary button group"
        >
          <Button className={classes.button} disabled>
            <FontAwesomeIcon icon={faRuler} />
          </Button>
          <Button onClick={measureByLine} className={classes.button}>
            <FontAwesomeIcon icon={faRulerVertical} />
          </Button>
          <Button onClick={measureByPolygon} className={classes.button}>
            <FontAwesomeIcon icon={faRulerCombined} />
          </Button>
          <Button onClick={closeToggleGroup} className={classes.button}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </ButtonGroup>
      )}
    </>
  );
};

export default MeasureTool;
