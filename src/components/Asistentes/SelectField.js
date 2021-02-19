import React, { useState, useEffect, useContext } from 'react';
import { faHandPointer } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
/* Map Context */
import MapContext from 'src/contexts/MapContext';

const useStyles = makeStyles(theme => ({
  root: {
    padding: 0,
    paddingBottom: 10
  }
}));

const SelectField = props => {
  const classes = useStyles();
  const [field, setField] = useState(props.value || '');
  const mapContext = useContext(MapContext);

  useEffect(() => {
    if (mapContext.state.selected.layer) {
      setField(mapContext.state.selected.layer);
    } else {
      setField('');
    }
  }, [mapContext.state.selected.layer]);

  useEffect(() => {
    props.onChange(field);
  }, [field]);

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12}>
        <Typography component="label" variant="subtitle2">
          Lote (seleccione en el mapa)
        </Typography>
      </Grid>
      <Grid
        item
        xs={12}
        style={{ display: 'inline-flex', alignItems: 'flex-end' }}
      >
        <FontAwesomeIcon
          icon={faHandPointer}
          size={'lg'}
          style={{ marginRight: 10 }}
        />
        <TextField
          value={field ? field.feature.properties.Field : ''}
          InputProps={{
            readOnly: true
          }}
          fullWidth
          disabled={props.disabled}
        />
      </Grid>
    </Grid>
  );
};

export default SelectField;
