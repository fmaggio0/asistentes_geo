import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme360) => ({
    layerName: {
        width: "100%",
    },
}));

export default (props) => {
    const classes = useStyles();
    const [name, setName] = useState("");
    const handleChange = (event) => {
        setName(event.target.value);
        props.onChangeCapa(event.target.value);
    };

    return (
        <div>
            <Box mb={3}>
                <Typography component="label" variant="subtitle2">
                    Nombre de la capa
                </Typography>
            </Box>
            <TextField
                size="small"
                className={classes.layerName}
                value={name}
                onChange={handleChange}
            />
        </div>
    );
};
