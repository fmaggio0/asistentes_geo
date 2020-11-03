import React, { useEffect, useState } from "react";
/* Componentes */
import Capa from "./Capa";
import Lote from "./Lote";
import Modalidad from "./Modalidad";
import TipoZona from "./TipoZona";
import CapaBase from "./CapaBase";

export default (props) => {
    const [capa, setCapa] = useState("");
    const handlerCapa = (value) => setCapa(value);
    const [lote, setLote] = useState("");
    const handlerLote = (value) => setLote(value);
    const [modalidad, setModalidad] = useState("");
    const handlerModalidad = (value) => setModalidad(value);

    useEffect(() => {
        console.log(capa);
        console.log(lote);
        console.log(modalidad);
    });

    return (
        <>
            <Capa onChangeCapa={handlerCapa} />
            <Lote onChangeLote={handlerLote} />
            <Modalidad onClick={handlerModalidad} />
            {modalidad === "Free drawing" && <TipoZona />}
            {modalidad === "Base layer" && <CapaBase />}
        </>
    );
};
