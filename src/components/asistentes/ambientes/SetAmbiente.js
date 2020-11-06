import React, { useEffect, useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";

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

export default (props) => {
    const classes = useStyles();
    const [ambiente, setAmbiente] = useState([]);
    const { ambientes } = props;
    const map = useContext(MapContext);

    const handleChange = (event) => {
        setAmbiente(event.target.value);
        console.log(event.target.value);

        map.baseLayer.on("click", function (e) {
            console.log(e.layer.setStyle());
            e.layer.setStyle({
                fillColor: event.target.value.color,
                fillOpacity: "1",
                weight: "1",
                color: "#000000",
            });
        });
    };

    return (
        <>
            <Box mb={4}>
                <Typography component="label" className={classes.labelTitle}>
                    Tipo de ambiente:
                </Typography>
            </Box>
            <Select
                style={{ minWidth: "100%" }}
                color="primary"
                onChange={handleChange}
                value={ambiente}
            >
                {ambientes &&
                    ambientes.map((row) => (
                        <MenuItem value={row} key={row.value}>
                            {row.value}
                        </MenuItem>
                    ))}
            </Select>
            <Box my={4}>
                <Typography component="label" className={classes.labelTitle}>
                    Notas:
                </Typography>
            </Box>
            <TextField style={{ minWidth: "100%" }} />
        </>
    );
};
