const fs = require('fs')
const path = require('path')

const dirPath = '/Users/yvensrabelo/SITE ENTROPIA/VERSAO 0/entropia-site-2/src/app/api/professor/minutos'

try {
  fs.rmSync(dirPath, { recursive: true, force: true })
  console.log('Directory removed successfully')
} catch (error) {
  console.error('Error removing directory:', error.message)
}