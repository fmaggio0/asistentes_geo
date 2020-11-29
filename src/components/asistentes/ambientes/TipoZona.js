import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import TablaTiposZona from "./TablaTiposZona";

const tiposzona = [
    {
        id: 1,
        name: "Ambientes según limitantes",
        properties: [
            {
                id: 1,
                value: "A",
                color: "#b8c85a",
            },
            {
                id: 2,
                value: "Bs",
                color: "#d88a51",
            },
            {
                id: 3,
                value: "Bw",
                color: "#ae9eec",
            },
            {
                id: 4,
                value: "Cs",
                color: "#c85a61",
            },
            {
                id: 5,
                value: "Cw",
                color: "#fe9e0d",
            },
            {
                id: 6,
                value: "Cws",
                color: "#fe9e0d",
            },
        ],
    },
    {
        id: 2,
        name: "Ambientes según topo",
        properties: [
            {
                id: 1,
                value: "Alta",
                color: "#ff0000",
            },
            {
                id: 2,
                value: "Media",
                color: "#ffff00",
            },
            {
                id: 3,
                value: "Baja",
                color: "#63ff00",
            },
        ],
    },
    {
        id: 3,
        name: "Ambientes según Malezas",
        properties: [
            {
                id: 1,
                value: "Sin Maleza",
                color: "#63ff00",
            },
            {
                id: 2,
                value: "Maleza Baja",
                color: "#ffff00",
            },
            {
                id: 3,
                value: "Maleza Media",
                color: "#ffc100",
            },
            {
                id: 4,
                value: "Maleza Alta",
                color: "#ff0000",
            },
        ],
    },
];

export default (props) => {
    const [typeZones, setTypeZones] = useState([]);
    const [typeSelected, setTypeSelected] = useState([]);
    const [rows, setRows] = useState([]);

    const handleChange = (event) => {
        let properties = event.target.value.properties;

        setRows([]);
        properties.forEach((element) => {
            let iconColor = (
                <Icon
                    fontSize="small"
                    style={{ color: element.color }}
                    className="fa fa-circle"
                />
            );
            setRows((rows) => [...rows, [element.value, iconColor]]);
        });

        setTypeSelected(event.target.value);
        props.onChangeTipoZona(event.target.value);
    };

    const iconPalette = <Icon fontSize="small" className="fa fa-palette" />;

    useEffect(() => {
        //Axios call api to set
        setTypeZones(tiposzona);
    }, []);

    return (
        <div>
            <Box my={3}>
                <Typography component="label" variant="subtitle2">
                    Tipo de zona
                </Typography>
                <IconButton aria-label="plus">
                    <Icon
                        fontSize="small"
                        style={{ color: "#4A4A49" }}
                        className="fa fa-xs fa-plus"
                    />
                </IconButton>
                <IconButton aria-label="edit">
                    <Icon
                        fontSize="small"
                        style={{ color: "#4A4A49" }}
                        className="fa fa-xs fa-pen"
                    />
                </IconButton>
            </Box>
            <Select
                style={{ minWidth: "100%" }}
                onChange={handleChange}
                value={typeSelected}
            >
                {typeZones &&
                    typeZones.map((row) => (
                        <MenuItem value={row} key={row.id}>
                            {row.name}
                        </MenuItem>
                    ))}
            </Select>

            {typeSelected.properties && (
                <TablaTiposZona headers={["Zona", iconPalette]} rows={rows} />
            )}
        </div>
    );
};
