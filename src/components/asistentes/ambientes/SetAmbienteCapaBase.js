import React, { useEffect, useState, useContext, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

//Componentes
import TablaTiposZona from "./TablaTiposZona";
//Context
import MapContext from "../../../contexts/mapContext";

const useStyles = makeStyles((theme360) => ({
    labelTitle: {
        color: "#4A4A49",
        fontWeight: "bold",
        fontSize: "14px",
    },
}));

const iconPalette = <Icon fontSize="small" className="fa fa-palette" />;
const iconColor = (color) => {
    return (
        <Icon
            fontSize="small"
            style={{ color: color }}
            className="fa fa-circle"
        />
    );
};

export default (props) => {
    const classes = useStyles();
    const [ambiente, setAmbiente] = useState([]);
    const [select, setSelect] = useState([]);
    const [rows, setRows] = useState([]);
    const rowsRef = useRef(rows);
    const { ambientes } = props;

    const map = useContext(MapContext);

    const handleChange = (index) => (event) => {
        let changeRow = [...rowsRef.current];
        changeRow[index[0]][2] = iconColor(event.target.value.color);
        setRows(changeRow);

        map.baseLayer.eachLayer(function (layer) {
            if (layer.feature.properties.Class === index[1]) {
                layer.setStyle({
                    fillColor: event.target.value.color,
                    fillOpacity: "1",
                    weight: "1",
                    color: "#000000",
                });
            }
        });
    };

    useEffect(() => {
        let createSelect = (index) => {
            return (
                <Select
                    style={{ minWidth: "100%" }}
                    onChange={handleChange(index)}
                    //value={typeSelected}
                >
                    {ambientes.properties &&
                        ambientes.properties.map((item) => (
                            <MenuItem value={item} key={item.value}>
                                {item.value}
                            </MenuItem>
                        ))}
                </Select>
            );
        };

        let data = [
            ["Muy baja", createSelect([0, 1]), iconColor("#000000")],
            ["Baja", createSelect([1, 2]), iconColor("#000000")],
            ["Media", createSelect([2, 4]), iconColor("#000000")],
            ["Alta", createSelect([3, 6]), iconColor("#000000")],
            ["Muy alta", createSelect([4, 7]), iconColor("#000000")],
        ];

        rowsRef.current = data;
        setRows(data);
    }, []);

    return (
        <>
            <TablaTiposZona
                headers={["Capa base", "Zona", iconPalette]}
                rows={rows}
            />
        </>
    );
};
