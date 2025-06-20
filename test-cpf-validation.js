// Teste de validação de CPF
const validarCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  
  // Verificar se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cpf)) return false
  
  // Validação dos dígitos verificadores
  let soma = 0
  let resto
  
  // Valida primeiro dígito
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.substring(9, 10))) return false
  
  // Valida segundo dígito  
  soma = 0
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.substring(10, 11))) return false
  
  return true
}

// Testar alguns CPFs
const cpfsTeste = [
  '123.456.789-09',  // CPF válido comum para testes
  '111.111.111-11',  // Todos dígitos iguais (inválido)
  '123.456.789-10',  // CPF inválido
  '529.982.247-25',  // CPF válido aleatório
]

console.log('=== TESTE DE VALIDAÇÃO DE CPF ===')
cpfsTeste.forEach(cpf => {
  console.log(`CPF: ${cpf} → ${validarCPF(cpf) ? 'VÁLIDO' : 'INVÁLIDO'}`)
})

// Para executar no console do navegador:
// 1. Copie este código
// 2. Cole no console do navegador
// 3. Veja os resultados da validação