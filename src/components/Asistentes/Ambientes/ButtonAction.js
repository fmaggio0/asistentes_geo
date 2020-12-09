import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Ambientes from './Ambientes';

const useStyles = makeStyles(() => ({
  buttonOpen: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    zIndex: 1000
  }
}));

export default props => {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(false);
  const handleClose = value => setOpen(value);

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Button
        className={classes.buttonOpen}
        onClick={handleOpen}
        color="primary"
        variant="contained"
      >
        Asistente de Ambientes
      </Button>
      {isOpen && <Ambientes onHandleClose={handleClose} />}
    </>
  );
};
