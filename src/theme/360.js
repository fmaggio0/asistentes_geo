import { createMuiTheme } from "@material-ui/core/styles";

const theme360 = createMuiTheme({
    //Generales
    palette: {
        primary: {
            main: "#36763C",
        },
        secondary: {
            main: "#f44336",
        },
        white: {
            main: "#ffffff",
        },
    },
    typography: {
        useNextVariants: true,
    },
    spacing: [0, 2, 4, 8, 16, 32],
    //Por componente
    overrides: {
        // Name of the component ⚛️
        MuiCardHeader: {
            root: {
                backgroundColor: "#36763C",
                paddingTop: "2px",
                paddingBottom: "2px",
            },
            title: {
                fontSize: "14px",
                fontWeight: 500,
                color: "white",
            },
            avatar: {
                marginRight: "0px",
            },
            content: {
                textAlign: "center",
            },
        },
        MuiTableCell: {
            root: {
                padding: "6px 10px",
                borderBottom: "0px",
            },
        },
        MuiMenuItem: {
            root: {
                fontSize: "12px",
            },
        },
        MuiSelect: {
            root: {
                fontSize: "12px",
            },
        },
        MuiInputBase: {
            root: {
                borderBottom: "1px solid #36763C",
                "&:before": {
                    borderBottom: "2px solid #36763C",
                },
                "&:after": {
                    borderBottom: "2px solid #36763C",
                },
                "&:hover:not($disabled):not($focused):not($error):before": {
                    borderBottom: "2px solid #36763C",
                },
            },
        },
        MuiToggleButton: {
            root: {
                color: "#36763C",
                fontWeight: 400,
                letterSpacing: 0,
                lineHeight: "normal",
                textTransform: "initial",
                "&$selected": {
                    color: "#FFFFFF",
                    backgroundColor: "#66966b",
                    "&$selected:hover": {
                        backgroundColor: "#66966bba",
                    },
                },
            },
        },
        MuiIconButton: {
            root: {
                padding: "8px",
            },
        },
        MuiInput: {
            root: {
                fontSize: "12px",
            },
        },
    },
});

export default theme360;
