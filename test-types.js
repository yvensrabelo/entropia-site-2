// Teste simples para verificar se os arrays estão sendo criados corretamente

const diasSemana = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
const diasSemanaDisplay = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

console.log('✅ Array diasSemana:', diasSemana);
console.log('✅ Array diasSemanaDisplay:', diasSemanaDisplay);
console.log('✅ Domingo incluído:', diasSemana.includes('domingo'));
console.log('✅ Domingo display incluído:', diasSemanaDisplay.includes('Domingo'));

// Teste do mapeamento entre arrays
diasSemanaDisplay.forEach((diaDisplay, index) => {
  const diaInterno = diasSemana[index];
  console.log(`✅ ${diaDisplay} -> ${diaInterno}`);
});