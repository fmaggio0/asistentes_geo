import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/pro-solid-svg-icons';
import { faPen, faFileChartLine } from '@fortawesome/pro-light-svg-icons';
import MapContext from 'src/contexts/MapContext';
import EditTool from 'src/components/GisTools/EditTool';
import { map } from 'lodash';

const useStyles = makeStyles(theme => ({
  buttongroup: {
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
  const mapContext = useContext(MapContext);

  return (
    <>
      <Box className={classes.buttongroup}>
        <Button className={classes.button} disabled>
          <FontAwesomeIcon icon={faLayerGroup} />
        </Button>
        <Button className={classes.button} style={{ borderRadius: 0 }}>
          <FontAwesomeIcon icon={faFileChartLine} />
        </Button>
        <Button
          className={classes.button}
          style={{ borderRadius: 0 }}
          onClick={() => setEditTool(!editTool)}
          disabled={!mapContext.state.selected}
        >
          <FontAwesomeIcon icon={faPen} />
        </Button>
      </Box>

      {editTool && (
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
      )}
    </>
  );
};

export default RightPanel;
