import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDrawPolygon,
  faEdit,
  faTimes,
  faUndo,
  faCut
} from '@fortawesome/free-solid-svg-icons';
import MapContext from 'src/contexts/MapContext';
import { geometryCheck, cutAll, unionAll } from 'src/utils/functionsGeo';
import L from 'leaflet';

const useStyles = makeStyles(theme => ({
  buttonGroup: {
    position: 'absolute',
    zIndex: 800,
    left: '50%',
    top: 10,
    transform: 'translate(-50%, 0%)',
    backgroundColor: theme.palette.background.paper1,
    borderRadius: 4,
    display: 'inline-flex'
  },
  button: {
    width: 35,
    height: 35,
    minWidth: 35,
    borderRadius: 0,
    '&:disabled': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      borderRight: 'inherit !important',
      borderRadius: 0,
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4
    },
    '&:not(:last-child)': {
      borderRight: 0
    }
  }
}));

const EditTool = props => {
  const classes = useStyles();
  const [toggleGroup, setToggleGroup] = useState(false);
  const [geomtryHistory, setGeomtryHistory] = useState([]);
  const mapContext = useContext(MapContext);
  const { editLayer } = props;

  const openToggleGroup = () => {
    setToggleGroup(true);
  };

  const closeToggleGroup = () => {
    setToggleGroup(false);
  };

  const drawPolygon = () => {
    let geom = mapContext.state.map.editTools.startPolygon();

    geom.on('editable:drawing:end', function(end) {
      if (end.layer._map) {
        try {
          //let editLayers = mapContext.state.map.editTools.featuresLayer.toGeoJSON();
          //console.log(editLayer.toGeoJSON());
          let defaultGeom = editLayer.toGeoJSON();
          let drawGeom = end.layer.toGeoJSON();

          /*if (
              this.cutStatus == true &&
              defaultGeom.geometry.type == 'Point'
            ) {
              end.layer.remove();
              this.activeClassToggle(this.polygon, 'disable');
              return;
            }*/

          drawProcess(drawGeom, defaultGeom);
        } catch (e) {
          console.log(e);
          //this.undoGeometry();
        }
      }
    });
  };

  const drawProcess = (drawGeom, defaultGeom) => {
    let drawGeometryChecked = geometryCheck(drawGeom);
    let process;

    /*if (this.cutStatus == true) {
      process = cutAll(drawGeometryChecked, defaultGeom);
      if (!process) {
        this.cutToggle();
        return;
      }
    } else {*/
    process = unionAll(drawGeometryChecked, defaultGeom);
    //}

    //let geometryWithoutIntersections = checkForIntersections(process);
    let resultGeometryChecked = geometryCheck(
      /*geometryWithoutIntersections*/ process
    );

    setLayer(resultGeometryChecked);
  };

  const checkForIntersections = drawGeom => {
    /*var difference = drawGeom;

    let iLayerEditId = -1;
    let layerLeafletEdit = undefined;
    let objSelected = mapsLayersVector.GetSelectedObject();
    if (objSelected != null) {
      layerLeafletEdit = objSelected.layerLeaflet;
      iLayerEditId = objSelected.objectLeaflet.feature.properties.object_id;
    } else {
      let laySelected = mapsLayersVector.GetSelected();
      if (laySelected != undefined) {
        layerLeafletEdit = laySelected.layerLeaflet;
      }
    }
    if (layerLeafletEdit != undefined) {
      layerLeafletEdit.eachLayer(function(layer) {
        var layerGeo = layer.toGeoJSON();
        if (layerGeo.properties.object_id != iLayerEditId) {
          difference = turf.difference(difference, layerGeo);
        }
      });
    }
    return difference;*/
  };

  const setLayer = (geoj, context) => {
    setGeomtryHistory(oldArray => [...oldArray, geoj]);
    mapContext.state.map.editTools.featuresLayer.clearLayers();
    console.log(geoj);
    mapContext.select(L.GeoJSON.geometryToLayer(geoj));
    //let lay = L.GeoJSON.geometryToLayer(geoj);
    //mapContext.state.map.editTools.featuresLayer.addLayer(lay);
    //lay.enableEdit();
    //L.control.setEvents(lay, context);
  };

  return (
    <>
      <Box className={classes.buttonGroup}>
        <Button className={classes.button} disabled>
          <FontAwesomeIcon icon={faEdit} size="lg" />
        </Button>
        <Button className={classes.button}>
          <FontAwesomeIcon
            icon={faDrawPolygon}
            onClick={drawPolygon}
            size="lg"
          />
        </Button>
        <Button className={classes.button}>
          <FontAwesomeIcon icon={faDrawPolygon} size="lg" />
        </Button>
        <Button className={classes.button}>
          <FontAwesomeIcon icon={faDrawPolygon} size="lg" />
        </Button>
        <Box style={{ paddingTop: 5, paddingBottom: 5 }}>
          <Divider
            orientation="vertical"
            style={{ width: 2, backgroundColor: '#263238' }}
          />
        </Box>
        <Button className={classes.button}>
          <FontAwesomeIcon icon={faCut} size="lg" />
        </Button>
        <Button className={classes.button}>
          <FontAwesomeIcon icon={faUndo} size="lg" />
        </Button>
        <Button onClick={closeToggleGroup} className={classes.button}>
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </Button>
      </Box>
    </>
  );
};

export default EditTool;
