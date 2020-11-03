import React from "react";
/* Componentes */
//import Capa from "./Capa";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    next: {
        position: "absolute",
        right: "15px",
        bottom: "15px",
        float: "right",
    },
    previous: { position: "absolute", left: "15px", bottom: "15px" },
}));

export default (props) => {
    const classes = useStyles();
    return (
        <>
            <Button
                className={classes.previous}
                onClick={props.previousStep}
                disabled={props.currentStep === 1}
            >
                Atras
            </Button>
            <Button
                variant="contained"
                color="primary"
                className={classes.next}
                onClick={props.nextStep}
                disabled={props.currentStep === props.totalSteps}
            >
                Siguiente
            </Button>
        </>
    );
};
