import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {},
  date: {
    marginLeft: 6
  },
  media: {
    height: 500,
    backgroundPosition: 'top'
  }
}));

const EditingTools = props => {
  const classes = useStyles();

  return <></>;
};

export default EditingTools;
