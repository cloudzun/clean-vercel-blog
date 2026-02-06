const fs = require('fs')
const path = require('path')
const PNG = require('pngjs').PNG

const DIR = path.resolve(__dirname, '..', 'screenshots')
const files = fs.readdirSync(DIR).filter(f => f.startsWith('diff-') && f.endsWith('.png'))

if (files.length === 0) {
  console.error('No diff-*.png files found in screenshots/')
  process.exit(1)
}

for (const file of files) {
  const p = path.join(DIR, file)
  const data = fs.readFileSync(p)
  const img = PNG.sync.read(data)
  const { width, height } = img
  let changed = 0
  let minX = width, minY = height, maxX = 0, maxY = 0
  const colCounts = new Uint32Array(width)
  const rowCounts = new Uint32Array(height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2
      const r = img.data[idx]
      const g = img.data[idx + 1]
      const b = img.data[idx + 2]
      const a = img.data[idx + 3]
      // consider pixel changed if any channel non-zero
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        changed++
        colCounts[x]++
        rowCounts[y]++
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  const total = width * height
  const percent = (changed / total) * 100

  // find top 5 columns and rows with most changes
  const topCols = Array.from(colCounts.map((c, i) => ({ c, i }))).sort((a, b) => b.c - a.c).slice(0, 5)
  const topRows = Array.from(rowCounts.map((c, i) => ({ c, i }))).sort((a, b) => b.c - a.c).slice(0, 5)

  console.log('File:', file)
  console.log('  Size:', width, 'x', height)
  console.log('  Changed pixels:', changed, `(${percent.toFixed(3)}%)`)
  if (changed > 0) {
    console.log('  Bounding box: x=', minX, 'y=', minY, 'w=', (maxX - minX + 1), 'h=', (maxY - minY + 1))
    console.log('  Top columns with changes:', topCols.map(t => `${t.i}(${t.c})`).join(', '))
    console.log('  Top rows with changes:', topRows.map(t => `${t.i}(${t.c})`).join(', '))
  }
  console.log('')
}
