import React, { useState, useEffect, useContext } from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TipoZona from "./TipoZona";
import MapContext from "../../../contexts/mapContext";
import dataCapaBase from "../../../data/capasbase.json";
import L from "leaflet";

const useStyles = makeStyles((theme360) => ({
    labelTitle: {
        color: "#4A4A49",
        fontWeight: "bold",
        fontSize: "14px",
    },
}));

export default (props) => {
    const classes = useStyles();
    const [baseLayer, setBaseLayer] = useState([]);
    const [selectedBaseLayer, setSelectedBaseLayer] = useState([]);

    const handleChange = (event) => {
        setSelectedBaseLayer(event.target.value);
    };

    const map = useContext(MapContext);

    //console.log(map);

    useEffect(() => {
        //Axios api call to set
        setBaseLayer([
            { id: 1, name: "mp: L 20 quantile 5" },
            { id: 2, name: "mp: L 50 quantile 50" },
        ]);
    }, []);

    useEffect(() => {
        //Axios api call para traer geometrias de la capa base
        if (selectedBaseLayer.id) {
            var capabase = new L.GeoJSON(dataCapaBase);

            capabase.addTo(map);
        }
        // eslint-disable-next-line
    }, [selectedBaseLayer]);

    return (
        <div>
            <Box my={3}>
                <Typography component="label" className={classes.labelTitle}>
                    Capa base
                </Typography>
            </Box>
            <Select
                style={{ minWidth: "100%" }}
                color="primary"
                onChange={handleChange}
                value={selectedBaseLayer}
            >
                {baseLayer &&
                    baseLayer.map((row) => (
                        <MenuItem value={row} key={row.id}>
                            {row.name}
                        </MenuItem>
                    ))}
            </Select>

            {selectedBaseLayer.id && <TipoZona />}
        </div>
    );
};
