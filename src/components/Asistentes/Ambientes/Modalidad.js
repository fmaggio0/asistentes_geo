import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const useStyles = makeStyles(theme360 => ({
  ToggleButtonGroup: {
    width: '100%'
  },
  ToggleButton: {
    width: '50%'
  }
}));

export default props => {
  const classes = useStyles();
  const [type, setType] = useState('' || props.modalidad);
  const handleChange = (event, newType) => {
    setType(newType);
    props.onChangeModalidad(newType);
  };

  return (
    <div>
      <Box mt={2}>
        <Typography component="label" variant="subtitle2">
          Modalidad
        </Typography>
      </Box>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={type}
        onChange={handleChange}
        aria-label="text formatting"
        className={classes.ToggleButtonGroup}
      >
        <ToggleButton value="drawing" className={classes.ToggleButton}>
          Dibujo libre
        </ToggleButton>
        <ToggleButton value="layer" className={classes.ToggleButton}>
          Capa base
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};
