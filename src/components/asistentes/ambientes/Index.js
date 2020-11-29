import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { loadCSS } from "fg-loadcss";
import Button from "@material-ui/core/Button";
import Ambientes from "./Ambientes";

import { ThemeProvider } from "@material-ui/core/styles";
import theme360 from "../../../theme/360";

const useStyles = makeStyles(() => ({
    buttonOpen: {
        position: "absolute",
        right: "10px",
        top: "10px",
        zIndex: 1000,
    },
}));

export default (props) => {
    const classes = useStyles();
    const [isOpen, setOpen] = useState(false);
    const handleClose = (value) => setOpen(value);

    const handleOpen = () => {
        setOpen(true);
    };

    /*const handleClose = () => {
        console.log("close");
        setOpen(false);
    };*/

    useEffect(() => {
        const node = loadCSS(
            "https://use.fontawesome.com/releases/v5.12.0/css/all.css",
            document.querySelector("#font-awesome-css")
        );
        return () => {
            node.parentNode.removeChild(node);
        };
    }, []);

    useEffect(() => {
        console.log("montado");
        return () => console.log("unmontado");
    }, []);

    return (
        <ThemeProvider theme={theme360}>
            <Button className={classes.buttonOpen} onClick={handleOpen}>
                Asistente de Ambientes
            </Button>
            {isOpen && <Ambientes onHandleClose={handleClose} />}
        </ThemeProvider>
    );
};
