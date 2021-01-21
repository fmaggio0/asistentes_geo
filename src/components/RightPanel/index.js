import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/pro-solid-svg-icons';
import { faPen, faFileChartLine } from '@fortawesome/pro-light-svg-icons';
import MapContext from 'src/contexts/MapContext';
import EditTool from 'src/components/GisTools/EditTool';
import Ambientes from 'src/components/Asistentes/Ambientes/index';
import { map } from 'lodash';

const useStyles = makeStyles(theme => ({
  boxgroup: {
    position: 'absolute',
    zIndex: 800,
    top: '20px',
    right: '10px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper1,
    borderRadius: 4
  },
  button: {
    width: 35,
    height: 35,
    minWidth: 35,
    '&:not(:last-child)': {
      borderRight: 0
    }
  },
  buttongroup: {
    width: 35,
    height: 35,
    minWidth: 35,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    '&:disabled': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      borderRight: 'inherit !important'
    },
    '&:not(:last-child)': {
      borderRight: 0
    }
  }
}));

const RightPanel = props => {
  const classes = useStyles();
  const [toggleGroup, setToggleGroup] = useState(false);
  const [editTool, setEditTool] = useState(false);
  const [reports, setReports] = useState(false);
  const mapContext = useContext(MapContext);

  const toggleEditTool = () => {
    let editlayer = mapContext.state.selected;
    let contextlayer = mapContext.state.vectorLayers.find(
      element => element.name === 'lotes'
    ).layer;

    mapContext.enableEditTool(editlayer, contextlayer, 'lotes');
  };

  /*useEffect(() => {
    console.log(mapContext.state.editTool);
  }, [mapContext.state.editTool]);*/

  return (
    <>
      <Box className={classes.boxgroup}>
        <Button className={classes.buttongroup} disabled>
          <FontAwesomeIcon icon={faLayerGroup} />
        </Button>
        <Button
          className={classes.button}
          style={{ borderRadius: 0 }}
          onClick={() => setReports(!reports)}
        >
          <FontAwesomeIcon icon={faFileChartLine} />
        </Button>
        <Button
          className={classes.button}
          style={{ borderRadius: 0 }}
          onClick={toggleEditTool}
          disabled={!mapContext.state.selected}
        >
          <FontAwesomeIcon icon={faPen} />
        </Button>
      </Box>

      {/*editTool && (
        <EditTool
          editLayer={mapContext.state.selected}
          contextLayer={
            mapContext.state.vectorLayers.find(
              element => element.name === 'lotes'
            ).layer
          }
          result={mapContext.updateVectorLayer}
          unmountMe={() => setEditTool(false)}
        />
      )*/}

      {reports && <Ambientes unmountMe={() => setReports(false)} />}
    </>
  );
};

export default RightPanel;
