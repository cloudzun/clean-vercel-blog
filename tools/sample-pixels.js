const fs = require('fs')
const path = require('path')
const PNG = require('pngjs').PNG

function sample(imgPath, coords) {
  const data = fs.readFileSync(imgPath)
  const img = PNG.sync.read(data)
  const { width, height } = img
  const samples = {}
  for (const [name, [x, y]] of Object.entries(coords)) {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      samples[name] = null
      continue
    }
    const idx = (width * y + x) << 2
    const r = img.data[idx]
    const g = img.data[idx + 1]
    const b = img.data[idx + 2]
    const a = img.data[idx + 3]
    samples[name] = { x, y, r, g, b, a }
  }
  return samples
}

const DIR = path.resolve(__dirname, '..', 'screenshots')
const pairs = [
  { baseline: 'home.png', actual: 'actual-home.png' },
  { baseline: 'post.png', actual: 'actual-post.png' }
]

const coords = {
  center: [640, 450],
  topLeft: [10, 10],
  header: [200, 60],
  articleTitle: [300, 220]
}

for (const p of pairs) {
  const basePath = path.join(DIR, p.baseline)
  const actPath = path.join(DIR, p.actual)
  console.log('\nPair:', p.baseline, 'vs', p.actual)
  if (!fs.existsSync(basePath) || !fs.existsSync(actPath)) {
    console.warn('  Missing images for pair, skipping')
    continue
  }
  const baseSamples = sample(basePath, coords)
  const actSamples = sample(actPath, coords)
  for (const k of Object.keys(coords)) {
    console.log(`  Sample ${k}:`)
    console.log('    baseline:', baseSamples[k])
    console.log('    actual  :', actSamples[k])
  }
}
