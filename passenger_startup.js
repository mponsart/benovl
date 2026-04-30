import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const entry = path.join(__dirname, '.output', 'server', 'index.mjs')

if (!fs.existsSync(entry)) {
  console.error('[Passenger] Build Nuxt introuvable. Lancez d\'abord: npm run build:mysql')
  process.exit(1)
}

// Le projet est en ESM (package.json: type module), on charge l'entree Nuxt en import dynamique.
import(pathToFileURL(entry).href).catch((error) => {
  console.error('[Passenger] Echec du demarrage Nuxt:', error)
  process.exit(1)
})