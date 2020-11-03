import React from "react";
import StepWizard from "react-step-wizard";

/* Componentes */
import PreviousNextNav from "../../common/PreviousNextNav";
import Step1 from "./Step1";
import Step2 from "./Step2";

import { makeStyles } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/core/styles";
import theme360 from "../../../theme/360";
import { loadCSS } from "fg-loadcss";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";

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
}));

export default (props) => {
    const classes = useStyles();
    //const map = useContext(MapContext);

    React.useEffect(() => {
        const node = loadCSS(
            "https://use.fontawesome.com/releases/v5.12.0/css/all.css",
            document.querySelector("#font-awesome-css")
        );

        return () => {
            node.parentNode.removeChild(node);
        };
    }, []);

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
                    <StepWizard nav={<PreviousNextNav />}>
                        <Step1 />
                        <Step2 />
                    </StepWizard>
                </CardContent>
            </Card>
        </ThemeProvider>
    );
};
