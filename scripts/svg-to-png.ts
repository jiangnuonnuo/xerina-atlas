import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'

/**
 * 将 docs 下各 assets/images 目录里的 .svg 批量转换为同名 PNG。
 * 知乎等平台不支持 SVG 渲染，需要配套提供 PNG。
 *
 * 用法：
 *   npm run svg:png                 # 只转换还没有对应 PNG 的 SVG
 *   npm run svg:png -- --force      # 忽略已有 PNG，全部重新转换
 *   npm run svg:png -- --width 1440 # 指定输出宽度（默认 1440）
 */
const outputWidth = parseInt(process.argv.find((a) => a.startsWith('--width='))?.split('=')[1] ?? '1440', 10)
const force = process.argv.includes('--force')

const root = path.resolve('docs')

function svgFilesUnder(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) return svgFilesUnder(file)
    return entry.isFile() && file.toLowerCase().endsWith('.svg') ? [file] : []
  })
}

const svgs = svgFilesUnder(root).filter((p) => p.includes(`${path.sep}assets${path.sep}images${path.sep}`))
if (svgs.length === 0) {
  console.log('svg-to-png: 未找到任何 assets/images 下的 SVG 文件')
  process.exit(0)
}

let converted = 0
let skipped = 0
const failed: string[] = []

for (const svgPath of svgs) {
  const pngPath = svgPath.replace(/\.svg$/i, '.png')
  if (!force && fs.existsSync(pngPath)) {
    skipped++
    continue
  }
  try {
    const svg = fs.readFileSync(svgPath)
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: outputWidth } })
    const png = resvg.render().asPng()
    fs.writeFileSync(pngPath, png)
    converted++
    console.log(`  ✓ ${path.relative(root, pngPath)}`)
  } catch (error) {
    failed.push(`${path.relative(root, svgPath)}: ${(error as Error).message}`)
  }
}

console.log(`\nsvg-to-png: ${converted} 转换成功, ${skipped} 跳过(已有 PNG), ${failed.length} 失败`)
if (failed.length) {
  console.error(failed.map((f) => `✗ ${f}`).join('\n'))
  process.exit(1)
}
