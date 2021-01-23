import React, {
  useState,
  useContext,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react';

//Material UI components
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

//Varios
import {
  geometryCheck,
  cutAll,
  unionAll,
  unify,
  checkForIntersections
} from 'src/utils/functionsGeo';
import MouseTooltip from 'react-sticky-mouse-tooltip';
import MapContext from 'src/contexts/MapContext';
import L from 'leaflet';
import 'leaflet-geometryutil';
import 'leaflet-snap';
import * as turf from '@turf/turf';

//FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUndo,
  faCut,
  faScalpelPath
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

const useStyles = makeStyles(theme => ({
  editGroup: {
    position: 'absolute',
    zIndex: 800,
    left: '50%',
    top: 10,
    transform: 'translate(-50%, 0%)',
    display: 'inline-flex'
  },
  buttongroup: {
    backgroundColor: theme.palette.background.paper1,
    borderRadius: 4,
    marginLeft: 10,
    display: 'inline-flex'
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

const EditTool = forwardRef((props, ref) => {
  var useStateRef = require('react-usestateref');
  const classes = useStyles();
  const [activeAction, setActiveAction, activeActionRef] = useStateRef({
    drawSquare: false,
    drawCircle: false,
    drawPolygon: false,
    cutWithLine: false,
    group: false,
    ungroup: false,
    remove: false
  });
  const [activeCut, setActiveCut, activeCutRef] = useStateRef(false);
  const [mouseTooltip, setMouseTooltip] = useState({
    isActive: false,
    text: ''
  });
  const [geomtryHistory, setGeomtryHistory, geomtryHistoryRef] = useStateRef(
    []
  );
  const [editableLayer, setEditableLayer] = useState(null);
  const [editLayerInfo, setEditLayerInfo] = useState({
    properties: null,
    length: null
  });
  const [helperGeom, setHelperGeom] = useState({ layer: null, type: '' });
  const [
    contextLayerLessEditLayer,
    setContextLayerLessEditLayer,
    contextLayerLessEditLayerRef
  ] = useStateRef(null);
  const [group, setGroup] = useState({
    openDialog: false,
    selectLayers: []
  });
  const [ungroup, setUngroup] = useState({
    openDialog: false,
    selectLayers: []
  });
  const [remove, setRemove] = useState({
    openDialog: false,
    selectLayers: []
  });
  const mapContext = useContext(MapContext);
  const { editLayer, contextLayer, groupName, advancedEdit } = props;

  useImperativeHandle(ref, () => ({
    saveEditLayer
  }));

  useEffect(() => {
    if (editLayer) {
      console.log(contextLayer.toGeoJSON());
      console.log(contextLayer);
      console.log(editLayer);
      if (contextLayer.hasLayer(editLayer)) {
        let diff = contextLayer.removeLayer(editLayer).toGeoJSON();
        console.log(editLayer.toGeoJSON());
        console.log(diff);
        if (diff.features.length > 0) {
          console.log('entro');
          setContextLayerLessEditLayer(diff);
        }
        contextLayer.addLayer(editLayer);
      }

      setEditLayerInfo({
        properties: editLayer.toGeoJSON().properties,
        length: turf.flatten(editLayer.toGeoJSON()).features.length
      });

      setLayer(editLayer.toGeoJSON());
    } else {
      setContextLayerLessEditLayer(contextLayer.toGeoJSON());
    }

    return () => {
      mapContext.state.map.editTools.featuresLayer.clearLayers();
      mapContext.state.map.editTools.stopDrawing();
      mapContext.cursorOnMap();
    };
  }, []);

  const toggleActiveCut = () => {
    toggleActiveAction();
    setActiveCut(!activeCut);
  };

  const toggleActiveAction = action => {
    //Disable events
    setMouseTooltip({
      isActive: false,
      text: ''
    });

    if (editableLayer) editableLayer.off('click');

    let stateCopy = { ...activeAction };
    Object.keys(stateCopy).forEach(key => {
      stateCopy[key] = false;
    });
    if (action) stateCopy[action] = true;
    if (
      activeCut &&
      !['drawSquare', 'drawPolygon', 'drawCircle'].includes(action)
    )
      setActiveCut(false);
    setActiveAction(stateCopy);
  };

  useEffect(() => {
    if (helperGeom.layer) {
      helperGeom.layer.on('editable:drawing:end', function(end) {
        if (end.layer._map) {
          try {
            let lastGeom = [...geomtryHistory].pop();
            let drawGeom = end.layer.toGeoJSON();

            if (
              helperGeom.type === 'drawSquare' ||
              helperGeom.type === 'drawPolygon'
            ) {
              drawProcess(drawGeom, lastGeom);
            } else if (helperGeom.type === 'drawCircle') {
              let center = drawGeom.geometry.coordinates;
              let radius = end.layer._mRadius;
              let circlePolygon = turf.circle(center, radius, {
                steps: 30,
                units: 'meters'
              });
              drawProcess(circlePolygon, lastGeom);
            } else if (helperGeom.type === 'cutWithLine') {
              let LinePolygon = turf.buffer(drawGeom, 1, {
                units: 'meters'
              });
              let clipped = turf.difference(lastGeom, LinePolygon);
              setLayer(clipped);
              toggleActiveAction();
            }
          } catch (e) {
            console.log(e);
            errorGeometry();
          }
        }
      });
    }
  }, [helperGeom]);

  const drawSquare = () => {
    setHelperGeom({
      layer: mapContext.state.map.editTools.startRectangle(),
      type: 'drawSquare'
    });
    toggleActiveAction('drawSquare');
  };

  const drawCircle = () => {
    setHelperGeom({
      layer: mapContext.state.map.editTools.startCircle(),
      type: 'drawCircle'
    });
    toggleActiveAction('drawCircle');
  };

  const drawPolygon = () => {
    setHelperGeom({
      layer: mapContext.state.map.editTools.startPolygon(),
      type: 'drawPolygon'
    });
    toggleActiveAction('drawPolygon');
  };

  const cutWithLine = e => {
    setHelperGeom({
      layer: mapContext.state.map.editTools.startPolyline(),
      type: 'cutWithLine'
    });
    toggleActiveAction('cutWithLine');
  };

  const errorGeometry = () => {
    let lastChange = [...geomtryHistoryRef.current].pop();
    if (lastChange) setLayer(lastChange, true);
  };

  const undoGeometry = e => {
    toggleActiveAction();
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

    if (defaultGeom) {
      if (activeCutRef.current === true) {
        process = cutAll(drawGeometryChecked, defaultGeom);
        if (!process) {
          //toggleActiveAction();
          return;
        }
      } else {
        process = unionAll(drawGeometryChecked, defaultGeom);
      }
    } else {
      process = drawGeometryChecked;
    }

    if (contextLayerLessEditLayerRef.current !== null) {
      process = checkForIntersections(
        process,
        contextLayerLessEditLayerRef.current
      );
    }

    let resultGeometryChecked = geometryCheck(process);

    toggleActiveAction();

    setLayer(resultGeometryChecked);
  };

  const unGroupObject = e => {
    mapContext.cursorOnMap('pointer');
    toggleActiveAction('ungroup');
    setMouseTooltip({
      isActive: true,
      text: 'Elegir una o mas partes de un objeto para desagrupar.'
    });
    editableLayer.once('click', function(e) {
      let flat = turf.flatten(e.target.toGeoJSON());
      let point1 = turf.point([e.latlng.lng, e.latlng.lat]);
      turf.featureEach(flat, function(currentFeature, featureIndex) {
        if (turf.booleanPointInPolygon(point1, currentFeature)) {
          setUngroup({
            openDialog: true,
            selectLayers: currentFeature
          });
        }
      });
      toggleActiveAction();
    });
  };

  const confirmUngroup = () => {
    let editLayerLessDiff = turf.difference(
      editLayer.toGeoJSON(),
      ungroup.selectLayers
    );
    editLayerLessDiff.properties = editLayerInfo.properties;
    ungroup.selectLayers.properties = editLayerInfo.properties;

    let result = {
      id: editLayer._leaflet_id,
      type: groupName,
      geojson: editLayerLessDiff,
      operation: 'update'
    };
    let result1 = {
      id: null,
      type: groupName,
      geojson: ungroup.selectLayers,
      operation: 'create'
    };
    mapContext.setResultEditTool(result);
    mapContext.setResultEditTool(result1);

    setUngroup({ openDialog: false });
    props.unmountMe();
  };

  const groupObject = e => {
    mapContext.cursorOnMap('pointer');
    toggleActiveAction('group');
    setMouseTooltip({
      isActive: true,
      text: 'Elija uno o mas objetos para agrupar.'
    });
    contextLayer.once('click', function(e) {
      setGroup({
        openDialog: true,
        selectLayers: e.layer
      });
      toggleActiveAction();
    });
  };

  const confirmGroup = () => {
    let editLayerUnionGroup = turf.union(
      editLayer.toGeoJSON(),
      group.selectLayers.toGeoJSON()
    );
    editLayerUnionGroup.properties = editLayerInfo.properties;

    let result = {
      id: editLayer._leaflet_id,
      type: groupName,
      geojson: editLayerUnionGroup,
      operation: 'update'
    };

    mapContext.removeLayerById(group.selectLayers._leaflet_id, groupName);
    mapContext.setResultEditTool(result);

    setGroup({ openDialog: false });
    props.unmountMe();
  };

  const saveEditLayer = (properties, styles) => {
    if (editableLayer) {
      let resultGeoJson = editableLayer.toGeoJSON();
      resultGeoJson = geometryCheck(resultGeoJson);
      if (properties) resultGeoJson.properties = properties;
      else resultGeoJson.properties = editLayerInfo.properties;
      if (styles) resultGeoJson.styles = styles;

      console.log(resultGeoJson);

      let result = {
        id: editLayer ? editLayer._leaflet_id : null,
        type: groupName,
        geojson: resultGeoJson,
        operation: editLayer ? 'update' : 'create'
      };

      mapContext.setResultEditTool(result);
      props.unmountMe();
    }

    props.unmountMe();
  };

  const RemoveEditLayer = () => {
    mapContext.cursorOnMap('pointer');
    toggleActiveAction('remove');
    setMouseTooltip({
      isActive: true,
      text: 'Elija una parte o todo el objeto para eliminar.'
    });
    editableLayer.once('click', function(e) {
      let flat = turf.flatten(e.target.toGeoJSON());
      let point1 = turf.point([e.latlng.lng, e.latlng.lat]);
      toggleActiveAction();
      if (flat.features.length > 1) {
        turf.featureEach(flat, function(currentFeature, featureIndex) {
          if (turf.booleanPointInPolygon(point1, currentFeature)) {
            let diff = turf.difference(e.target.toGeoJSON(), currentFeature);
            setRemove({
              openDialog: true,
              selectLayers: diff,
              operation: 'update'
            });
            return;
          }
        });
      } else {
        setRemove({
          openDialog: true,
          selectLayers: null,
          operation: 'remove'
        });
      }
    });
  };

  const confirmRemove = () => {
    if (remove.operation === 'update') {
      let resultGeoJson = remove.selectLayers;
      resultGeoJson.properties = editLayerInfo.properties;

      let result = {
        id: editLayer._leaflet_id,
        type: groupName,
        geojson: resultGeoJson,
        operation: 'update'
      };

      mapContext.setResultEditTool(result);
    } else if (remove.operation === 'remove') {
      mapContext.removeLayerById(editLayer._leaflet_id, groupName);
    }

    props.unmountMe();
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

    snap.enable();

    if (!lay.listens('editable:disable')) {
      lay.on('editable:disable', function(dragend) {
        snap.disable();
      });
    }

    if (!lay.listens('editable:vertex:dragend')) {
      lay.on('editable:vertex:dragend', function(dragend) {
        try {
          let geoj = unify(dragend.layer.toGeoJSON());
          geoj = geometryCheck(geoj);
          if (contextLayerLessEditLayerRef.current !== null) {
            geoj = checkForIntersections(
              geoj,
              contextLayerLessEditLayerRef.current
            );
            geoj = geometryCheck(geoj);
          }
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
          if (contextLayerLessEditLayerRef.current !== null) {
            geoj = checkForIntersections(
              geoj,
              contextLayerLessEditLayerRef.current
            );
            geoj = geometryCheck(geoj);
          }
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
        snapMarker.remove();
        this.off('mousemove', followMouse);
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
      {ungroup.openDialog && (
        <Dialog
          open={ungroup.openDialog}
          onClose={() => setUngroup({ openDialog: false })}
        >
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
            <Button
              onClick={() => setUngroup({ openDialog: false })}
              color="default"
            >
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
      {group.openDialog && (
        <Dialog
          open={group.openDialog}
          onClose={() => setGroup({ openDialog: false })}
        >
          <DialogTitle disableTypography>
            <Typography variant="h4">
              ¿Desea combinar los objetos seleccionados?
            </Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              El objeto resultante mantendrá los mismos atributos que el actual.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setGroup({ openDialog: false })}
              color="default"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmGroup}
              color="primary"
              variant="contained"
              autoFocus
            >
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Remover parte o todo */}
      {remove.openDialog && (
        <Dialog
          open={remove.openDialog}
          onClose={() => setRemove({ openDialog: false })}
        >
          <DialogTitle disableTypography>
            <Typography variant="h4">¿Desea eliminar el objeto?</Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              El objeto ya no estará disponible.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setRemove({ openDialog: false })}
              color="default"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmRemove}
              color="primary"
              variant="contained"
              autoFocus
            >
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Interfaz edit tools */}
      <Box className={classes.editGroup}>
        <Box className={classes.buttongroup}>
          <Tooltip title="Dibujar rectangulo" arrow>
            <Button
              className={classes.button}
              onClick={drawSquare}
              color={activeAction.drawSquare ? 'primary' : 'default'}
            >
              <FontAwesomeIcon icon={faDrawSquare} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Dibujar circulo" arrow>
            <Button
              className={classes.button}
              onClick={drawCircle}
              color={activeAction.drawCircle ? 'primary' : 'default'}
            >
              <FontAwesomeIcon icon={faDrawCircle} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Dibujar poligono" arrow>
            <Button
              className={classes.button}
              onClick={drawPolygon}
              color={activeAction.drawPolygon ? 'primary' : 'default'}
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
              onClick={toggleActiveCut}
              color={activeCut ? 'primary' : 'default'}
            >
              <FontAwesomeIcon icon={faCut} size="lg" />
            </Button>
          </Tooltip>
        </Box>
        {advancedEdit && (
          <Box className={classes.buttongroup}>
            <Tooltip title="Dividir objeto" arrow>
              <Button
                className={classes.button}
                onClick={cutWithLine}
                color={activeAction.cutWithLine ? 'primary' : 'default'}
              >
                <FontAwesomeIcon icon={faScalpelPath} size="lg" />
              </Button>
            </Tooltip>
            <Tooltip title="Agrupar objectos en multiparte" arrow>
              <div>
                <Button
                  className={classes.button}
                  onClick={groupObject}
                  color={activeAction.group ? 'primary' : 'default'}
                  disabled={
                    contextLayer.toGeoJSON().type === 'FeatureCollection' &&
                    contextLayer.toGeoJSON().features.length <= 1
                  }
                >
                  <FontAwesomeIcon icon={faObjectGroup} size="lg" />
                </Button>
              </div>
            </Tooltip>
            <Tooltip title="Desagrupar objecto multiparte" arrow>
              <div>
                <Button
                  className={classes.button}
                  onClick={unGroupObject}
                  disabled={editLayerInfo.length <= 1}
                  color={activeAction.ungroup ? 'primary' : 'default'}
                >
                  <FontAwesomeIcon icon={faObjectUngroup} size="lg" />
                </Button>
              </div>
            </Tooltip>
          </Box>
        )}
        <Box className={classes.buttongroup}>
          <Tooltip title="Volver atras" arrow>
            <div>
              <Button
                className={classes.button}
                onClick={undoGeometry}
                disabled={geomtryHistory.length <= 1}
              >
                <FontAwesomeIcon icon={faUndo} size="lg" />
              </Button>
            </div>
          </Tooltip>
          {advancedEdit && (
            <>
              <Tooltip title="Eliminar objeto" arrow>
                <Button
                  className={classes.button}
                  onClick={RemoveEditLayer}
                  color={activeAction.remove ? 'primary' : 'default'}
                >
                  <FontAwesomeIcon icon={faTrashAlt} size="lg" />
                </Button>
              </Tooltip>
              <Tooltip title="Guardar" arrow onClick={() => saveEditLayer()}>
                <Button className={classes.button}>
                  <FontAwesomeIcon icon={faSave} size="lg" />
                </Button>
              </Tooltip>
            </>
          )}
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
});

export default EditTool;
