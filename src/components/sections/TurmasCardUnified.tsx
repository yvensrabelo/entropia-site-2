import React from 'react';
import SeletorSeriesComTurmas from './SeletorSeriesComTurmas';

const TurmasCardUnified = () => {
  return (
    <div className="w-full">
      {/* Seletor Estilo Descomplica - sem duplicação de header */}
      <SeletorSeriesComTurmas />
    </div>
  );
};

export default TurmasCardUnified;