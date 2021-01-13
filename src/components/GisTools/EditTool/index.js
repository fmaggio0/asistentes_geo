import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import Table from '@material-ui/core/Table';
import Radio from '@material-ui/core/Radio';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUndo,
  faCut,
  faMousePointer,
  faScalpelPath,
  faPlus
} from '@fortawesome/pro-solid-svg-icons';
import {
  faObjectGroup,
  faObjectUngroup,
  faTrashAlt
} from '@fortawesome/pro-regular-svg-icons';
import {
  faDrawSquare,
  faDrawCircle,
  faDrawPolygon,
  faSave
} from '@fortawesome/pro-light-svg-icons';
import MapContext from 'src/contexts/MapContext';
import { geometryCheck, cutAll, unionAll, unify } from 'src/utils/functionsGeo';
import L from 'leaflet';
import 'leaflet-geometryutil';
import 'leaflet-snap';
import {
  circle,
  difference,
  polygonToLine,
  union,
  polygonize,
  booleanPointInPolygon,
  pointOnFeature,
  combine,
  featureEach,
  flatten,
  getCoords,
  getType,
  polygon,
  multiPolygon,
  featureCollection,
  lineToPolygon,
  buffer,
  point
} from '@turf/turf';
import MouseTooltip from 'react-sticky-mouse-tooltip';
import { current } from '@reduxjs/toolkit';

import DialogGroup from './DialogGroup';

const useStyles = makeStyles(theme => ({
  editGroup: {
    position: 'absolute',
    zIndex: 800,
    left: '50%',
    top: 10,
    transform: 'translate(-50%, 0%)'
  },
  buttongroup: {
    backgroundColor: theme.palette.background.paper1,
    borderRadius: 4,
    display: 'inline-flex',
    marginLeft: 10
  },
  button: {
    width: 35,
    height: 35,
    minWidth: 35,
    borderRadius: 0,
    '&:not(:last-child)': {
      borderRight: 0
    }
  },
  paperMouseTooltip: {
    backgroundColor: 'rgba(97, 97, 97, 0.9)',
    borderRadius: '4px'
  },
  typographyMouseTooltip: {
    fontSize: '0.625rem',
    padding: '5px',
    color: '#fff',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', 'sans-serif'",
    fontWeight: '500',
    lineHeight: '1.4em'
  }
}));

const EditTool = props => {
  var useStateRef = require('react-usestateref');
  const classes = useStyles();
  const [toggleGroup, setToggleGroup] = useState(false);
  const [activeSquare, setActiveSquare] = useState(false);
  const [activeCircle, setActiveCircle] = useState(false);
  const [activePolygon, setActivePolygon] = useState(false);
  const [activeCut, setActiveCut] = useState(false);
  const [mouseTooltip, setMouseTooltip] = useState({
    isActive: false,
    text: ''
  });
  const [geomtryHistory, setGeomtryHistory, geomtryHistoryRef] = useStateRef(
    []
  );
  const [editableLayer, setEditableLayer] = useState(null);
  const [editLayerProperties, setEditLayerProperties] = useState(null);
  const [ungroupLayer, setUngroupLayer] = useState(null);
  const [groupLayer, setGroupLayer] = useState(null);
  const mapContext = useContext(MapContext);
  const { editLayer, contextLayer } = props;
  const [ungroupOpen, setUngroupOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const [group, setGroup] = useState({
    openDialog: false,
    selectLayers: [],
    allProperties: [],
    buttonToggle: false
  });

  useEffect(() => {
    setLayer(editLayer.toGeoJSON());
    setEditLayerProperties(editLayer.toGeoJSON().properties);
    return () => {
      mapContext.state.map.editTools.featuresLayer.clearLayers();
      mapContext.cursorOnMap();
    };
  }, []);

  /*useEffect(() => {
    //console.log(geomtryHistory);
    console.log();
  }, [editLayer]);*/

  const handleCloseGroup = () => {
    setGroup({ openDialog: false });
  };

  const handleCloseUngroup = () => {
    setUngroupOpen(false);
  };

  /*useEffect(() => {
    if (editableLayer) {
      console.log(editableLayer.toGeoJSON());
    }
  }, [editableLayer]);*/

  const drawPolygon = () => {
    let geom = mapContext.state.map.editTools.startPolygon();
    setActiveSquare(false);
    setActiveCircle(false);
    setActivePolygon(true);

    geom.on('editable:drawing:end', function(end) {
      if (end.layer._map) {
        try {
          let defaultGeom = [...geomtryHistory].pop();
          let drawGeom = end.layer.toGeoJSON();
          drawProcess(drawGeom, defaultGeom);
        } catch (e) {
          console.log(e);
          errorGeometry();
        }
        setActivePolygon(false);
      }
    });
  };

  const drawSquare = () => {
    let geom = mapContext.state.map.editTools.startRectangle();
    setActiveSquare(true);
    setActiveCircle(false);
    setActivePolygon(false);

    geom.on('editable:drawing:end', function(end) {
      if (end.layer._map) {
        try {
          let defaultGeom = [...geomtryHistory].pop();
          let drawGeom = end.layer.toGeoJSON();
          drawProcess(drawGeom, defaultGeom);
        } catch (e) {
          console.log(e);
          errorGeometry();
        }
        setActiveSquare(false);
      }
    });
  };

  const drawCircle = () => {
    var geom = mapContext.state.map.editTools.startCircle();
    setActiveSquare(false);
    setActiveCircle(true);
    setActivePolygon(false);

    geom.on('editable:drawing:end', function(end) {
      if (end.layer._map) {
        try {
          let defaultGeom = [...geomtryHistory].pop();
          let center = end.layer.toGeoJSON().geometry.coordinates;
          let radius = end.layer._mRadius;
          let drawGeom = circle(center, radius, {
            steps: 30,
            units: 'meters'
          });
          drawProcess(drawGeom, defaultGeom);
        } catch (e) {
          console.log(e);
          errorGeometry();
        }
        setActiveCircle(false);
      }
    });
  };

  const errorGeometry = () => {
    let lastChange = [...geomtryHistoryRef.current].pop();
    if (lastChange) setLayer(lastChange, true);
  };

  const undoGeometry = e => {
    console.log('entro undo');
    if (geomtryHistory.length > 1) {
      setGeomtryHistory(
        geomtryHistory.filter((_, i) => i !== geomtryHistory.length - 1)
      );
      let lastChange = [...geomtryHistory].splice(-2, 1)[0];
      if (lastChange) setLayer(lastChange, true);
    }
  };

  const drawProcess = (drawGeom, defaultGeom) => {
    let drawGeometryChecked = geometryCheck(drawGeom);
    let process;

    if (activeCut === true) {
      process = cutAll(drawGeometryChecked, defaultGeom);
      if (!process) {
        setActiveCut(false);
        return;
      }
    } else {
      process = unionAll(drawGeometryChecked, defaultGeom);
    }

    let geometryWithoutIntersections = checkForIntersections(process);
    let resultGeometryChecked = geometryCheck(geometryWithoutIntersections);

    setLayer(resultGeometryChecked);
  };

  const checkForIntersections = drawGeom => {
    let diff;
    //Revisar diferencia con otros lotes
    let combined = combine(contextLayer.toGeoJSON());
    let contextWithoutEditLayer = difference(
      combined.features[0],
      editLayer.toGeoJSON()
    );
    diff = difference(drawGeom, contextWithoutEditLayer);

    return diff;
  };

  const setLayer = (geoj, error = false) => {
    if (error === false) setGeomtryHistory(oldArray => [...oldArray, geoj]);
    mapContext.state.map.editTools.featuresLayer.clearLayers();
    let lay = L.GeoJSON.geometryToLayer(geoj);
    mapContext.state.map.editTools.featuresLayer.addLayer(lay);
    lay.enableEdit();
    setEditableLayer(lay);
    setEvents(lay);
  };

  const cutWithLine = e => {
    var geom = mapContext.state.map.editTools.startPolyline();

    geom.on('editable:drawing:end', function(end) {
      if (end.layer._map) {
        try {
          const poly = [...geomtryHistory].pop();
          const line = end.layer.toGeoJSON();
          const LinePolygon = buffer(line, 1, {
            units: 'meters'
          });
          const clipped = difference(poly, LinePolygon);

          setLayer(clipped);
        } catch (e) {
          console.log(e);
          errorGeometry();
        }
      }
    });
  };

  const unGroupObject = e => {
    mapContext.cursorOnMap('pointer');
    setMouseTooltip({
      isActive: true,
      text: 'Elegir una o mas partes de un objeto para desagrupar.'
    });
    editableLayer.once('click', function(e) {
      let flat = flatten(e.target.toGeoJSON());
      let point1 = point([e.latlng.lng, e.latlng.lat]);
      featureEach(flat, function(currentFeature, featureIndex) {
        if (booleanPointInPolygon(point1, currentFeature)) {
          setMouseTooltip({
            isActive: false,
            text: ''
          });
          setUngroupLayer(currentFeature);
          setUngroupOpen(true);
        }
      });
    });
  };

  const confirmUngroup = () => {
    let editLayerLessDiff = difference(editLayer.toGeoJSON(), ungroupLayer);
    editLayerLessDiff.properties = editLayerProperties;
    ungroupLayer.properties = editLayerProperties;

    props.result([
      {
        id: editLayer._leaflet_id,
        type: 'lotes',
        geojson: editLayerLessDiff
      },
      {
        id: null,
        type: 'lotes',
        geojson: ungroupLayer
      }
    ]);

    handleCloseUngroup();
    props.unmountMe();
  };

  const groupObject = e => {
    mapContext.cursorOnMap('pointer');
    setGroup({
      buttonToggle: true
    });
    setMouseTooltip({
      isActive: true,
      text: 'Elija uno o mas objetos para agrupar.'
    });
    contextLayer.once('click', function(e) {
      console.log('context click');
      let flat = flatten(e.target.toGeoJSON());
      let point1 = point([e.latlng.lng, e.latlng.lat]);
      let featuresArray = [];
      featureEach(flat, function(currentFeature, featureIndex) {
        if (booleanPointInPolygon(point1, currentFeature)) {
          featuresArray.push(currentFeature);
        }
      });

      console.log(featuresArray.concat(editLayer.toGeoJSON()));

      setMouseTooltip({
        isActive: false,
        text: ''
      });

      setGroup({
        openDialog: true,
        selectLayers: featuresArray.concat(editLayer.toGeoJSON()),
        allProperties: [],
        buttonToggle: false
      });
    });
  };

  const confirmGroup = () => {
    console.log(group);
    alert('ok');
    /*let editLayerLessDiff = difference(editLayer.toGeoJSON(), ungroupLayer);
    editLayerLessDiff.properties = editLayerProperties;
    ungroupLayer.properties = editLayerProperties;

    props.result([
      {
        id: editLayer._leaflet_id,
        type: 'lotes',
        geojson: editLayerLessDiff
      },
      {
        id: null,
        type: 'lotes',
        geojson: ungroupLayer
      }
    ]);*/

    handleCloseGroup();
    props.unmountMe();
  };

  const saveEditLayer = () => {
    let resultGeoJson = editableLayer.toGeoJSON();
    resultGeoJson.properties = editLayerProperties;
    props.result({
      id: editLayer._leaflet_id,
      type: 'lotes',
      geojson: resultGeoJson
    });
    props.unmountMe();
  };

  const setEvents = lay => {
    let snapGuideLayer;

    if (contextLayer) snapGuideLayer = contextLayer;
    else snapGuideLayer = editLayer;

    let snap = new L.Handler.MarkerSnap(mapContext.state.map);
    snap.addGuideLayer(snapGuideLayer);

    let snapMarker = L.marker(mapContext.state.map.getCenter(), {
      icon: mapContext.state.map.editTools.createVertexIcon({
        className: 'leaflet-div-icon leaflet-icon-snap'
      }),
      opacity: 1,
      zIndexOffset: 1000
    });

    if (snapGuideLayer.getLayers().length > 1) {
      snap.disable();
    } else {
      snap.enable();
    }

    //Verificar punto que queda cuando se guarda geom (relacionado a snap)
    /*if (!lay.listens('editable:disable')) {
      lay.on('editable:disable', function(dragend) {
        console.log('snap.disable');
        snap.disable();
      });
    }*/

    if (!lay.listens('editable:vertex:dragend')) {
      lay.on('editable:vertex:dragend', function(dragend) {
        try {
          let geoj = unify(dragend.layer.toGeoJSON());
          geoj = geometryCheck(geoj);
          geoj = checkForIntersections(geoj);
          geoj = geometryCheck(geoj);
          setLayer(geoj);
        } catch (e) {
          console.log(e);
          errorGeometry();
        }
      });
    }

    if (!lay.listens('editable:vertex:deleted')) {
      lay.on('editable:vertex:deleted', function(dragend) {
        try {
          let geoj = unify(dragend.layer.toGeoJSON());
          geoj = geometryCheck(geoj);
          geoj = checkForIntersections(geoj);
          geoj = geometryCheck(geoj);
          setLayer(geoj);
        } catch (e) {
          console.log(e);
          errorGeometry();
        }
      });
    }

    const followMouse = e => {
      snapMarker.setLatLng(e.latlng);
    };

    if (!mapContext.state.map.listens('editable:vertex:dragstart')) {
      mapContext.state.map.on('editable:vertex:dragstart', function(e) {
        snap.watchMarker(e.vertex);
      });
    }

    if (!mapContext.state.map.listens('editable:vertex:dragend')) {
      mapContext.state.map.on('editable:vertex:dragend', function(e) {
        snap.unwatchMarker(e.vertex);
      });
    }

    if (!mapContext.state.map.listens('editable:drawing:start')) {
      mapContext.state.map.on('editable:drawing:start', function(e) {
        snap.watchMarker(snapMarker);
        this.on('mousemove', followMouse);
      });
    }

    if (!mapContext.state.map.listens('editable:drawing:end')) {
      mapContext.state.map.on('editable:drawing:end', function(e) {
        this.off('mousemove', followMouse);
        snapMarker.remove();
      });
    }

    if (!mapContext.state.map.listens('editable:drawing:click')) {
      mapContext.state.map.on('editable:drawing:click', function(e) {
        let latlng = snapMarker.getLatLng();
        e.latlng.lat = latlng.lat;
        e.latlng.lng = latlng.lng;
      });
    }

    if (!mapContext.state.map.listens('editable:drawing:move')) {
      mapContext.state.map.on('editable:drawing:move', function(e) {
        snapMarker.setLatLng(e.latlng);
      });
    }

    snapMarker.on('snap', function(e) {
      snapMarker.addTo(mapContext.state.map);
    });

    snapMarker.on('unsnap', function(e) {
      snapMarker.remove();
    });

    //$('.leaflet-overlay-pane path').removeClass('leaflet-interactive');
  };

  return (
    <>
      {/* MouseTooltip de asistencia */}
      {mouseTooltip.isActive && (
        <MouseTooltip
          visible={true}
          offsetX={15}
          offsetY={0}
          style={{ zIndex: 1000 }}
        >
          <Paper className={classes.paperMouseTooltip}>
            <Typography
              className={classes.typographyMouseTooltip}
              variant="caption"
              display="block"
              gutterBottom
            >
              {mouseTooltip.text}
            </Typography>
          </Paper>
        </MouseTooltip>
      )}

      {/* Dialog desagrupar multipartes */}
      {ungroupOpen && (
        <Dialog open={ungroupOpen} onClose={handleCloseUngroup}>
          <DialogTitle disableTypography>
            <Typography variant="h4">¿Desea desagregar el objeto?</Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              El objeto resultante mantendrá los mismos atributos que el
              original.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUngroup} color="default">
              Cancelar
            </Button>
            <Button
              onClick={confirmUngroup}
              color="primary"
              variant="contained"
              autoFocus
            >
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog agrupar en multipartes */}
      {group.openDialog && <DialogGroup />}

      {/* Interfaz edit tools */}
      <Box className={classes.editGroup}>
        <Box className={classes.buttongroup}>
          <Tooltip title="Dibujar rectangulo" arrow>
            <Button
              className={classes.button}
              onClick={drawSquare}
              color={activeSquare ? 'primary' : 'default'}
            >
              <FontAwesomeIcon icon={faDrawSquare} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Dibujar circulo" arrow>
            <Button
              className={classes.button}
              onClick={drawCircle}
              color={activeCircle ? 'primary' : 'default'}
            >
              <FontAwesomeIcon icon={faDrawCircle} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Dibujar poligono" arrow>
            <Button
              className={classes.button}
              onClick={drawPolygon}
              color={activePolygon ? 'primary' : 'default'}
            >
              <FontAwesomeIcon icon={faDrawPolygon} size="lg" />
            </Button>
          </Tooltip>
          <Box style={{ paddingTop: 5, paddingBottom: 5 }}>
            <Divider
              orientation="vertical"
              style={{
                width: 2,
                backgroundColor: '#263238',
                marginLeft: 3,
                marginRight: 3
              }}
            />
          </Box>
          <Tooltip title="Activar corte" arrow>
            <Button
              className={classes.button}
              onClick={() => setActiveCut(!activeCut)}
              color={activeCut ? 'primary' : 'default'}
            >
              <FontAwesomeIcon icon={faCut} size="lg" />
            </Button>
          </Tooltip>
        </Box>
        <Box className={classes.buttongroup}>
          <Tooltip title="Dividir objeto" arrow>
            <Button className={classes.button} onClick={cutWithLine}>
              <FontAwesomeIcon icon={faScalpelPath} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Agrupar objectos en multiparte" arrow>
            <Button
              className={classes.button}
              onClick={groupObject}
              color={group.buttonToggle ? 'primary' : 'default'}
            >
              <FontAwesomeIcon icon={faObjectGroup} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Desagrupar objecto multiparte" arrow>
            <div>
              <Button
                className={classes.button}
                onClick={unGroupObject}
                disabled={flatten(editLayer.toGeoJSON()).features.length <= 1}
              >
                <FontAwesomeIcon icon={faObjectUngroup} size="lg" />
              </Button>
            </div>
          </Tooltip>
        </Box>
        <Box className={classes.buttongroup}>
          <Tooltip title="Volver atras" arrow>
            <Button className={classes.button} onClick={undoGeometry}>
              <FontAwesomeIcon icon={faUndo} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar objeto" arrow>
            <Button className={classes.button}>
              <FontAwesomeIcon icon={faTrashAlt} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Guardar" arrow onClick={saveEditLayer}>
            <Button className={classes.button}>
              <FontAwesomeIcon icon={faSave} size="lg" />
            </Button>
          </Tooltip>

          <Tooltip title="Cerrar edición" arrow>
            <Button
              className={classes.button}
              onClick={() => props.unmountMe()}
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
};

export default EditTool;
