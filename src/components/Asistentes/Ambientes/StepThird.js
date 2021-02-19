import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
/* Componentes */
import ByCapaBase from './ByCapaBase';
import ByDrawing from './ByDrawing';
/* Map Context */
import MapContext from '../../../contexts/MapContext';
/* Step by Step */
import StepByStepContext from 'src/contexts/StepByStepContext';
import MobileStepper from '@material-ui/core/MobileStepper';
import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons';

const download = (content, fileName, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

const StepThird = props => {
  const mapContext = useContext(MapContext);
  const {
    totalStep,
    activeStep,
    handleBack,
    sharedData,
    handleComplete
  } = useContext(StepByStepContext);
  const [result, setResult] = useState(null);

  const onComplete = () => {
    let result1 = result;
    if (sharedData.mode === 'drawing') {
      let foundLayerGroup = mapContext.state.vectorLayers.find(
        e => e.name === 'drawAmbientes'
      );
      result1 = foundLayerGroup.layer.toGeoJSON();
    }
    console.log(result1);
    download(JSON.stringify(result1), 'result.geojson', 'text/plain');

    handleComplete();
  };

  const onResult = data => {
    setResult(data);
  };

  const onBack = () => {
    handleBack();
  };

  return (
    <>
      {sharedData.mode === 'drawing' && (
        <>
          <ByDrawing
            ambientes={sharedData.tipoZona}
            lote={sharedData.field}
            result={onResult}
          />
        </>
      )}
      {sharedData.mode === 'layer' && (
        <>
          <ByCapaBase
            ambientes={sharedData.tipoZona}
            baseLayer={
              mapContext.state.vectorLayers.find(
                element => element.name === 'ambientes_capa_base'
              ).layer
            }
            result={onResult}
          />
        </>
      )}
      <MobileStepper
        variant="dots"
        steps={totalStep}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={onComplete}
            /*disabled={
              !tipoZona ||
              (props.data.mode === 'layer' ? !selectedBaseLayer : false)
            }*/
          >
            Finalizar
          </Button>
        }
        backButton={
          <Button size="small" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 5 }} />
            Atras
          </Button>
        }
      />
    </>
  );
};

export default StepThird;
