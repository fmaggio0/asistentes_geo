import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme360) => ({
    layerName: {
        width: "100%",
    },
    labelTitle: {
        color: "#4A4A49",
        fontWeight: "bold",
        fontSize: "14px",
    },
}));

export default (props) => {
    const classes = useStyles();
    const [name, setName] = useState("");
    const handleChange = (event, newType) => {
        setName(newType);
        props.onChangeCapa(newType);
    };

    return (
        <div>
            <Box mb={3}>
                <Typography component="label" className={classes.labelTitle}>
                    Nombre de la capa
                </Typography>
            </Box>
            <TextField
                size="small"
                className={classes.layerName}
                onChange={handleChange}
                value={name}
            />
        </div>
    );
};
