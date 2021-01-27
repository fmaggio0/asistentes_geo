import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { featureCollection } from '@turf/helpers';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Box } from '@material-ui/core';

//Context
import MapContext from '../../../contexts/MapContext';

const useStyles = makeStyles(theme360 => ({
  labelTitle: {
    color: '#4A4A49',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  icon: {
    margin: theme360.spacing(0),
    verticalAlign: 'middle'
  },
  header: {
    backgroundColor: '#e0e0e0'
  }
}));

const iconPalette = <Icon fontSize="small" className="fa fa-palette" />;
const iconColor = color => {
  color = color || '#000000';
  return (
    <Icon fontSize="small" style={{ color: color }} className="fa fa-circle" />
  );
};

const label = (text, helperText) => {
  return (
    <>
      {text}
      <FormHelperText style={{ marginTop: '0px', textAlign: 'center' }}>
        {helperText}
      </FormHelperText>
    </>
  );
};

const data = [
  {
    name: 'muybaja',
    label: label('Muy baja', '(xx has - xx %)'),
    class: 1
  },
  {
    name: 'baja',
    label: label('Baja', '(xx has - xx %)'),
    class: 2
  },
  {
    name: 'media',
    label: label('Media', '(xx has - xx %)'),
    class: 4
  },
  {
    name: 'alta',
    label: label('Alta', '(xx has - xx %)'),
    class: 6
  },
  {
    name: 'muyalta',
    label: label('Muy alta', '(xx has - xx %)'),
    class: 7
  }
];

const download = (content, fileName, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

const types = {
  muybaja: '',
  baja: '',
  media: '',
  alta: '',
  muyalta: ''
};

export default props => {
  const classes = useStyles();
  const [typeSelected, setTypeSelected] = useState(types);
  const [rows, setRows] = useState(data);
  const { ambientes, baseLayer } = props;
  const [featureGroupAmbientes, setFeatureGroupAmbientes] = useState([]);
  const mapContext = useContext(MapContext);

  const handleChange = row => event => {
    let selected = event.target.value;

    let copyRows = [...rows];
    let foundIndex = rows.findIndex(x => x.name === row.name);
    copyRows[foundIndex].color = selected.color;
    setRows(copyRows);

    setTypeSelected({
      ...typeSelected,
      [row.name]: selected
    });

    let setAmbientesLayers = [];

    baseLayer.eachLayer(function(layer) {
      if (layer.feature.properties.Class === row.class) {
        let foundIndex = featureGroupAmbientes.findIndex(
          x => x.id === layer._leaflet_id
        );

        let properties = {};
        properties['Id tipo ambientes'] = ambientes.id;
        properties['Tipo ambiente'] = ambientes.name;
        properties['Id ambiente'] = selected.id;
        properties['Nombre ambiente'] = selected.value;
        properties['Notas'] = '';

        if (foundIndex !== -1) {
          let old = featureGroupAmbientes[foundIndex];
          let clone = [...featureGroupAmbientes];
          old.properties = properties;
          clone[foundIndex] = old;
          setFeatureGroupAmbientes(clone);
        } else {
          let layergeo = layer.toGeoJSON();
          layergeo.id = layer._leaflet_id;
          layergeo.properties = properties;
          setAmbientesLayers.push(layergeo);
        }

        layer.setStyle({
          fillColor: selected.color,
          fillOpacity: '1',
          weight: '1',
          color: '#000000'
        });
      }
    });

    const combined2 = [...setAmbientesLayers, ...featureGroupAmbientes];
    setFeatureGroupAmbientes(combined2);
  };

  const finish = () => {
    const resultBaseLayer = featureCollection(featureGroupAmbientes);
    console.log(resultBaseLayer);
    download(JSON.stringify(resultBaseLayer), 'result.geojson', 'text/plain');
  };

  return (
    <>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table className={classes.table} size={'small'}>
          <TableHead className={classes.header}>
            <TableRow>
              <TableCell align="center">Capa base</TableCell>
              <TableCell align="center">Zona</TableCell>
              <TableCell align="center">{iconPalette}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row" align="center">
                  {row.label}
                </TableCell>
                <TableCell component="th" scope="row" align="center">
                  <Select
                    fullWidth
                    onChange={handleChange(row)}
                    value={typeSelected[row.name] || ''}
                    name={row.name}
                  >
                    {ambientes.properties &&
                      ambientes.properties.map((item, i) => (
                        <MenuItem value={item} key={i}>
                          {item.value}
                        </MenuItem>
                      ))}
                  </Select>
                </TableCell>
                <TableCell component="th" scope="row" align="center">
                  {iconColor(row.color)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box my={2} display="flex" justifyContent="space-between">
        <Button onClick={() => props.onUpdateStep('init')}>Atras</Button>
        <Button variant="contained" color="primary" onClick={finish}>
          Finalizar
        </Button>
      </Box>
    </>
  );
};
