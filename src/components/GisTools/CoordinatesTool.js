/*L.Control.CoordinatesTool = L.Control.extend({
  onAdd: function(map) {
    let centerMap = map.getCenter();
    //panel general
    this.coordsTool = L.DomUtil.create('div', 'coordsTool');
    //boton action
    this.collapsePanelButton = L.DomUtil.create(
      'div',
      'button-coords tippyUp',
      this.coordsTool
    );
    L.DomUtil.create('i', 'fas fa-crosshairs', this.collapsePanelButton);
    //panel collapse
    this.panelTool = L.DomUtil.create('div', 'panelTool', this.coordsTool);
    //search coords longlat
    this.searchCoordsLongLat = L.DomUtil.create(
      'div',
      'search-coords-longlat d-none',
      this.panelTool
    );
    this.searchLong = L.DomUtil.create(
      'input',
      'search-coords search-long',
      this.searchCoordsLongLat
    );
    this.searchLong.placeholder = getTextLanguage('common_longitude');
    this.searchLat = L.DomUtil.create(
      'input',
      'search-coords search-lat',
      this.searchCoordsLongLat
    );
    this.searchLat.placeholder = getTextLanguage('common_latitude');
    this.goTo = L.DomUtil.create(
      'i',
      'fas fa-share-square mr-1 tippyUp',
      this.searchCoordsLongLat
    );
    //display coords
    this.coords = L.DomUtil.create('div', 'coords tippyUp', this.panelTool);
    this.coords.style = 'min-width: 130px';
    this.long = L.DomUtil.create('p', 'long', this.coords);
    this.long.innerHTML = centerMap.lng;
    this.comma = L.DomUtil.create('p', '', this.coords);
    this.comma.innerHTML = ',&nbsp';
    this.lat = L.DomUtil.create('p', 'lat', this.coords);
    this.lat.innerHTML = centerMap.lat;
    //tools
    this.tools = L.DomUtil.create('div', 'tools d-none', this.panelTool);
    this.divider = L.DomUtil.create('div', 'divider', this.tools);
    this.copy = L.DomUtil.create('i', 'fas fa-copy tippyUp', this.tools);
    this.search = L.DomUtil.create('i', 'fas fa-search tippyUp', this.tools);
    this.cancel = L.DomUtil.create('i', 'fas fa-times tippyUp', this.tools);

    //tooltips
    this.collapsePanelButton.dataset.tippyContent = getTextLanguage(
      'tools_showHidePanel'
    );
    this.cancel.dataset.tippyContent = getTextLanguage('tool_closePanel');
    this.coords.dataset.tippyContent = getTextLanguage(
      'coordinates_changeFormat'
    );
    this.goTo.dataset.tippyContent = getTextLanguage(
      'coordinates_goCoordinates'
    );
    this.copy.dataset.tippyContent = getTextLanguage(
      'coordinates_copyCoordinates'
    );
    this.search.dataset.tippyContent = getTextLanguage(
      'coordinates_findCoordinates'
    );

    L.DomEvent.addListener(
      this.collapsePanelButton,
      'click',
      this._collapsePanel,
      this
    )
      .addListener(this.coords, 'click', this._changeType, this)
      .addListener(this.copy, 'click', this._copy, this)
      .addListener(this.search, 'click', this._search, this)
      .addListener(this.cancel, 'click', this.close, this)
      .addListener(this.goTo, 'click', this._goTo, this);

    L.DomEvent.disableClickPropagation(this.coordsTool);
    L.DomEvent.disableScrollPropagation(this.coordsTool);

    this.type = 'longlat';
    this.collapse = false;
    this.searchMarker;

    map.on('mousemove', this._initCapture);
    map.coordinatesTool = this;

    return this.coordsTool;
  },
  onRemove: function(map) {
    map.off('mousemove', this._initCapture);
    delete map.coordinatesTool;
  },
  traslate: function(event) {
    if (this.type == 'longlat') {
      this.coords.style = 'min-width: 130px';
      this.searchLong.placeholder = getTextLanguage('common_longitude');
      this.searchLat.placeholder = getTextLanguage('common_latitude');
    } else if ((this.type = 'dms')) {
      this.coords.style = 'min-width: 190px';
      this.searchLong.placeholder =
        getTextLanguage('common_longitude') + ' D°M\'S"';
      this.searchLat.placeholder =
        getTextLanguage('common_latitude') + ' D°M\'S"';
    }
  }
});

L.control.coordinatesTool = function(options) {
  return new L.Control.CoordinatesTool(options);
};
*/

import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRulerVertical,
  faRulerCombined,
  faTimes,
  faRuler,
  faCrosshairs
} from '@fortawesome/free-solid-svg-icons';
import MapContext from 'src/contexts/MapContext';
import { convertDegToDms, convertDmsToDeg } from 'src/utils/functionsGeo';

const useStyles = makeStyles(theme => ({
  buttonGroup: {
    position: 'absolute',
    zIndex: 800,
    bottom: '20px',
    left: '10px'
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
  },
  coordinatesButton: {
    height: 35,
    fontWeight: 400
  }
}));

const CoordinatesTool = props => {
  const classes = useStyles();
  const [toggleGroup, setToggleGroup] = useState(false);
  const [coordinates, setCoordinates] = useState({});
  const [coordinatesText, setCoordinatesText] = useState({});
  const [typeCoordinates, setTypeCoordinates] = useState('lnglat');
  const map = useContext(MapContext);

  useEffect(() => {
    /*if (map.coordinatesTool.type == 'dms') {
      map.coordinatesTool.long.innerHTML = convertDegToDms(
        e.latlng.lng,
        'long'
      );
      map.coordinatesTool.lat.innerHTML = convertDegToDms(e.latlng.lat, 'lat');
    } else {
      map.coordinatesTool.long.innerHTML = e.latlng.lng.toFixed(5);
      map.coordinatesTool.lat.innerHTML = e.latlng.lat.toFixed(5);
    }*/
    if (map) {
      let centerMap = map.getCenter();

      setCoordinates({
        lng: centerMap.lng.toFixed(5),
        lat: centerMap.lat.toFixed(5)
      });

      map.on('click', captureClick);
      map.on('mousemove', initCapture);
    }
  }, [map]);

  useEffect(() => {
    if (typeCoordinates === 'dms') {
      setCoordinatesText({
        lng: convertDegToDms(coordinates.lng, 'long'),
        lat: convertDegToDms(coordinates.lat, 'lat')
      });
      return;
    }

    setCoordinatesText({
      lng: coordinates.lng,
      lat: coordinates.lat
    });
  }, [coordinates]);

  const openToggleGroup = () => {
    setToggleGroup(true);
  };

  const handlerTypeCoordinates = () => {
    if (typeCoordinates === 'lnglat') setTypeCoordinates('dms');
    else setTypeCoordinates('lnglat');
  };

  const captureClick = () => {
    console.log('captureClick');
    /*if (map.coordinatesTool.type == 'dms')
      copyToClipboard(
        convertDegToDms(e.latlng.lng, 'long') +
          ',' +
          convertDegToDms(e.latlng.lat, 'lat')
      );
    else
      copyToClipboard(e.latlng.lng.toFixed(5) + ',' + e.latlng.lat.toFixed(5));

    L.DomUtil.removeClass(map._container, 'crosshair-cursor-enabled');
    L.DomUtil.removeClass(map.coordinatesTool.copy, 'active');
    map.off('click', map.coordinatesTool._captureClick);

    alertSuccess(getTextLanguage('coordinates_copiedClipboard')); */ // " Coordenadas copiadas al portapapeles.");
  };

  const initCapture = e => {
    setCoordinates({
      lng: e.latlng.lng.toFixed(5),
      lat: e.latlng.lat.toFixed(5)
    });
  };

  const closeToggleGroup = () => {
    //map.measureTool.clearLayers();
    setToggleGroup(false);
  };

  /*const addMarker = latlng => {
    if (this.searchMarker) this.searchMarker.remove();

    this.searchMarker = L.marker(latlng).addTo(map);
    map.setView(this.searchMarker._latlng, 15);
  };

  const goTo = () => {
    if (this.type == 'dms')
      var latlng = checkFormatDms(this.searchLong.value, this.searchLat.value);
    else
      var latlng = checkFormatLongLat(
        this.searchLong.value,
        this.searchLat.value
      );

    let lat = this.type == 'dms' ? convertDmsToDeg(latlng[0]) : latlng[0];
    let lng = this.type == 'dms' ? convertDmsToDeg(latlng[1]) : latlng[1];

    if (latlng === false) {
      alertDanger('Formato de coordenadas invalido.');
      return;
    }

    this.addMarker([lat, lng]);
  };

  const openToggleGroup = () => {
    setToggleGroup(true);
  };

  const search = () => {
    this.searchLong.value = '';
    this.searchLat.value = '';
    L.DomUtil.removeClass(this.searchCoordsLongLat, 'd-none');
    L.DomUtil.addClass(this.coords, 'd-none');
  };

  const close = () => {
    L.DomUtil.addClass(this.searchCoordsLongLat, 'd-none');
    L.DomUtil.addClass(this.tools, 'd-none');
    L.DomUtil.removeClass(this.collapsePanelButton, 'group-menu');
    L.DomUtil.removeClass(this.coords, 'd-none');
    L.DomUtil.removeClass(this.copy, 'active');
    L.DomUtil.removeClass(map._container, 'crosshair-cursor-enabled');
    this.collapse = false;
    if (this.searchMarker) this.searchMarker.remove();
  };

  const copy = () => {
    L.DomUtil.addClass(map._container, 'crosshair-cursor-enabled');
    L.DomUtil.addClass(this.copy, 'active');
    map.on('click', this._captureClick);
  };

  const closeToggleGroup = () => {
    map.measureTool.clearLayers();
    setToggleGroup(false);
  };

  const changeType = () => {
    if (this.type == 'longlat') {
      this.type = 'dms';
      this.coords.style = 'min-width: 190px';
      this.searchLong.placeholder =
        getTextLanguage('common_longitude') + ' D°M\'S"';
      this.searchLat.placeholder =
        getTextLanguage('common_latitude') + ' D°M\'S"';
      return;
    }
    this.type = 'longlat';
    this.coords.style = 'min-width: 130px';
    this.searchLong.placeholder = getTextLanguage('common_longitude');
    this.searchLat.placeholder = getTextLanguage('common_latitude');
  };

  const collapsePanel = () => {
    if (this.collapse == true) {
      this.close();
      return;
    }
    this.collapse = true;
    L.DomUtil.removeClass(this.tools, 'd-none');
    L.DomUtil.addClass(this.collapsePanelButton, 'group-menu');
  };

  const initCapture = () => {
    if (map.coordinatesTool.type == 'dms') {
      map.coordinatesTool.long.innerHTML = convertDegToDms(
        e.latlng.lng,
        'long'
      );
      map.coordinatesTool.lat.innerHTML = convertDegToDms(e.latlng.lat, 'lat');
    } else {
      map.coordinatesTool.long.innerHTML = e.latlng.lng.toFixed(5);
      map.coordinatesTool.lat.innerHTML = e.latlng.lat.toFixed(5);
    }

    tippy('.tippyUp', { delay: [500, 0], placement: 'top' });
  };

  const captureClick = () => {
    if (map.coordinatesTool.type == 'dms')
      copyToClipboard(
        convertDegToDms(e.latlng.lng, 'long') +
          ',' +
          convertDegToDms(e.latlng.lat, 'lat')
      );
    else
      copyToClipboard(e.latlng.lng.toFixed(5) + ',' + e.latlng.lat.toFixed(5));

    L.DomUtil.removeClass(map._container, 'crosshair-cursor-enabled');
    L.DomUtil.removeClass(map.coordinatesTool.copy, 'active');
    map.off('click', map.coordinatesTool._captureClick);

    alertSuccess(getTextLanguage('coordinates_copiedClipboard')); // " Coordenadas copiadas al portapapeles.");
  };*/

  return (
    <>
      <ButtonGroup
        variant="contained"
        color="default"
        className={classes.buttonGroup}
        aria-label="contained primary button group"
      >
        <Button
          onClick={openToggleGroup}
          variant="contained"
          color="default"
          className={classes.button}
          disabled={toggleGroup}
        >
          <FontAwesomeIcon icon={faCrosshairs} />
        </Button>
        <Button
          onClick={handlerTypeCoordinates}
          variant="contained"
          color="default"
          className={classes.coordinatesButton}
        >
          {coordinatesText.lng}, {coordinatesText.lat}
        </Button>
        {toggleGroup && (
          <>
            <Button className={classes.button} disabled>
              <FontAwesomeIcon icon={faRuler} />
            </Button>
            <Button className={classes.button}>
              <FontAwesomeIcon icon={faRulerVertical} />
            </Button>
            <Button className={classes.button}>
              <FontAwesomeIcon icon={faRulerCombined} />
            </Button>
            <Button onClick={closeToggleGroup} className={classes.button}>
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </>
        )}
      </ButtonGroup>
    </>
  );
};

export default CoordinatesTool;
