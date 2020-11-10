import React, { useEffect, useState, useContext, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

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
    icon: {
        margin: theme360.spacing(0),
        verticalAlign: "middle",
    },
    header: {
        backgroundColor: "#e0e0e0",
    },
}));

const iconPalette = <Icon fontSize="small" className="fa fa-palette" />;
const iconColor = (color) => {
    color = color || "#000000";
    return (
        <Icon
            fontSize="small"
            style={{ color: color }}
            className="fa fa-circle"
        />
    );
};
const data = [
    { name: "muybaja", label: "Muy baja", class: 1, color: "#000000" },
    { name: "baja", label: "Baja", class: 2, color: "#000000" },
    { name: "media", label: "Media", class: 4, color: "#000000" },
    { name: "alta", label: "Alta", class: 6, color: "#000000" },
    { name: "muyalta", label: "Muy alta", class: 7, color: "#000000" },
];

export default (props) => {
    const classes = useStyles();
    const [typeSelected, setTypeSelected] = useState({
        muybaja: "",
        baja: "",
        media: "",
        alta: "",
        muyalta: "",
    });
    const [rows, setRows] = useState(data);
    const { ambientes } = props;

    const map = useContext(MapContext);

    const handleChange = (row) => (event) => {
        let selected = event.target.value;

        let copyRows = [...rows];
        let foundIndex = rows.findIndex((x) => x.name === row.name);
        copyRows[foundIndex].color = selected.color;
        setRows(copyRows);

        setTypeSelected({
            ...typeSelected,
            [row.name]: selected,
        });

        map.baseLayer.eachLayer(function (layer) {
            if (layer.feature.properties.Class === row.class) {
                layer.setStyle({
                    fillColor: selected.color,
                    fillOpacity: "1",
                    weight: "1",
                    color: "#000000",
                });
            }
        });
    };

    return (
        <>
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead className={classes.header}>
                        <TableRow>
                            <TableCell align="center">Capa base</TableCell>
                            <TableCell align="center">Zona</TableCell>
                            <TableCell align="center">{iconPalette}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    align="center"
                                >
                                    {row.label}
                                </TableCell>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    align="center"
                                >
                                    <Select
                                        fullWidth
                                        onChange={handleChange(row)}
                                        value={typeSelected[row.name] || ""}
                                        name={row.name}
                                    >
                                        {ambientes.properties &&
                                            ambientes.properties.map(
                                                (item, i) => (
                                                    <MenuItem
                                                        value={item}
                                                        key={i}
                                                    >
                                                        {item.value}
                                                    </MenuItem>
                                                )
                                            )}
                                    </Select>
                                </TableCell>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    align="center"
                                >
                                    {iconColor(row.color)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};
