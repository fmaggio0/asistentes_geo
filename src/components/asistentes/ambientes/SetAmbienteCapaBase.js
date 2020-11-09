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
    const [typeSelected, setTypeSelected] = useState({
        muybaja: "",
        baja: "",
        media: "",
        alta: "",
        muyalta: "",
    });
    const [rows, setRows] = useState([]);
    const rowsRef = useRef(rows);
    const { ambientes } = props;

    const map = useContext(MapContext);

    const handleChange = (index) => (event) => {
        let changeRow = [...rowsRef.current];
        let selected = event.target.value;
        changeRow[index[0]][2] = iconColor(event.target.value.color);
        setRows(changeRow);

        //let floors = [...typeSelected];

        // Add item to it
        //floors.push(selected);

        // Set state

        setTypeSelected({
            ...typeSelected,
            [event.target.name]: event.target.value,
        });

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
            console.log(index);
            return (
                <Select
                    fullWidth
                    onChange={handleChange(index)}
                    value={typeSelected || ""}
                    name={index[2]}
                >
                    {ambientes.properties &&
                        ambientes.properties.map((item, i) => (
                            <MenuItem value={item} key={i}>
                                {item.value}
                            </MenuItem>
                        ))}
                </Select>
            );
        };

        let data = [
            ["Muy baja", createSelect([0, 1, "muybaja"]), iconColor("#000000")],
            ["Baja", createSelect([1, 2, "baja"]), iconColor("#000000")],
            ["Media", createSelect([2, 4, "media"]), iconColor("#000000")],
            ["Alta", createSelect([3, 6, "alta"]), iconColor("#000000")],
            ["Muy alta", createSelect([4, 7, "muyalta"]), iconColor("#000000")],
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
