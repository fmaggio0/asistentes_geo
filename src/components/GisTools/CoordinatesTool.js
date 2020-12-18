import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Box from '@material-ui/core/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faCrosshairs,
  faCopy,
  faSearch,
  faShareSquare
} from '@fortawesome/free-solid-svg-icons';
import MapContext from 'src/contexts/MapContext';
import {
  convertDegToDms,
  convertDmsToDeg,
  checkFormatDms,
  checkFormatLongLat
} from 'src/utils/functionsGeo';
import L from 'leaflet';

const useStyles = makeStyles(theme => ({
  buttonGroup: {
    position: 'absolute',
    zIndex: 800,
    bottom: '20px',
    left: '10px',
    backgroundColor: theme.palette.background.paper1
  },
  button: {
    width: 35,
    height: 35,
    minWidth: 35,
    padding: 0,
    borderRadius: 0,
    '&:disabled': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
      borderRight: 'inherit !important'
    }
  },
  coordinatesButton: {
    height: 35,
    fontWeight: 400,
    borderRadius: 0
  },
  inputSearch: {
    marginLeft: 10,
    marginRight: 10,
    width: 150
  }
}));

const CoordinatesTool = props => {
  const classes = useStyles();
  const [toggleGroup, setToggleGroup] = useState(false);
  const [coordinates, setCoordinates] = useState({});
  const [coordinatesText, setCoordinatesText] = useState({});
  const [searchCoordinates, setSearchCoordinates] = useState(false);
  const [searchCoordinatesActive, setSearchCoordinatesActive] = useState(false);
  const [typeCoordinates, setTypeCoordinates] = useState('lnglat');
  const [searchLat, setSearchLat] = useState('');
  const [searchLng, setSearchLng] = useState('');
  const [searchMarker, setSearchMarker] = useState('');
  const map = useContext(MapContext);

  useEffect(() => {
    if (map) {
      let centerMap = map.getCenter();

      setCoordinates({
        lng: centerMap.lng.toFixed(5),
        lat: centerMap.lat.toFixed(5)
      });

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

  const captureClick = e => {
    if (typeCoordinates === 'dms')
      console.log(
        convertDegToDms(e.latlng.lng, 'long') +
          ',' +
          convertDegToDms(e.latlng.lat, 'lat')
      );
    else console.log(e.latlng.lng.toFixed(5) + ',' + e.latlng.lat.toFixed(5));
    L.DomUtil.removeClass(map._container, 'crosshair-cursor-enabled');
    setSearchCoordinatesActive(false);
    map.off('click', captureClick);
  };

  const initCapture = e => {
    setCoordinates({
      lng: e.latlng.lng.toFixed(5),
      lat: e.latlng.lat.toFixed(5)
    });
  };

  const closeToggleGroup = () => {
    setToggleGroup(false);
    setSearchCoordinates(false);
    if (searchMarker) searchMarker.remove();
  };

  const handlerSearch = () => {
    setSearchCoordinates(!searchCoordinates);
  };

  const copyCoordinates = () => {
    L.DomUtil.addClass(map._container, 'crosshair-cursor-enabled');
    setSearchCoordinatesActive(true);
    map.on('click', captureClick);
  };

  const goToCoordinates = e => {
    let latlng = null;
    let lat = null;
    let lng = null;

    if (typeCoordinates === 'dms') {
      latlng = checkFormatDms(searchLng, searchLat);
      lat = convertDmsToDeg(latlng[0]);
      lng = convertDmsToDeg(latlng[1]);
    } else {
      latlng = checkFormatLongLat(searchLng, searchLat);
      lat = latlng[0];
      lng = latlng[1];
    }

    if (latlng === false) {
      console.log('Formato de coordenadas invalido.');
      return;
    }

    addMarker([lat, lng]);
  };

  const addMarker = latlng => {
    let markerParams = {
      radius: 4,
      fillColor: '#245829',
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 1
    };
    if (searchMarker) searchMarker.remove();
    setSearchMarker(L.circleMarker(latlng, markerParams).addTo(map));
    map.setView(latlng, 15);
  };

  return (
    <Box className={classes.buttonGroup}>
      <Button
        onClick={openToggleGroup}
        variant="contained"
        className={classes.button}
        disabled={toggleGroup}
      >
        <FontAwesomeIcon icon={faCrosshairs} />
      </Button>
      {!searchCoordinates && (
        <Button
          onClick={handlerTypeCoordinates}
          variant="contained"
          className={classes.coordinatesButton}
        >
          {coordinatesText.lng}, {coordinatesText.lat}
        </Button>
      )}
      {searchCoordinates && (
        <>
          <Input
            placeholder={
              typeCoordinates === 'dms' ? 'Longitud D°M\'S"' : 'Longitud'
            }
            className={classes.inputSearch}
            value={searchLng}
            onChange={e => setSearchLng(e.target.value)}
          />
          <Input
            placeholder={
              typeCoordinates === 'dms' ? 'Latitud D°M\'S"' : 'Latitud'
            }
            className={classes.inputSearch}
            value={searchLat}
            onChange={e => setSearchLat(e.target.value)}
          />
          <Button
            //onClick={closeToggleGroup}
            className={classes.button}
            variant="contained"
            onClick={goToCoordinates}
          >
            <FontAwesomeIcon icon={faShareSquare} />
          </Button>
        </>
      )}
      {toggleGroup && (
        <>
          <Button
            className={classes.button}
            color={searchCoordinatesActive ? 'primary' : 'default'}
            variant="contained"
            onClick={copyCoordinates}
            style={{ borderLeft: '2px solid #000' }}
          >
            <FontAwesomeIcon icon={faCopy} />
          </Button>
          <Button
            className={classes.button}
            onClick={handlerSearch}
            color={searchCoordinates ? 'primary' : 'default'}
            variant="contained"
          >
            <FontAwesomeIcon icon={faSearch} />
          </Button>
          <Button
            onClick={closeToggleGroup}
            className={classes.button}
            variant="contained"
          >
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </>
      )}
    </Box>
  );
};

export default CoordinatesTool;
