import React, { useState, useContext, useEffect } from 'react';
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
import { geometryCheck, cutAll, unionAll, unify } from 'src/utils/functionsGeo';
import L from 'leaflet';
import 'leaflet-geometryutil';
import 'leaflet-snap';
import { circle } from '@turf/turf';

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
  const [activeSquare, setActiveSquare] = useState(false);
  const [activeCircle, setActiveCircle] = useState(false);
  const [activePolygon, setActivePolygon] = useState(false);
  const [activeCut, setActiveCut] = useState(false);
  const [geomtryHistory, setGeomtryHistory] = useState([]);
  const mapContext = useContext(MapContext);
  const { editLayer, contextLayer } = props;

  useEffect(() => {
    setLayer(editLayer.toGeoJSON());
    console.log(contextLayer);

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
    if (lastChange) {
      setLayer(lastChange, true);
    }
  };

  const undoGeometry = e => {
    if (geomtryHistory.length > 1) {
      setGeomtryHistory(
        geomtryHistory.filter((_, i) => i !== geomtryHistory.length - 1)
      );
      let lastChange = [...geomtryHistory].splice(-2, 1)[0];
      mapContext.state.map.editTools.featuresLayer.clearLayers();
      if (lastChange) {
        setLayer(lastChange, true);
      }
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

  const setLayer = (geoj, error = false) => {
    if (error === false) setGeomtryHistory(oldArray => [...oldArray, geoj]);
    mapContext.state.map.editTools.featuresLayer.clearLayers();
    let lay = L.GeoJSON.geometryToLayer(geoj);
    mapContext.state.map.editTools.featuresLayer.addLayer(lay);
    lay.enableEdit();
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

    if (snapGuideLayer.getLayers().length > 1) {
      snap.disable();
    } else {
      snap.enable();
    }

    if (!lay.listens('editable:vertex:dragend')) {
      lay.on('editable:vertex:dragend', function(dragend) {
        try {
          let geoj = unify(dragend.layer.toGeoJSON());
          geoj = geometryCheck(geoj);
          //geoj = checkForIntersections(geoj);
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
          //geoj = checkForIntersections(geoj);
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

  useEffect(() => {
    console.log(geomtryHistory);
  }, [geomtryHistory]);

  return (
    <>
      <Box className={classes.buttonGroup}>
        <Button className={classes.button} disabled>
          <FontAwesomeIcon icon={faEdit} size="lg" />
        </Button>
        <Button
          className={classes.button}
          onClick={drawSquare}
          color={activeSquare ? 'primary' : 'default'}
        >
          <FontAwesomeIcon icon={faDrawPolygon} size="lg" />
        </Button>
        <Button
          className={classes.button}
          onClick={drawCircle}
          color={activeCircle ? 'primary' : 'default'}
        >
          <FontAwesomeIcon icon={faDrawPolygon} size="lg" />
        </Button>
        <Button
          className={classes.button}
          onClick={drawPolygon}
          color={activePolygon ? 'primary' : 'default'}
        >
          <FontAwesomeIcon icon={faDrawPolygon} size="lg" />
        </Button>
        <Box style={{ paddingTop: 5, paddingBottom: 5 }}>
          <Divider
            orientation="vertical"
            style={{ width: 2, backgroundColor: '#263238' }}
          />
        </Box>
        <Button
          className={classes.button}
          onClick={() => setActiveCut(!activeCut)}
          color={activeCut ? 'primary' : 'default'}
        >
          <FontAwesomeIcon icon={faCut} size="lg" />
        </Button>
        <Button className={classes.button} onClick={undoGeometry} value="undo">
          <FontAwesomeIcon icon={faUndo} size="lg" />
        </Button>
        <Button className={classes.button} onClick={() => props.unmountMe()}>
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </Button>
      </Box>
    </>
  );
};

export default EditTool;
