#!/usr/bin/env node
/**
 * GULF NEXT media pipeline.
 *   node scripts/media.mjs fetch      download stock originals listed in media/stock-photos.json
 *   node scripts/media.mjs optimize   write web-sized JPEG + WebP + AVIF for stock photos, and
 *                                     WebP + AVIF siblings for every other site JPEG and poster
 *   node scripts/media.mjs inventory  write media/MEDIA-INVENTORY.md and media/inventory.json
 *   node scripts/media.mjs all        all three, in order
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')
const ASSETS = join(PUBLIC, 'assets')
const ORIGINALS = join(ROOT, 'media', 'originals', 'stock')
const STOCK_OUT = join(ASSETS, 'images', 'stock')
const manifest = JSON.parse(readFileSync(join(ROOT, 'media', 'stock-photos.json'), 'utf8'))

const fresh = (src, out) => existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs

async function fetchStock() {
  mkdirSync(ORIGINALS, { recursive: true })
  for (const p of manifest.photos) {
    const out = join(ORIGINALS, `${p.name}.jpg`)
    if (existsSync(out)) continue
    const res = await fetch(`https://images.unsplash.com/photo-${p.id}?fm=jpg&q=90&w=2400&fit=max`)
    if (!res.ok) { console.log(`FAILED ${p.name}: HTTP ${res.status}`); continue }
    writeFileSync(out, Buffer.from(await res.arrayBuffer()))
    console.log(`fetched ${p.name}`)
  }
}

async function encode(input, outBase, width) {
  const img = sharp(input).rotate().resize({ width, withoutEnlargement: true })
  await img.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(`${outBase}.jpg`)
  await img.clone().webp({ quality: 74, effort: 5 }).toFile(`${outBase}.webp`)
  await img.clone().avif({ quality: 52, effort: 5 }).toFile(`${outBase}.avif`)
}

function walk(dir, exts) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    const isDir = e.isDirectory() || (e.isSymbolicLink() && statSync(p).isDirectory())
    if (isDir) out.push(...walk(p, exts))
    else if (exts.includes(extname(e.name).toLowerCase())) out.push(p)
  }
  return out
}

async function optimize() {
  mkdirSync(STOCK_OUT, { recursive: true })
  for (const p of manifest.photos) {
    const src = join(ORIGINALS, `${p.name}.jpg`)
    if (!existsSync(src)) { console.log(`missing original ${p.name}`); continue }
    if (fresh(src, join(STOCK_OUT, `${p.name}-sm.avif`))) continue
    await encode(src, join(STOCK_OUT, p.name), 1600)
    await encode(src, join(STOCK_OUT, `${p.name}-sm`), 800)
    console.log(`stock ${p.name}`)
  }
  const jpegs = [...walk(join(ASSETS, 'images'), ['.jpg']), ...walk(join(ASSETS, 'posters'), ['.jpg'])].filter((f) => !f.startsWith(STOCK_OUT))
  let n = 0
  for (const f of jpegs) {
    const base = f.slice(0, -4)
    if (fresh(f, `${base}.avif`) && fresh(f, `${base}.webp`)) continue
    await sharp(f).webp({ quality: 74, effort: 5 }).toFile(`${base}.webp`)
    await sharp(f).avif({ quality: 52, effort: 5 }).toFile(`${base}.avif`)
    n++
  }
  console.log(`${n} site JPEG(s) given WebP + AVIF siblings`)
}

function videoSize(file) {
  try {
    const out = execFileSync('mdls', ['-name', 'kMDItemPixelWidth', '-name', 'kMDItemPixelHeight', file], { encoding: 'utf8' })
    const w = out.match(/PixelWidth\s*=\s*(\d+)/)?.[1]
    const h = out.match(/PixelHeight\s*=\s*(\d+)/)?.[1]
    return w && h ? `${w}x${h}` : ''
  } catch { return '' }
}

const SOURCE_SRC = walk(join(ROOT, 'src'), ['.ts', '.tsx']).map((f) => [relative(ROOT, f), readFileSync(f, 'utf8')])

async function siteSections() {
  const map = new Map()
  const add = (url, label) => { if (!url) return; const k = url.replace(/\.(jpg|webp|avif|mp4)$/, '').replace(/-sm$/, ''); map.set(k, [...(map.get(k) ?? []), label]) }
  const { SERVICES } = await import('../src/data/services.ts')
  const { INDUSTRIES } = await import('../src/data/industries.ts')
  const { ASSETS, SECTIONS } = await import('../src/data/media.ts')
  for (const s of SERVICES) {
    add(s.image, `Homepage services grid and Services page card: ${s.title}`)
    add(s.innerImage, `Service page "${s.title}": introduction photo; related-service cards`)
    add(s.detailImage, `Service page "${s.title}": equipment panel`)
  }
  for (const i of INDUSTRIES) {
    add(i.image, `Homepage industries showcase and industry cards: ${i.title}`)
    add(i.innerImage, `Industries page sector card: ${i.title}`)
    for (const g of i.gallery) add(g.src, `Industry page "${i.title}": gallery`)
  }
  const usedBy = (key) => [
    ...Object.entries(SECTIONS).filter(([, v]) => v.assetKey === key).map(([, v]) => v.label),
    ...SERVICES.filter((s) => s.imageKey === key).map((s) => `Service page hero: ${s.title}`),
    ...INDUSTRIES.filter((i) => i.imageKey === key).map((i) => `Industry page hero: ${i.title}`),
  ]
  for (const [key, a] of Object.entries(ASSETS)) {
    const labels = usedBy(key)
    for (const u of [a.sources.hd, a.sources.sd, a.poster].map((x) => x.split('?')[0])) for (const l of labels.length ? labels : ['Catalogued, not currently used']) add(u, l)
  }
  return map
}

function referencedBy(url, sections) {
  const k = url.replace(/\.(jpg|webp|avif|mp4)$/, '').replace(/-sm$/, '')
  if (sections.has(k)) return [...new Set(sections.get(k))].join('; ')
  const hits = SOURCE_SRC.filter(([, text]) => text.includes(k)).map(([f]) => f)
  return hits.length ? hits.join(', ') : 'Not referenced (superseded; safe to remove)'
}

async function inventory() {
  const sections = await siteSections()
  const stock = new Map(manifest.photos.map((p) => [p.name, p]))
  const files = walk(ASSETS, ['.jpg', '.webp', '.avif', '.mp4', '.png'])
  const rows = []
  for (const f of files.sort()) {
    const url = '/' + relative(PUBLIC, f)
    const ext = extname(f).slice(1)
    const size = statSync(f).size
    let dims = ''
    if (ext === 'mp4') dims = videoSize(f)
    else { const m = await sharp(f).metadata(); dims = `${m.width}x${m.height}` }
    const name = basename(f).replace(/\.(jpg|webp|avif)$/, '').replace(/-sm$/, '')
    const s = url.startsWith('/assets/images/stock/') ? stock.get(name) : null
    const scene = url.includes('/videos/') || url.includes('/posters/')
    const client = /^\/assets\/images\/(services|industries|about)\//.test(url)
    rows.push({
      file: url,
      format: ext,
      dimensions: dims,
      bytes: size,
      source: s ? s.page : scene ? 'GULF NEXT cinematic scene (supplied by client)' : client ? 'Supplied by GULF NEXT (client photography)' : 'Existing project asset; origin not recorded',
      license: s ? `Unsplash License (photographer: ${s.photographer}), verified ${manifest.verifiedOn}` : scene || client ? 'Client-owned asset' : 'Unknown; confirm before publishing',
      section: s ? s.section : referencedBy(url, sections),
    })
  }
  writeFileSync(join(ROOT, 'media', 'inventory.json'), JSON.stringify({ generated: new Date().toISOString(), license: manifest.license, assets: rows }, null, 2))
  const kb = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`)
  const total = rows.reduce((a, r) => a + r.bytes, 0)
  const md = [
    '# GULF NEXT media inventory',
    '',
    `Generated by \`node scripts/media.mjs inventory\` on ${new Date().toISOString().slice(0, 10)}. ${rows.length} files, ${kb(total)} in total.`,
    '',
    `Stock photographs are used under the [${manifest.license.name}](${manifest.license.url}): ${manifest.license.summary} Each licence was checked on its Unsplash photo page on ${manifest.verifiedOn}.`,
    '',
    '| File | Format | Dimensions | Size | Source | License | Website section |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map((r) => `| ${r.file} | ${r.format} | ${r.dimensions} | ${kb(r.bytes)} | ${r.source.startsWith('http') ? `[Unsplash](${r.source})` : r.source} | ${r.license} | ${r.section} |`),
    '',
  ].join('\n')
  writeFileSync(join(ROOT, 'media', 'MEDIA-INVENTORY.md'), md)
  console.log(`inventory: ${rows.length} files, ${kb(total)}`)
}

const cmd = process.argv[2] ?? 'all'
if (cmd === 'fetch' || cmd === 'all') await fetchStock()
if (cmd === 'optimize' || cmd === 'all') await optimize()
if (cmd === 'inventory' || cmd === 'all') await inventory()
