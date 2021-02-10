import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/pro-solid-svg-icons';
import { faPalette } from '@fortawesome/pro-light-svg-icons';

const useStyles = makeStyles(theme => ({
  header: {
    backgroundColor: '#e0e0e0'
  }
}));

const tiposzona = [
  {
    id: 1,
    name: 'Ambientes según limitantes',
    properties: [
      {
        id: 1,
        value: 'A',
        color: '#b8c85a'
      },
      {
        id: 2,
        value: 'Bs',
        color: '#d88a51'
      },
      {
        id: 3,
        value: 'Bw',
        color: '#ae9eec'
      },
      {
        id: 4,
        value: 'Cs',
        color: '#c85a61'
      },
      {
        id: 5,
        value: 'Cw',
        color: '#fe9e0d'
      },
      {
        id: 6,
        value: 'Cws',
        color: '#fe9e0d'
      }
    ]
  },
  {
    id: 2,
    name: 'Ambientes según topo',
    properties: [
      {
        id: 1,
        value: 'Alta',
        color: '#ff0000'
      },
      {
        id: 2,
        value: 'Media',
        color: '#ffff00'
      },
      {
        id: 3,
        value: 'Baja',
        color: '#63ff00'
      }
    ]
  },
  {
    id: 3,
    name: 'Ambientes según Malezas',
    properties: [
      {
        id: 1,
        value: 'Sin Maleza',
        color: '#63ff00'
      },
      {
        id: 2,
        value: 'Maleza Baja',
        color: '#ffff00'
      },
      {
        id: 3,
        value: 'Maleza Media',
        color: '#ffc100'
      },
      {
        id: 4,
        value: 'Maleza Alta',
        color: '#ff0000'
      }
    ]
  }
];

const iconPalette = <FontAwesomeIcon icon={faPalette} />;
const headers = ['Zona', iconPalette];

export default props => {
  const classes = useStyles();
  const [typeZones, setTypeZones] = useState([]);
  const [typeSelected, setTypeSelected] = useState([]);
  const [rows, setRows] = useState([]);

  const handleChange = event => {
    setRows([]);
    setRowsFunction(event.target.value.properties);
    setTypeSelected(event.target.value);
    props.onChangeTipoZona(event.target.value);
  };

  const setRowsFunction = data => {
    data.forEach(element => {
      let iconColor = (
        <FontAwesomeIcon icon={faCircle} style={{ color: element.color }} />
      );
      setRows(rows => [...rows, [element.value, iconColor]]);
    });
  };

  useEffect(() => {
    //Axios call api to set
    setTypeZones(tiposzona);
    if (props.tipozona) {
      setTypeSelected(props.tipozona);
      setRowsFunction(props.tipozona.properties);
    }
  }, []);

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12}>
        <Typography component="label" variant="subtitle2">
          Tipo de zona
        </Typography>
      </Grid>
      {/*<IconButton aria-label="plus">
          <Icon
            fontSize="small"
            style={{ color: '#4A4A49' }}
            className="fa fa-xs fa-plus"
          />
        </IconButton>
        <IconButton aria-label="edit">
          <Icon
            fontSize="small"
            style={{ color: '#4A4A49' }}
            className="fa fa-xs fa-pen"
          />
        </IconButton>*/}
      <Grid item xs={12}>
        <Select
          style={{ minWidth: '100%' }}
          onChange={handleChange}
          value={typeSelected}
        >
          {typeZones &&
            typeZones.map(row => (
              <MenuItem value={row} key={row.id}>
                {row.name}
              </MenuItem>
            ))}
        </Select>
      </Grid>

      {typeSelected.properties && (
        <Grid item xs={12}>
          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table className={classes.table} size="small">
              <TableHead className={classes.header}>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableCell align="center" key={index}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    {row.map((cell, i) => (
                      <TableCell
                        component="td"
                        scope="row"
                        align="center"
                        key={i}
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Grid>
  );
};
