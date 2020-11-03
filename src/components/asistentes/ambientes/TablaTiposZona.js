import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Icon from "@material-ui/core/Icon";

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

export default (props) => {
    const classes = useStyles();
    const { rows } = props;

    return (
        <div>
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead className={classes.header}>
                        <TableRow>
                            <TableCell align="center">Zona</TableCell>
                            <TableCell align="center">
                                <Icon
                                    fontSize="small"
                                    className="fa fa-palette"
                                />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.value}>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    align="center"
                                >
                                    {row.value}
                                </TableCell>
                                <TableCell align="center">
                                    <Icon
                                        fontSize="small"
                                        style={{ color: row.color }}
                                        className="fa fa-circle"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};