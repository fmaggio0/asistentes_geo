import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core';
import Page from 'src/components/Page';
import Map from 'src/views/home/MapView/Map1';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    position: 'relative'
  }
}));

const DashboardView = () => {
  const classes = useStyles();
  const pageRef = useRef(null);

  return (
    <Page className={classes.root} title="Map" ref={pageRef}>
      <Map />
    </Page>
  );
};

export default DashboardView;
