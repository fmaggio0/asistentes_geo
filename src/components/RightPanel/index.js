import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import { faPen } from '@fortawesome/pro-light-svg-icons';
import MapContext from 'src/contexts/MapContext';
import Ambientes from 'src/components/Asistentes/Ambientes/index';
import Prescripciones from 'src/components/Asistentes/Prescripcion/index';
import NewLayerView from 'src/components/RightPanel/NewLayerView';

const useStyles = makeStyles(theme => ({
  boxgroup: {
    position: 'absolute',
    zIndex: 800,
    top: '10px',
    right: '10px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 4
  },
  button: {
    width: 35,
    height: 35,
    minWidth: 35,
    '&:not(:last-child)': {
      borderRight: 0
    },
    '&:disabled': {
      backgroundColor: '#e0e0e0;'
    },
    marginBottom: 5
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
  const [newLayerOpen, setNewLayerOpen] = useState(false);
  const mapContext = useContext(MapContext);
  const [open, setOpen] = useState({
    import: false,
    ambientes: false,
    prescripciones: false,
    ensayos: false,
    notas: false,
    productividad: false,
    rindes: false,
    aplicaciones: false,
    muestreos: false
  });

  const toggleEditTool = () => {
    let editlayer = mapContext.state.selected.layer;
    let contextlayer = mapContext.state.vectorLayers.find(
      element => element.name === 'lotes'
    ).layer;

    mapContext.enableEditTool(editlayer, contextlayer, 'lotes', true);
  };

  const handleOpen = type => {
    setNewLayerOpen(false);
    setOpen({ ...open, [type]: true });
    console.log(type);
  };

  return (
    <>
      <Box className={classes.boxgroup}>
        <Button
          className={classes.button}
          variant="contained"
          color="default"
          onClick={() => setNewLayerOpen(!newLayerOpen)}
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          color="default"
          onClick={toggleEditTool}
          disabled={!mapContext.state.selected.layer}
        >
          <FontAwesomeIcon icon={faPen} />
        </Button>
      </Box>

      {newLayerOpen && (
        <NewLayerView
          open={handleOpen}
          unmountMe={() => setNewLayerOpen(false)}
        />
      )}

      {open.ambientes && (
        <Ambientes unmountMe={() => setOpen({ ...open, ambientes: false })} />
      )}

      {open.prescripciones && (
        <Prescripciones
          unmountMe={() => setOpen({ ...open, prescripciones: false })}
        />
      )}
    </>
  );
};

export default RightPanel;
