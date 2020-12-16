import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faFilter } from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import MapContext from 'src/contexts/MapContext';
import 'leaflet-editable';

const useStyles = makeStyles(() => ({
  root: {},
  controls: {
    position: 'absolute',
    zIndex: 800,
    top: '10px',
    backgroundColor: 'white',
    left: '10px',
    borderRadius: '4px',
    width: '44px',
    height: '44px',
    border: '2px solid rgba(0,0,0,0.2)',
    backgroundClip: 'padding-box',
    '&:hover': {
      backgroundColor: '#f4f4f4'
    }
  }
}));

const MeasureTool = props => {
  const classes = useStyles();
  const map = useContext(MapContext);

  useEffect(() => {
    /*L.MeasureTool = L.Handler.extend({
      addHooks: function() {
        this.groupbottons = L.DomUtil.get('measure_tools');
        this.initbutton = L.DomUtil.get('action_measure_tool');
        this.linebutton = L.DomUtil.get('measurebyline');
        this.polygonbutton = L.DomUtil.get('measurebypolygon');
        this.cancelbutton = L.DomUtil.get('measurecancel');

        L.DomUtil.addClass(this.groupbottons, 'd-inline-flex');
        L.DomUtil.addClass(this.initbutton, 'd-none');

        L.DomEvent.on(this.linebutton, 'click', this.measureByLine, this);
        L.DomEvent.on(this.polygonbutton, 'click', this.measureByPolygon, this);
        L.DomEvent.on(this.cancelbutton, 'click', this.removeHooks, this);

        this.measureLayer = L.layerGroup().addTo(map);
        console.log('hola');
        map.measureTool = this;
      },
      removeHooks: function() {
        L.DomUtil.removeClass(map.measureTool.groupbottons, 'd-inline-flex');
        L.DomUtil.removeClass(map.measureTool.initbutton, 'd-none');
        map.measureTool.measureLayer.remove();
        map.measureTool.disable();
      },
      measureByPolygon: function(event) {
        let geom = map.editTools
          .startPolygon()
          .addTo(map.measureTool.measureLayer)
          .showMeasurements({ ha: true });

        geom.setStyle({
          color: '#ff9204'
        });

        geom.on(
          'editable:vertex:drag editable:vertex:deleted editable:vertex:new',
          geom.updateMeasurements
        );
      },
      measureByLine: function(event) {
        let geom = map.editTools
          .startPolyline()
          .addTo(map.measureTool.measureLayer)
          .showMeasurements({ ha: true });

        geom.setStyle({
          color: '#ff9204'
        });

        geom.on(
          'editable:vertex:drag editable:vertex:deleted editable:vertex:new',
          geom.updateMeasurements
        );
      }
    });

    // add this to all maps
    L.Map.addInitHook('addHandler', 'measureTool', L.MeasureTool);*/
  }, []);

  const measureByPolygon = () => {
    let geom = map.editTools
      .startPolygon()
      .addTo(map)
      .showMeasurements({ ha: true });

    geom.setStyle({
      color: '#ff9204'
    });

    geom.on(
      'editable:vertex:drag editable:vertex:deleted editable:vertex:new',
      geom.updateMeasurements
    );
  };

  return (
    <IconButton className={classes.controls} onClick={measureByPolygon}>
      <FontAwesomeIcon icon={faFilter} />
    </IconButton>
  );
};

export default MeasureTool;

/*$(document).on('click', '#action_measure_tool', function() {
  if (!map.measureTool.enabled()) {
    //si no esta habilitado
    map.measureTool.enable(); //habilitar
  }
});*/
