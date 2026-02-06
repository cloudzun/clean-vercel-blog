const fs = require('fs')
const path = require('path')
const PNG = require('pngjs').PNG
const pixelmatch = require('pixelmatch').default || require('pixelmatch')

const DIR = path.resolve(__dirname, '..', 'screenshots')
const pairs = [
  { base: 'home.png', actual: 'actual-home.png', name: 'home' },
  { base: 'post.png', actual: 'actual-post.png', name: 'post' }
]

function analyze(basePath, actualPath) {
  const base = PNG.sync.read(fs.readFileSync(basePath))
  const act = PNG.sync.read(fs.readFileSync(actualPath))
  const { width, height } = base
  const diff = new PNG({ width, height })
  const mismatched = pixelmatch(base.data, act.data, diff.data, width, height, { threshold: 0.1 })
  // analyze diff pixels
  let minX = width, minY = height, maxX = 0, maxY = 0, count = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2
      const r = diff.data[idx]
      const g = diff.data[idx+1]
      const b = diff.data[idx+2]
      const a = diff.data[idx+3]
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        count++
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  const bbox = count>0 ? { x: minX, y: minY, w: maxX-minX+1, h: maxY-minY+1 } : null
  return { mismatched, count, bbox }
}

for (const p of pairs) {
  const basePath = path.join(DIR, p.base)
  const actPath = path.join(DIR, p.actual)
  if (!fs.existsSync(basePath) || !fs.existsSync(actPath)) {
    console.log('Missing pair:', p.base, p.actual)
    continue
  }
  const res = analyze(basePath, actPath)
  console.log(`${p.name}: mismatched=${res.mismatched} pixels=${res.count} bbox=${res.bbox ? `${res.bbox.x},${res.bbox.y},${res.bbox.w}x${res.bbox.h}` : 'none'}`)
}
