import React, { useEffect, useState, useContext, useRef } from "react";
import Icon from "@material-ui/core/Icon";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

//Componentes
import TablaTiposZona from "./TablaTiposZona";
//Context
import MapContext from "../../../contexts/mapContext";

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
    const [typeSelected, setTypeSelected] = useState([]);
    const [rows, setRows] = useState([]);
    const rowsRef = useRef(rows);
    const { ambientes } = props;

    const map = useContext(MapContext);

    const handleChange = (index) => (event) => {
        let changeRow = [...rowsRef.current];
        let selected = event.target.value;
        changeRow[index[0]][2] = iconColor(event.target.value.color);
        setRows(changeRow);
        console.log(event.target);
        //setTypeSelected(selected);

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
        console.log(typeSelected);
    }, [typeSelected]);

    useEffect(() => {
        let createSelect = (index) => {
            return (
                <Select
                    style={{ minWidth: "100%" }}
                    onChange={handleChange(index)}
                    value={typeSelected[index]}
                >
                    {ambientes.properties &&
                        ambientes.properties.map((item, index) => (
                            <MenuItem value={item} key={index}>
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
