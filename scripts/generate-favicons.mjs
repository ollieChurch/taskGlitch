/**
 * Generate PNG favicon/icon fallbacks from favicon.svg
 * Run: node scripts/generate-favicons.mjs
 * Requires: sharp (devDependency)
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '..', 'public')
const svgPath = resolve(publicDir, 'favicon.svg')

// Read SVG source — render at high res then resize for quality
const svgBuffer = readFileSync(svgPath)

const sizes = [
	{ name: 'favicon-32x32.png', size: 32 },
	{ name: 'apple-touch-icon.png', size: 180 },
	{ name: 'icon-192.png', size: 192 },
	{ name: 'icon-512.png', size: 512 }
]

for (const { name, size } of sizes) {
	// Render SVG at target size with high density for crisp output
	const renderSize = Math.max(size, 512) // render at least 512 for quality
	await sharp(svgBuffer, { density: Math.round((renderSize / 32) * 72) })
		.resize(size, size, { fit: 'contain', background: { r: 10, g: 14, b: 23, alpha: 1 } })
		.png()
		.toFile(resolve(publicDir, name))

	console.log(`  ✓ ${name} (${size}×${size})`)
}

console.log('\nDone — PNG favicons generated in public/')
