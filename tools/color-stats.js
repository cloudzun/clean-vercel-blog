const fs = require('fs')
const path = require('path')
const PNG = require('pngjs').PNG

function topColors(imgPath, bbox, limit = 10) {
  const data = fs.readFileSync(imgPath)
  const img = PNG.sync.read(data)
  const { width, height } = img
  const counts = new Map()
  for (let y = bbox.y; y < Math.min(height, bbox.y + bbox.h); y++) {
    for (let x = bbox.x; x < Math.min(width, bbox.x + bbox.w); x++) {
      const idx = (width * y + x) << 2
      const r = img.data[idx], g = img.data[idx+1], b = img.data[idx+2]
      const key = `${r},${g},${b}`
      counts.set(key, (counts.get(key)||0)+1)
    }
  }
  return Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,limit)
}

const DIR = path.resolve(__dirname, '..', 'screenshots')
const homeBbox = { x: 8, y: 12, w: 627, h: 257 }
console.log('Home bbox colors baseline:')
console.log(topColors(path.join(DIR,'home.png'), homeBbox))
console.log('Home bbox colors actual:')
console.log(topColors(path.join(DIR,'actual-home.png'), homeBbox))
