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

const useStyles = makeStyles(theme => ({
  editGroup: {}
}));

const headers = [
  'Field',
  'Crop',
  'Hybrid/Variety',
  'Seeding date',
  'Surface (has)'
];

const values = [
  {
    Crop: 'Corn',
    Field: 'Land 19',
    'Seeding date': '2019-12-19',
    'Surface (has)': 35.422700377845764,
    'Hybrid/Variety': '-Not assigned-'
  },
  {
    Crop: 'Corn',
    Field: 'L 20',
    'Seeding date': '2019-12-20',
    'Surface (has)': 31.648056190228463,
    'Hybrid/Variety': '-Not assigned-'
  }
];

const DialogGroup = props => {
  //const { headers, fields } = props;
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  const createTds = item => {
    let array = [];

    values.forEach((element, i) => {
      array.push(
        <TableCell align="right" key={i}>
          {element[item]}
          <Radio
            value="a"
            name="radio-button-demo"
            inputProps={{ 'aria-label': 'A' }}
          />
        </TableCell>
      );
    });

    console.log(array);
    return array;

    /*return (
      <TableCell align="right">
        {item}
        <Radio
          value="a"
          name="radio-button-demo"
          inputProps={{ 'aria-label': 'A' }}
        />
      </TableCell>
    );*/
  };

  const tableRowItems = headers.map((item, index) => (
    <TableRow key={index}>
      <TableCell variant="head">{item}</TableCell>
      {createTds(item)}
    </TableRow>
  ));

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle disableTypography>
          <Typography variant="h4">
            ¿Desea combinar los objetos seleccionados?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Table>
            <caption>Luego se podrán cambiar las propiedades</caption>
            <TableBody>{tableRowItems}</TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="default">
            Cancelar
          </Button>
          <Button
            //onClick={confirmGroup}
            color="primary"
            variant="contained"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogGroup;
