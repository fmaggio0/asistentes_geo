import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import TablaTiposZona from "./TablaTiposZona";

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

const rows = [
    {
        id: 1,
        name: "Ambientes según limitantes",
        properties: [
            {
                value: "A",
                color: "#b8c85a",
            },
            {
                value: "Bs",
                color: "#d88a51",
            },
            {
                value: "Bw",
                color: "#ae9eec",
            },
            {
                value: "Cs",
                color: "#c85a61",
            },
            {
                value: "Cw",
                color: "#fe9e0d",
            },
        ],
    },
    {
        id: 2,
        name: "Ambientes según limitantes 2",
        properties: [
            {
                value: "CC",
                color: "#b3c85a",
            },
            {
                value: "Cs",
                color: "#d22a51",
            },
            {
                value: "Cw",
                color: "#ae9eec",
            },
            {
                value: "Vs",
                color: "#c82261",
            },
            {
                value: "Vw",
                color: "#fe910d",
            },
        ],
    },
    {
        id: 3,
        name: "Ambientes según limitantes 3",
        properties: [
            {
                value: "T",
                color: "#b8ceea",
            },
            {
                value: "Ts",
                color: "#d8cc51",
            },
            {
                value: "Tw",
                color: "#ae11ec",
            },
            {
                value: "Ts",
                color: "#c85a61",
            },
            {
                value: "Tw",
                color: "#fe330d",
            },
        ],
    },
];

export default (props) => {
    const classes = useStyles();
    const [typeZones, setTypeZones] = useState([]);
    const [typeSelected, setTypeSelected] = useState([]);

    const handleType = (event) => {
        setTypeSelected(event.target.value);
    };

    useEffect(() => {
        //Axios call api to set
        setTypeZones(rows);
    }, []);

    return (
        <div>
            <Box my={3}>
                <Typography component="label" className={classes.labelTitle}>
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
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                style={{ minWidth: "100%" }}
                color="primary"
                onChange={handleType}
                value={typeSelected}
            >
                {typeZones &&
                    typeZones.map((row) => (
                        <MenuItem value={row} key={row.id}>
                            {row.name}
                        </MenuItem>
                    ))}
            </Select>

            {/*tipo de zona*/}

            {typeSelected.properties && (
                <TablaTiposZona rows={typeSelected.properties} />
            )}
        </div>
    );
};
