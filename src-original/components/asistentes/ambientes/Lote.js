import React, { useState, useContext, useEffect } from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import MapContext from "../../../contexts/mapContext";

const useStyles = makeStyles((theme360) => ({
    selectLayerButton: {
        width: "100%",
        textTransform: "inherit",
        backgroundColor: "#ffffff",
        fontSize: "10px",
        justifyContent: "normal",
    },
    layerName: {
        width: "100%",
    },
    boxSelect: {
        display: "flex",
        alignItems: "center",
    },
}));

export default (props) => {
    const classes = useStyles();
    const [selectLayerName, setSelectLayerName] = useState("");
    const map = useContext(MapContext);

    useEffect(() => {
        //Mejorar...
        if (map) {
            map.on("click", function (e) {
                if (e.target.selectedLayer) {
                    setSelectLayerName(
                        e.target.selectedLayer.feature.properties.Field
                    );
                    props.onChangeLote(
                        e.target.selectedLayer.feature.properties.Field
                    );
                }
            });
        }
    }, [map]);

    return (
        <div>
            <Box my={3}>
                <Typography component="label" variant="subtitle2">
                    Lote (seleccione en el mapa)
                </Typography>
            </Box>

            <Box component="div" className={classes.boxSelect}>
                <IconButton className={classes.iconButton} aria-label="menu">
                    <Icon
                        fontSize="small"
                        style={{ color: "#4A4A49" }}
                        className="fa fa-xs fa-mouse-pointer"
                    />
                </IconButton>
                <TextField
                    size="small"
                    className={classes.layerName}
                    value={selectLayerName}
                    InputProps={{
                        readOnly: true,
                    }}
                />
            </Box>
        </div>
    );
};
