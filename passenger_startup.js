import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Charger le fichier .env si présent (Passenger ne le charge pas automatiquement)
const envFile = path.join(__dirname, '.env')
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !(key in process.env)) process.env[key] = value
  }
}

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