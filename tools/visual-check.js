const { spawn } = require('child_process')
const http = require('http')
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-core')
const PNG = require('pngjs').PNG
const pixelmatch = require('pixelmatch').default || require('pixelmatch')

const PORT = process.env.PORT || 3000
const HOST = `http://localhost:${PORT}`
const BASELINE_DIR = path.resolve(__dirname, '..', 'screenshots')
const OUTPUT_DIR = BASELINE_DIR

function waitForServer(timeout = 30000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(HOST, res => resolve(), err => {
        if (Date.now() - start > timeout) return reject(new Error('Server start timeout'))
        setTimeout(check, 500)
      }).on('error', () => {
        if (Date.now() - start > timeout) return reject(new Error('Server start timeout'))
        setTimeout(check, 500)
      })
    }
    check()
  })
}

async function capture(pagePath, outName, browser) {
  const url = `${HOST}${pagePath}`
  const page = await browser.newPage()
  // Optionally disable JavaScript for deterministic captures
  if (process.env.DISABLE_JS) {
    try { await page.setJavaScriptEnabled(false) } catch (e) {}
  }
  await page.setViewport({ width: 1280, height: 900 })
  // inject pre-document script to prefer light theme before client scripts run
  try {
    await page.evaluateOnNewDocument(() => {
      try { localStorage.setItem('theme', 'light') } catch(e){}
      try { localStorage.setItem('color-scheme', 'light') } catch(e){}
      try { localStorage.setItem('preferred-theme', 'light') } catch(e){}
      try { document.documentElement.classList.remove('dark') } catch(e){}
      // insert a small style to bias towards light background early
      const s = document.createElement('style')
      s.textContent = 'html,body{background:#ffffff !important;color:#000000 !important} *{background-color:transparent !important}'
      document.head && document.head.appendChild(s)
    })
  } catch (e) {}
  // force light color scheme to match baseline screenshots
  try {
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
  } catch (e) {
    // ignore if not supported
  }
  await page.goto(url, { waitUntil: 'networkidle2' })
  // Ensure light-mode rendering: wait for scripts, then remove any `dark` class and set background var
  try {
    await page.waitForTimeout(600)
    await page.evaluate(() => {
      try { document.documentElement.classList.remove('dark') } catch(e){}
      try { document.documentElement.style.setProperty('--bg', '#ffffff') } catch(e){}
      try { document.body.style.background = '#ffffff' } catch(e){}
    })
    // allow styles to reflow after changes
    await page.waitForTimeout(120)
  } catch (e) {}
  // ensure final reflow
  try { await page.waitForTimeout(60) } catch(e) {}
  const outPath = path.join(OUTPUT_DIR, outName)
  await page.screenshot({ path: outPath, fullPage: true })
  await page.close()
  return outPath
}

function compare(imgAPath, imgBPath, diffPath) {
  if (!fs.existsSync(imgAPath) || !fs.existsSync(imgBPath)) {
    console.warn('Baseline or actual image missing:', imgAPath, imgBPath)
    return false
  }
  const imgA = PNG.sync.read(fs.readFileSync(imgAPath))
  const imgB = PNG.sync.read(fs.readFileSync(imgBPath))
  const { width, height } = imgA
  const diff = new PNG({ width, height })
  const mismatched = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 })
  fs.writeFileSync(diffPath, PNG.sync.write(diff))
  return mismatched
}

async function main() {
  console.log('Starting visual check: will run `npm run dev` and compare screenshots')

  let dev = null
  if (!process.env.SKIP_DEV) {
    dev = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], { stdio: 'inherit' })
  } else {
    console.log('SKIP_DEV is set — not starting dev server from this script')
  }

  try {
    await waitForServer(45000)
  } catch (e) {
    console.error('Dev server did not start:', e.message)
    if (dev) dev.kill('SIGINT')
    process.exit(1)
  }

  // Use system Chromium; allow override with PUPPETEER_EXECUTABLE_PATH
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
  const browser = await puppeteer.launch({ executablePath, args: ['--no-sandbox', '--disable-setuid-sandbox'] })

  const targets = [
    { path: '/', baseline: 'home.png', actual: 'actual-home.png', diff: 'diff-home.png' },
    { path: '/posts/my-first-post', baseline: 'post.png', actual: 'actual-post.png', diff: 'diff-post.png' }
  ]

  for (const t of targets) {
    console.log('Capturing', t.path)
    const actualPath = await capture(t.path, t.actual, browser)
    const baselinePath = path.join(BASELINE_DIR, t.baseline)
    const diffPath = path.join(OUTPUT_DIR, t.diff)
    const mismatched = compare(baselinePath, actualPath, diffPath)
    console.log(`${t.path} -> mismatched pixels: ${mismatched}`)
  }

  await browser.close()
  if (dev) dev.kill('SIGINT')
  console.log('Visual check finished; diffs in', OUTPUT_DIR)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
