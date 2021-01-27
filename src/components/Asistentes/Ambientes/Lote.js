import React, { useState, useContext, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import MapContext from '../../../contexts/MapContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMousePointer } from '@fortawesome/pro-light-svg-icons';

const useStyles = makeStyles(theme360 => ({
  selectLayerButton: {
    width: '100%',
    textTransform: 'inherit',
    backgroundColor: '#ffffff',
    fontSize: '10px',
    justifyContent: 'normal'
  },
  layerName: {
    width: '100%'
  },
  boxSelect: {
    display: 'flex',
    alignItems: 'center'
  }
}));

export default props => {
  const classes = useStyles();
  const [selectLayerName, setSelectLayerName] = useState('' || props.lote);
  const mapContext = useContext(MapContext);

  useEffect(() => {
    if (mapContext.state.selected.layer) {
      setSelectLayerName(
        mapContext.state.selected.layer.feature.properties.Field
      );
      props.onChangeLote(mapContext.state.selected.layer);
    } else {
      setSelectLayerName('');
    }
  }, [mapContext.state.selected.layer]);

  return (
    <div>
      <Box mt={2}>
        <Typography component="label" variant="subtitle2">
          Lote (seleccione en el mapa)
        </Typography>
      </Box>

      <Box component="div" className={classes.boxSelect}>
        <FontAwesomeIcon
          icon={faMousePointer}
          size={'1x'}
          style={{ marginRight: 10 }}
        />
        <TextField
          size="small"
          className={classes.layerName}
          value={selectLayerName}
          InputProps={{
            readOnly: true
          }}
        />
      </Box>
    </div>
  );
};
