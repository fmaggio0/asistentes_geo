import React, { useState, useEffect, useContext } from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import MapContext from "../../../contexts/mapContext";
import dataCapaBase from "../../../data/capasbase.json";
import L from "leaflet";

function onEachFeature(feature, layer) {
    if (feature.properties) {
        layer.bindTooltip(
            function (layer) {
                return (
                    "<pre>" +
                    JSON.stringify(feature.properties, null, " ").replace(
                        /[{}"]/g,
                        ""
                    ) +
                    "</pre>"
                );
            },
            { opacity: 0.75, offset: [0, -5], direction: "top", sticky: true } //then add your options
        );
    }
}

export default (props) => {
    const [baseLayer, setBaseLayer] = useState([]);
    const [selectedBaseLayer, setSelectedBaseLayer] = useState([]);

    const handleChange = (event) => {
        setSelectedBaseLayer(event.target.value);
        props.onChangeCapabase(event.target.value);
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
            var capabase = new L.GeoJSON(dataCapaBase, {
                onEachFeature: onEachFeature,
            });
            capabase.addTo(map);
            map.baseLayer = capabase;
        }
        // eslint-disable-next-line
    }, [selectedBaseLayer]);

    return (
        <div>
            <Box my={3}>
                <Typography component="label" variant="subtitle2">
                    Capa base
                </Typography>
            </Box>
            <Select
                style={{ minWidth: "100%" }}
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
        </div>
    );
};