import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverEntry = path.join(__dirname, '.output', 'server', 'index.mjs')

// Safety shim: if Passenger starts app.js directly, forward to Nuxt server output.
if (fs.existsSync(serverEntry)) {
	import(pathToFileURL(serverEntry).href).catch((error) => {
		console.error('[app.js] Failed to start Nuxt server output:', error)
		process.exit(1)
	})
}

// Keep a default export so bundlers expecting one do not fail.
export default {}
