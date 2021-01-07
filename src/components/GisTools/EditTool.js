import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUndo,
  faCut,
  faMousePointer,
  faScalpelPath,
  faPlus
} from '@fortawesome/pro-solid-svg-icons';
import { faObjectGroup, faTrashAlt } from '@fortawesome/pro-regular-svg-icons';
import {
  faDrawSquare,
  faDrawCircle,
  faDrawPolygon
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
  polygon,
  multiPolygon,
  featureCollection,
  lineToPolygon,
  buffer
} from '@turf/turf';

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
    /*'&:disabled': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      borderRight: 'inherit !important',
      borderRadius: 0,
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4
    },*/
    '&:not(:last-child)': {
      borderRight: 0
    }
  }
}));

const EditTool = props => {
  const classes = useStyles();
  const [toggleGroup, setToggleGroup] = useState(false);
  const [activeSquare, setActiveSquare] = useState(false);
  const [activeCircle, setActiveCircle] = useState(false);
  const [activePolygon, setActivePolygon] = useState(false);
  const [activeCut, setActiveCut] = useState(false);
  const [geomtryHistory, setGeomtryHistory] = useState([]);
  const mapContext = useContext(MapContext);
  const { editLayer, contextLayer } = props;

  useEffect(() => {
    setLayer(editLayer.toGeoJSON());
    return () => {
      console.log('unmont');
      mapContext.state.map.editTools.featuresLayer.clearLayers();
    };
  }, []);

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
    let lastChange = [...geomtryHistory].pop();

    if (lastChange) setLayer(lastChange, true);
  };

  const undoGeometry = e => {
    if (geomtryHistory.length > 1) {
      setGeomtryHistory(
        geomtryHistory.filter((_, i) => i !== geomtryHistory.length - 1)
      );
      let lastChange = [...geomtryHistory].splice(-2, 1)[0];
      mapContext.state.map.editTools.featuresLayer.clearLayers();

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
    contextLayer.eachLayer(function(layer) {
      /*if (!contextLayer.hasLayer(layer)) {*/
      diff = difference(drawGeom, layer.toGeoJSON());
      /*} else {
        diff = drawGeom;
      }*/
    });
    return diff;
  };

  const setLayer = (geoj, error = false) => {
    if (error === false) setGeomtryHistory(oldArray => [...oldArray, geoj]);
    mapContext.state.map.editTools.featuresLayer.clearLayers();
    let lay = L.GeoJSON.geometryToLayer(geoj);
    mapContext.state.map.editTools.featuresLayer.addLayer(lay);
    lay.enableEdit();
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

    if (!lay.listens('editable:vertex:dragend')) {
      lay.on('editable:vertex:dragend', function(dragend) {
        try {
          let geoj = unify(dragend.layer.toGeoJSON());
          //let geoj = dragend.layer.toGeoJSON();
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
          //let geoj = dragend.layer.toGeoJSON();
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

  /*useEffect(() => {
    console.log(geomtryHistory);
  }, [geomtryHistory]);

  useEffect(() => {
    console.log(contextWithoutEditLayer);
  }, [contextWithoutEditLayer]);*/

  return (
    <>
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
          <Tooltip title="Seleccionar objectos" arrow>
            <Button className={classes.button}>
              <FontAwesomeIcon icon={faMousePointer} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Dividir objeto" arrow>
            <Button className={classes.button} onClick={cutWithLine}>
              <FontAwesomeIcon icon={faScalpelPath} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Seleccione dos o mas objetos" arrow>
            <div>
              <Button className={classes.button} disabled={true}>
                <FontAwesomeIcon icon={faObjectGroup} size="lg" />
              </Button>
            </div>
          </Tooltip>
          <Tooltip title="Volver atras" arrow>
            <Button className={classes.button} onClick={undoGeometry}>
              <FontAwesomeIcon icon={faUndo} size="lg" />
            </Button>
          </Tooltip>
        </Box>

        <Box className={classes.buttongroup}>
          <Tooltip title="Eliminar objeto" arrow>
            <Button className={classes.button}>
              <FontAwesomeIcon icon={faTrashAlt} size="lg" />
            </Button>
          </Tooltip>
          <Tooltip title="Agregar nuevo objeto" arrow>
            <Button className={classes.button}>
              <FontAwesomeIcon icon={faPlus} size="lg" />
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
