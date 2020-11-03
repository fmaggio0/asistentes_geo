import React from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
/* Componentes */

const useStyles = makeStyles((theme360) => ({
    labelTitle: {
        color: "#4A4A49",
        fontWeight: "bold",
        fontSize: "14px",
    },
}));

export default (props) => {
    const classes = useStyles();
    return (
        <>
            <Box mb={3}>
                <Typography component="label" className={classes.labelTitle}>
                    Tipo de ambiente:
                </Typography>
            </Box>
        </>
    );
};
