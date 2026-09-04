// media-optimize.ts —— 媒体资源瘦身脚本
//
// 规则:
//  1. brand/xerina-avatar.png       头像/favicon: 原位压缩为 128px PNG (favicon 需 PNG)
//  2. media 下 *-cover.png 与 media/portfolio/*.png   封面/作品卡图: → WebP q80 (max 1200px)
//  3. pets 下的 *.webp              宠物雪碧图: 有损重压缩, 若收益 >=20% 才替换
//
// 用法:
//  npm run media:optimize         执行
//  npm run media:optimize:check   仅 dry-run 报告 (不写文件)
//
// 说明: 转换后若体积收益 <15% 则保留原文件; 封面/作品图转 WebP 后需同步
//       迁移 .png → .webp 引用 (脚本会打印需要迁移的文件清单)。
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const publicRoot = path.resolve('docs/public')
const dryRun = process.argv.includes('--dry-run')

const WEBP_MAX_WIDTH = 1200
const COVER_QUALITY = 80
const SPRITE_QUALITY = 84
const MIN_GAIN_RATIO = 0.15
const SPRITE_MIN_GAIN_RATIO = 0.2
const AVATAR_SIZE = 128

interface Outcome {
  file: string
  before: number
  after: number
  action: 'webp' | 'png-resize' | 'sprite' | 'keep'
  ref?: string
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : []
  })
}

function toPosix(file: string) {
  return file.split(path.sep).join('/')
}

async function main() {
  const files = walk(publicRoot)
  const outcomes: Outcome[] = []
  let totalBefore = 0
  let totalAfter = 0

  for (const file of files) {
    const rel = toPosix(path.relative(publicRoot, file))
    const ext = path.extname(rel).toLowerCase()
    if (ext !== '.png' && ext !== '.webp') continue // 只处理图片
    const size = fs.statSync(file).size
    if (size === 0) continue
    const base = path.basename(rel)
    const inDiagrams = /(^|\/)diagrams\//.test(rel)

    try {
      const image = sharp(file)
      await image.metadata()

      // 1) 头像/favicon: 原位 PNG 压缩 (128px)
      if (rel === 'brand/xerina-avatar.png') {
        const buf = await image
          .rotate()
          .resize({ width: AVATAR_SIZE, withoutEnlargement: true })
          .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 })
          .toBuffer()
        const gain = 1 - buf.length / size
        totalBefore += size
        totalAfter += gain >= MIN_GAIN_RATIO ? buf.length : size
        outcomes.push({ file, before: size, after: gain >= MIN_GAIN_RATIO ? buf.length : size, action: gain >= MIN_GAIN_RATIO ? 'png-resize' : 'keep' })
        if (!dryRun && gain >= MIN_GAIN_RATIO) await fs.promises.writeFile(file, buf)
        continue
      }

      // 2) 封面 / 作品卡图 → WebP
      const isCover = ext === '.png' && base.endsWith('-cover.png') && rel.startsWith('media/') && !inDiagrams
      const isPortfolio = ext === '.png' && /(^|\/)portfolio\/[^/]+\.png$/.test(rel) && rel.startsWith('media/') && !inDiagrams
      if (isCover || isPortfolio) {
        const webp = await image
          .rotate()
          .resize({ width: WEBP_MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: COVER_QUALITY, effort: 6 })
          .toBuffer()
        const gain = 1 - webp.length / size
        const target = file.replace(/\.png$/i, '.webp')
        totalBefore += size
        if (gain >= MIN_GAIN_RATIO) {
          totalAfter += webp.length
          outcomes.push({ file, before: size, after: webp.length, action: 'webp', ref: target })
          if (!dryRun) {
            await fs.promises.writeFile(target, webp)
            await fs.promises.unlink(file)
          }
        } else {
          totalAfter += size
          outcomes.push({ file, before: size, after: size, action: 'keep' })
        }
        continue
      }

      // 3) 宠物雪碧图: 有损重压缩
      if (ext === '.webp' && /(^|\/)pets\//.test(rel)) {
        const buf = await image.rotate().webp({ quality: SPRITE_QUALITY, effort: 6 }).toBuffer()
        const gain = 1 - buf.length / size
        totalBefore += size
        totalAfter += gain >= SPRITE_MIN_GAIN_RATIO ? buf.length : size
        outcomes.push({ file, before: size, after: gain >= SPRITE_MIN_GAIN_RATIO ? buf.length : size, action: gain >= SPRITE_MIN_GAIN_RATIO ? 'sprite' : 'keep' })
        if (!dryRun && gain >= SPRITE_MIN_GAIN_RATIO) await fs.promises.writeFile(file, buf)
      }
    } catch (error) {
      console.warn(`✗ 处理失败 ${rel}: ${(error as Error).message}`)
    }
  }

  console.log(`\n== 媒体瘦身报告 (${dryRun ? 'dry-run, 未写文件' : '已执行'}) ==`)
  for (const o of outcomes.sort((a, b) => b.before - a.before)) {
    const pct = ((1 - o.after / o.before) * 100).toFixed(0)
    const label =
      o.action === 'webp' ? `PNG→WebP -${pct}%` : o.action === 'png-resize' ? `PNG压缩 -${pct}%` : o.action === 'sprite' ? `WebP重压 -${pct}%` : '保留(收益不足)'
    console.log(`${o.action === 'keep' ? ' · ' : ' ✓ '} ${String(Math.round(o.before / 1024)).padStart(5)}KB → ${String(Math.round(o.after / 1024)).padStart(4)}KB  ${label}  ${toPosix(path.relative(publicRoot, o.file))}`)
  }
  console.log(`\n合计: ${(totalBefore / 1024 / 1024).toFixed(2)}MB → ${(totalAfter / 1024 / 1024).toFixed(2)}MB (省 ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`)

  const migrate = outcomes.filter((o) => o.action === 'webp').map((o) => `${toPosix(path.relative(publicRoot, o.file))} → ${toPosix(path.relative(publicRoot, o.ref!))}`)
  if (migrate.length) {
    console.log(`\n需要迁移引用(.png → .webp):`)
    for (const m of migrate) console.log(`  ${m}`)
  }
  if (dryRun) console.log('\n(dry-run 模式: 以上为预测结果)')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
