import React, { useState } from "react";

/* Componentes */
import PreviousNextNav from "../../common/PreviousNextNav";
import Capa from "./Capa";
import Lote from "./Lote";
import Modalidad from "./Modalidad";
import TipoZona from "./TipoZona";
import CapaBase from "./CapaBase";
import SetAmbienteCapaBase from "./SetAmbienteCapaBase";
import SetAmbienteDrawing from "./SetAmbienteDrawing";

import { makeStyles } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/core/styles";
import theme360 from "../../../theme/360";
import { loadCSS } from "fg-loadcss";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme360) => ({
    root: {
        position: "absolute",
        right: "10px",
        top: "10px",
        zIndex: 1000,
        minHeight: "440px",
        width: "300px",
        backgroundColor: "#e9ecef",
    },
    content: {
        marginBottom: "45px",
        minHeight: "inherit",
    },
    cancel: {
        marginTop: "0px",
    },
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
    const data = useState([]);
    //const map = useContext(MapContext);
    const [step, setStep] = useState("init");
    const handlerCurrentStep = (value) => setStep(value);
    const [totalSteps, setTotalSteps] = useState(2);
    const [capa, setCapa] = useState("");
    const handlerCapa = (value) => setCapa(value);
    const [lote, setLote] = useState("");
    const handlerLote = (value) => setLote(value);
    const [modalidad, setModalidad] = useState("");
    const handlerModalidad = (value) => setModalidad(value);
    const [capabase, setCapabase] = useState("");
    const handlerCapabase = (value) => setCapabase(value);
    const [tipoZona, setTipoZona] = useState("");
    const handlerTipoZona = (value) => setTipoZona(value);

    React.useEffect(() => {
        const node = loadCSS(
            "https://use.fontawesome.com/releases/v5.12.0/css/all.css",
            document.querySelector("#font-awesome-css")
        );
        return () => {
            node.parentNode.removeChild(node);
        };
    }, []);

    const body = (step) => {
        switch (step) {
            case "init":
                return (
                    <>
                        <Capa onChangeCapa={handlerCapa} />
                        <Lote onChangeLote={handlerLote} />
                        <Modalidad onClick={handlerModalidad} />
                        {modalidad === "layer" && (
                            <CapaBase onChangeCapabase={handlerCapabase} />
                        )}
                        {(modalidad === "drawing" || capabase.id) && (
                            <TipoZona onChangeTipoZona={handlerTipoZona} />
                        )}
                    </>
                );
            case "setAmbienteDrawing":
                console.log("asd");
                return (
                    <>
                        <SetAmbienteDrawing ambientes={tipoZona} />
                    </>
                );
            case "setAmbienteCapaBase":
                return (
                    <>
                        <SetAmbienteCapaBase ambientes={tipoZona} />
                    </>
                );
            default:
                break;
        }
    };

    const nextStep = () => {
        if (modalidad === "layer") {
            setStep("setAmbienteCapaBase");
        }

        if (modalidad === "drawing") {
            setStep("setAmbienteDrawing");
        }
    };

    const previousStep = () => {
        setStep("init");
    };

    return (
        <ThemeProvider theme={theme360}>
            <Card id="ambientes" className={classes.root}>
                <CardHeader
                    classes={{ action: classes.cancel }}
                    action={
                        <IconButton aria-label="settings">
                            <Icon
                                fontSize="small"
                                style={{ color: "#ffffff" }}
                                className="fa fa-times-circle"
                            />
                        </IconButton>
                    }
                    title={"Asistente de Ambientes"}
                />
                <CardContent className={classes.content}>
                    {body(step)}
                    <Button
                        className={classes.previous}
                        onClick={previousStep}
                        disabled={step === "init"}
                    >
                        Atras
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.next}
                        onClick={nextStep}
                        disabled={step !== "init"}
                    >
                        Siguiente
                    </Button>

                    {/*<PreviousNextNav
                        currentStep={step}
                        totalSteps={totalSteps}
                        handlerStep={handlerCurrentStep}
                    />*/}
                </CardContent>
            </Card>
        </ThemeProvider>
    );
};
