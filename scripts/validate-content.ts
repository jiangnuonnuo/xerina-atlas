import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const docsRoot = path.resolve('docs')
const errors: string[] = []

function filesUnder(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'public' && entry.name !== '.vitepress') return filesUnder(file)
    return entry.isFile() && entry.name.endsWith('.md') ? [file] : []
  })
}

const records = filesUnder(docsRoot).map((file) => ({ file, data: matter(fs.readFileSync(file, 'utf8')).data }))
const published = records.filter(({ data }) => data.draft !== true)
const urls = new Map<string, string>()

for (const { file, data } of published) {
  const relative = path.relative(docsRoot, file).replace(/\\/g, '/')
  const route = relative.endsWith('/index.md') ? `/${relative.slice(0, -'/index.md'.length)}/` : `/${relative.slice(0, -3)}`
  if (urls.has(route)) errors.push(`重复路由 ${route}: ${urls.get(route)} / ${file}`)
  urls.set(route, file)

  if (!data.title) errors.push(`${file}: 缺少 title`)
  if (data.type === 'project' && (!data.summary || !data.role || !data.category || data.layout !== 'project-doc')) errors.push(`${file}: project 需要 summary、role、category 和 layout: project-doc`)
  if (data.type === 'project-chapter' && (!data.project || !data.order || data.layout !== 'project-doc')) errors.push(`${file}: project-chapter 需要 project、order 和 layout: project-doc`)
  if (data.type === 'experience' && (!data.summary || !data.period || !data.organization || data.layout !== 'experience-detail')) errors.push(`${file}: experience 需要 summary、period、organization 和 layout: experience-detail`)
  if (data.type === 'note' && (!data.summary || !data.category || !data.date)) errors.push(`${file}: note 需要 summary、category、date`)
}

const projectSlugs = new Set(published.filter(({ data }) => data.type === 'project').map(({ file }) => path.basename(path.dirname(file))))
for (const { file, data } of published.filter(({ data }) => data.type === 'project-chapter')) {
  if (!projectSlugs.has(data.project)) errors.push(`${file}: 关联项目不存在 ${data.project}`)
}

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'))
  process.exit(1)
}

console.log(`content check passed: ${published.length} published Markdown files`)
