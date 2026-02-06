const fs = require('fs')
const path = require('path')
const PNG = require('pngjs').PNG

const DIR = path.resolve(__dirname, '..', 'screenshots')
const pairs = [
  { base: 'home.png', actual: 'actual-home.png', name: 'home' },
  { base: 'post.png', actual: 'actual-post.png', name: 'post' }
]

function analyze(basePath, actualPath, tol = 8) {
  const base = PNG.sync.read(fs.readFileSync(basePath))
  const act = PNG.sync.read(fs.readFileSync(actualPath))
  const { width, height } = base
  let count = 0
  let minX = width, minY = height, maxX = 0, maxY = 0
  const col = new Uint32Array(width)
  const row = new Uint32Array(height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2
      const br = base.data[idx], bg = base.data[idx+1], bb = base.data[idx+2]
      const ar = act.data[idx], ag = act.data[idx+1], ab = act.data[idx+2]
      const dr = Math.abs(br - ar), dg = Math.abs(bg - ag), db = Math.abs(bb - ab)
      if (dr > tol || dg > tol || db > tol) {
        count++
        col[x]++
        row[y]++
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  const bbox = count>0 ? { x: minX, y: minY, w: maxX-minX+1, h: maxY-minY+1 } : null
  const topCols = Array.from(col.map((c,i)=>({c,i}))).sort((a,b)=>b.c-a.c).slice(0,5)
  const topRows = Array.from(row.map((c,i)=>({c,i}))).sort((a,b)=>b.c-a.c).slice(0,5)
  return { count, bbox, topCols, topRows }
}

for (const p of pairs) {
  const basePath = path.join(DIR, p.base)
  const actPath = path.join(DIR, p.actual)
  if (!fs.existsSync(basePath) || !fs.existsSync(actPath)) {
    console.log('Missing pair:', p.base)
    continue
  }
  const r = analyze(basePath, actPath, 8)
  console.log(`${p.name}: pixels=${r.count} bbox=${r.bbox ? `${r.bbox.x},${r.bbox.y},${r.bbox.w}x${r.bbox.h}` : 'none'}`)
  console.log('  topCols:', r.topCols.map(t=>`${t.i}(${t.c})`).join(', '))
  console.log('  topRows:', r.topRows.map(t=>`${t.i}(${t.c})`).join(', '))
}
