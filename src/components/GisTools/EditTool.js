//$(document).on("click", "#selected_object_edit", function () {
//    if (!map.drawSelector && mapsLayersVector.editMode){
//        L.control.drawSelector().addTo(map);
//    }
//});

//$(document).on("click", "#actions_panel_close", function () {
//    if(map.drawSelector){
//        map.drawSelector.remove();
//    }
//});

/*function checkForIntersections(drawGeom) {
    var difference = drawGeom;

    let iLayerEditId = -1;
    let layerLeafletEdit = undefined;
    let objSelected = mapsLayersVector.GetSelectedObject();
    if (objSelected != null) {
        layerLeafletEdit = objSelected.layerLeaflet;
        iLayerEditId = objSelected.objectLeaflet.feature.properties.object_id;
    }
    else 
    {
        let laySelected = mapsLayersVector.GetSelected()
        if (laySelected != undefined) {
            layerLeafletEdit = laySelected.layerLeaflet;
        }
    }
    if (layerLeafletEdit != undefined) {
        layerLeafletEdit.eachLayer(function (layer) {
            var layerGeo = layer.toGeoJSON();
            if (layerGeo.properties.object_id != iLayerEditId) {
                difference = turf.difference(difference, layerGeo);
            }
        });
    }
    return difference;
}

function geometryCheck (geom) {
    try {
        
        geom = turf.rewind(geom);
        geom = turf.simplify(geom, { tolerance: 0.000001, highQuality: false });
        geom = turf.cleanCoords(geom);

        if(turf.kinks(geom).features.length > 0){ //si tiene nudos
            let unkink = turf.unkinkPolygon(geom);
            let array = [];
            turf.flattenEach(unkink, function (currentFeature, featureIndex, multiFeatureIndex) {
                array.push(currentFeature.geometry.coordinates);     
            });
            geom = turf.multiPolygon(array);
        }
        
        if(geom.geometry.type == "MultiPolygon"){ //limpiar geometrias con menos de 100mts2 (ej: lineas entre lotes)
            geom = cleanGeometries(geom, 100);
        }

        if(geom.geometry.type != "MultiPolygon" && geom.geometry.type != "Polygon"){
            throw "No es poligono ni multipoligono.";
        }

        if(!turf.buffer(geom, 0)) throw "La geometria no es valida.";

        if(turf.area(geom) < 100) throw "La geometria debe tener como minimo 100mts2.";

        return geom;
    } catch (e) {
        console.log(e);
        throw "Error.";
    }
}

function unionAll (drawGeom, defaultGeom){
    union = turf.union(drawGeom, defaultGeom);
    return union;
}

function cutAll (drawGeom, defaultGeom){
    var count = 0;
    var cantgeom = 0;
    turf.flattenEach(defaultGeom, function (currentFeature) {
        cantgeom++;
        if(drawGeom.geometry.type == "MultiPolygon") {
            turf.flattenEach(drawGeom, function (currentFeatureDraw) {
                if(turf.booleanContains(currentFeatureDraw, currentFeature)){
                    count++;
                }
            });
        } else {
            if(turf.booleanContains(drawGeom, currentFeature)){
                count++;
            }
        }
    });

    if(count == cantgeom){ //eliminar todo
        map.editTools.featuresLayer.clearLayers();
        return;
    }

    cut = turf.difference(defaultGeom, drawGeom);
    return cut;
}

function cleanGeometries(geom, mts){
    var array = [];
    turf.flattenEach(geom, function (currentFeature, featureIndex, multiFeatureIndex) {
        var area = turf.area(currentFeature);
        if(area >= mts){
            array.push(currentFeature.geometry.coordinates);
        }
    });
    return turf.multiPolygon(array);
}

function setLayer(geoj, context) {
    map.editTools.geomtryHistory.push(geoj);

    map.editTools.featuresLayer.clearLayers();
    lay = L.GeoJSON.geometryToLayer(geoj);
    map.editTools.featuresLayer.addLayer(lay);
    lay.enableEdit();
    L.control.setEvents(lay, context);
}

function unify(polyList) {
    var unionTemp = undefined;
    turf.flattenEach(polyList, function (currentFeature, featureIndex, multiFeatureIndex) {
        if(multiFeatureIndex == 0){
            unionTemp = currentFeature;
        } else {
            unionTemp = turf.union(unionTemp, currentFeature);
        }
    });

    return unionTemp;
}

L.Control.DrawSelector = L.Control.extend({
    onAdd: function (map) {
        let layerEdit = mapsLayersVector.GetSelectedObject();

        this.drawSelector = L.DomUtil.create('div', 'editMapPanel');
        this.edit = L.DomUtil.create('i', 'fas fa-edit fa-2x pl-2', this.drawSelector);
        this.drawtools = L.DomUtil.create('div', 'panel-tools', this.drawSelector);
        this.square = L.DomUtil.create('i', 'fal fa-draw-square fa-2x', this.drawtools);
        this.circle = L.DomUtil.create('i', 'fal fa-draw-circle fa-2x', this.drawtools);
        this.polygon = L.DomUtil.create('i', 'fal fa-draw-polygon fa-2x', this.drawtools);
        this.divider = L.DomUtil.create('div', 'divider', this.drawSelector);
        this.tools = L.DomUtil.create('div', 'panel-tools', this.drawSelector);
        this.cut = L.DomUtil.create('i', 'fas fa-cut fa-2x', this.tools);
        this.undo = L.DomUtil.create('i', 'fas fa-undo-alt fa-2x', this.tools);
        if (layerEdit != undefined)
            this.close = L.DomUtil.create('i', 'fas fa-times fa-2x pr-2', this.tools);

        L.DomEvent.disableClickPropagation(this.drawSelector);
        L.DomEvent.disableScrollPropagation(this.drawSelector);

        L.DomEvent
            .addListener(this.polygon, 'click', this.drawPolygon, this)
            .addListener(this.square, 'click', this.drawSquare, this)
            .addListener(this.circle, 'click', this.drawCircle, this)
            .addListener(this.cut, 'click', this.cutToggle, this)
            .addListener(this.undo, 'click', this.undoButton, this);

        if (layerEdit != undefined)
            L.DomEvent.addListener(this.close, 'click', this.closeEdit, this);

        this.cutStatus = false;
        this.activeDrawTool = undefined;
        map.editTools.geomtryHistory = [];
        map.drawSelector = this;
        mapsLayersVector.clickeableCurrentLayer = false;

        return this.drawSelector;
    },
    drawPolygon: function (event) {

        var geom = map.editTools.startPolygon();
        this.activeClassToggle(this.polygon, "polygon");

        geom.on('editable:drawing:end', function (end) {
            if(end.layer._map){
                try {
                    var editLayers = map.editTools.featuresLayer.toGeoJSON();
                    var defaultGeom = editLayers.features[0];
                    var drawGeom = end.layer.toGeoJSON();
                    if(this.cutStatus == true && defaultGeom.geometry.type == "Point"){
                        end.layer.remove();
                        this.activeClassToggle(this.polygon, "disable");
                        return;
                    }
                    
                    this.drawProcess(drawGeom, defaultGeom);
                } catch (e) {
                    console.log(e);
                    this.undoGeometry();
                }
            }
            this.activeClassToggle(this.polygon, "disable");
            
        }, this);

    },
    drawSquare: function (event) {

        var geom = map.editTools.startRectangle();
        this.activeClassToggle(this.square, "square");

        geom.on('editable:drawing:end', function (end) {
            if(end.layer._map){
                try {
                    var editLayers = map.editTools.featuresLayer.toGeoJSON();
                    var defaultGeom = editLayers.features[0];
                    var drawGeom = end.layer.toGeoJSON();
                    if(this.cutStatus == true && defaultGeom.geometry.type == "Point"){
                        end.layer.remove();
                        this.activeClassToggle(this.square, "disable");
                        return;
                    }
                    
                    this.drawProcess(drawGeom, defaultGeom);
                } catch (e) {
                    console.log(e);
                    this.undoGeometry();
                }
            }
            this.activeClassToggle(this.square, "disable");
        }, this);

    },
    drawCircle: function (event) {

        var geom = map.editTools.startCircle();
        this.activeClassToggle(this.circle, "circle");

        geom.on('editable:drawing:end', function (end) {
            if(end.layer._map){
                try {
                    var editLayers = map.editTools.featuresLayer.toGeoJSON();
                    var defaultGeom = editLayers.features[0];
                    var center = end.layer.toGeoJSON().geometry.coordinates;
                    var radius = end.layer._mRadius;
                    var drawGeom = turf.circle(center, radius, { steps: 30, units: 'meters' });
                    if(this.cutStatus == true && defaultGeom.geometry.type == "Point"){
                        end.layer.remove();
                        this.activeClassToggle(this.circle, "disable");
                        return;
                    }

                    this.drawProcess(drawGeom, defaultGeom);
                } catch (e) {
                    console.log(e);
                    this.undoGeometry();
                }
            }
            this.activeClassToggle(this.circle, "disable");
        }, this);

    },
    drawProcess: function (drawGeom, defaultGeom){
        drawGeometryChecked = geometryCheck(drawGeom);

        if(this.cutStatus == true){  
            process = cutAll(drawGeometryChecked, defaultGeom);
            if(!process){
                this.cutToggle();
                return;
            }
        } else {
            process = unionAll(drawGeometryChecked, defaultGeom);
        }
        
        geometryWithoutIntersections = checkForIntersections(process);
        resultGeometryChecked = geometryCheck(geometryWithoutIntersections);

        setLayer(resultGeometryChecked, this);
    },
    activeClassToggle: function(element, type, geom){

        if(type == "disable"){
            L.DomUtil.removeClass(element, 'active-button');
            this.activeDrawTool = undefined;
            return;
        }

        L.DomUtil.addClass(element, 'active-button');
        this.activeDrawTool = type;
    },
    cutToggle: function (event){
        if(this.cutStatus){
            L.DomUtil.removeClass(this.cut, 'active-button');
            this.cutStatus = false;
            return;
        }
        L.DomUtil.addClass(this.cut, 'active-button');
        this.cutStatus = true;
    },
    undoButton: function (event) {
        this.undoGeometry("button");
    },
    closeEdit: function (event) {
        if (map.drawSelector) {
          map.drawSelector.remove();
        }
    },
    undoGeometry: function (event) {
        if (event == "button"){
            if(map.editTools.geomtryHistory.length != 1){
                map.editTools.geomtryHistory.splice(-1,1);
            }
        }
        var lastChange = map.editTools.geomtryHistory.pop();
        map.editTools.featuresLayer.clearLayers();
        if (lastChange) {
            setLayer(lastChange, this);
        }
    },
    onRemove: function (map) {
        map.editTools.featuresLayer.clearLayers();
        map.editTools.geomtryHistory = undefined;
        mapsLayersVector.clickeableCurrentLayer = true;
        $(".leaflet-overlay-pane path").addClass('leaflet-interactive');
        delete map.drawSelector;
    }
});

L.control.drawSelector = function (opts) {
    return new L.Control.DrawSelector(opts);
};

L.control.setEvents = function (lay, context) {
    let layerEdit = mapsLayersVector.GetSelectedObject();
    if (layerEdit == undefined) {
        layerEdit = mapsLayersVector.GetSelected();
    }

    var cantLayers = 0;
    var snap = new L.Handler.MarkerSnap(map);
    if (layerEdit.layerLeaflet != undefined) {
        cantLayers = layerEdit.layerLeaflet.getLayers().length;
        snap.addGuideLayer(layerEdit.layerLeaflet);
    }

    var snapMarker = L.marker(map.getCenter(), {
        icon: map.editTools.createVertexIcon({ className: 'leaflet-div-icon leaflet-drawing-icon leaflet-icon-snap' }),
        opacity: 1,
        zIndexOffset: 1000
    });

    if (cantLayers > 1) {
        snap.disable();
    } else {
        snap.enable();
    }


    if (!lay.listens('editable:vertex:dragend')) {
        lay.on('editable:vertex:dragend', function (dragend) {
            try {
                geoj = unify(dragend.layer.toGeoJSON());
                geoj = geometryCheck(geoj);
                geoj = checkForIntersections(geoj);
                geoj = geometryCheck(geoj);
                setLayer(geoj, this);
            } catch (e) {
                console.log(e);
                context.undoGeometry();
            }
        }, context);
    }

    if (!lay.listens('editable:vertex:deleted')) {
        lay.on('editable:vertex:deleted', function (dragend) {
            try {
                geoj = unify(dragend.layer.toGeoJSON());
                geoj = geometryCheck(geoj);
                geoj = checkForIntersections(geoj);
                geoj = geometryCheck(geoj);
                setLayer(geoj, this);
            } catch (e) {
                console.log(e);
                context.undoGeometry();
            }
        }, context);
    }

    var followMouse = function (e) {
        snapMarker.setLatLng(e.latlng);
    }

    if (!map.listens('editable:vertex:dragstart')) {
        map.on('editable:vertex:dragstart', function (e) {
            snap.watchMarker(e.vertex);
        });
    }

    if (!map.listens('editable:vertex:dragend')) {
        map.on('editable:vertex:dragend', function (e) {
            snap.unwatchMarker(e.vertex);
        });
    }

    if (!map.listens('editable:drawing:start')) {
        map.on('editable:drawing:start', function (e) {
            snap.watchMarker(snapMarker);
            this.on('mousemove', followMouse);
        });
    }

    if (!map.listens('editable:drawing:end')) {
        map.on('editable:drawing:end', function (e) {
            this.off('mousemove', followMouse);
            snapMarker.remove();
        });
    }

    if (!map.listens('editable:drawing:click')) {
        map.on('editable:drawing:click', function (e) {
            var latlng = snapMarker.getLatLng();
            e.latlng.lat = latlng.lat;
            e.latlng.lng = latlng.lng;
        });
    }

    if (!map.listens('editable:drawing:move')) {
        map.on('editable:drawing:move', function (e) {
            snapMarker.setLatLng(e.latlng);
        });
    }

    snapMarker.on('snap', function (e) {
        snapMarker.addTo(map);
    });

    snapMarker.on('unsnap', function (e) {
        snapMarker.remove();
    });

    $(".leaflet-overlay-pane path").removeClass('leaflet-interactive');
}*/

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
    top: '10px',
    left: '50%',
    transform: 'translate(-50%, 0)'
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

const EditTool = props => {
  const classes = useStyles();
  const [toggleGroup, setToggleGroup] = useState(false);
  const map = useContext(MapContext);

  const measureByPolygon = () => {
    console.log(map);
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
    </>
  );
};

export default EditTool;
