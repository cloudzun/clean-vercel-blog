const fs = require('fs')
const path = require('path')

function convertFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const lines = text.split(/\r?\n/)
  const out = []
  let inBlock = false
  let block = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^ {4}/.test(line)) {
      // indented code line
      block.push(line.replace(/^ {4}/, ''))
      inBlock = true
    } else {
      if (inBlock) {
        // close block
        out.push('```')
        out.push(...block)
        out.push('```')
        block = []
        inBlock = false
      }
      out.push(line)
    }
  }
  if (inBlock) {
    out.push('```')
    out.push(...block)
    out.push('```')
  }
  const newText = out.join('\n')
  if (newText !== text) {
    fs.writeFileSync(filePath, newText, 'utf8')
    return true
  }
  return false
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkDir(p)
    else if (e.isFile() && p.endsWith('.md')) {
      const changed = convertFile(p)
      if (changed) console.log('Converted', p)
    }
  }
}

const contentDir = path.join(process.cwd(), 'content')
walkDir(contentDir)

console.log('Conversion complete')
