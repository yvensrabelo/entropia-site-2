import React from 'react';
import './StudentCards.css';

const StudentCards = () => {
  return (
    <div className="student-images-column">
      {/* 1º - LUCCA */}
      <img 
        src="/images/lucca-beulch.png" 
        alt="Lucca Beulch - Equipe de Elite" 
        className="student-image"
      />
      
      {/* 2º - EDUARDA */}
      <img 
        src="/images/eduarda-braga.png" 
        alt="Eduarda Braga - Reconhecimento Facial" 
        className="student-image"
      />
      
      {/* 3º - GABRIELA */}
      <img 
        src="/images/gabriela-parente.png" 
        alt="Gabriela Parente - Sala de Estudos" 
        className="student-image"
      />
    </div>
  );
};

export default StudentCards;