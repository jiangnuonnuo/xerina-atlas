import fs from 'node:fs'
import path from 'node:path'

const publicRoot = path.resolve('docs/public')
const errors: string[] = []
const allowed = new Set(['.css', '.html', '.ico', '.jpg', '.jpeg', '.js', '.json', '.mp3', '.mp4', '.pdf', '.png', '.svg', '.vtt', '.webm', '.webp', '.woff2'])

function filesUnder(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) return filesUnder(file)
    return entry.isFile() ? [file] : []
  })
}

const files = filesUnder(publicRoot)
for (const file of files) {
  const extension = path.extname(file).toLowerCase()
  if (!allowed.has(extension)) errors.push(`${file}: 不支持的静态资源扩展名 ${extension}`)
  if (path.basename(file).includes(' ')) errors.push(`${file}: 文件名不能包含空格`)
}

const resume = path.join(publicRoot, 'resume', 'xerina-java-backend-resume.pdf')
if (!fs.existsSync(resume)) errors.push(`缺少简历下载文件 ${resume}`)

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'))
  process.exit(1)
}

console.log(`asset check passed: ${files.length} public assets`)
