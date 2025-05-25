const bcrypt = require('bcryptjs');

async function createAdmin() {
  const senha = 'yvens123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(senha, salt);
  
  console.log('=== ADMIN USER CREATION ===');
  console.log('CPF: 986.606.082-91');
  console.log('Password: yvens123');
  console.log('Password Hash:', hash);
  console.log('\n=== SQL COMMAND ===');
  console.log(`
INSERT INTO admins (nome, cpf, email, senha, ativo, created_at, updated_at)
VALUES (
  'Yvens Rabelo',
  '98660608291',
  'yvens@entropia.com',
  '${hash}',
  true,
  NOW(),
  NOW()
);
  `);
}

createAdmin().catch(console.error);