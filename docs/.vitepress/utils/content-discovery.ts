import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

export type ContentScope = 'projects' | 'experience' | 'notes'

export interface ContentRecord {
  slug: string
  url: string
  file: string
  frontmatter: Record<string, any>
}

const docsRoot = path.resolve(fileURLToPath(new URL('../../', import.meta.url)))

function readRecord(file: string, scope: ContentScope): ContentRecord {
  const relative = path.relative(path.join(docsRoot, scope), file)
  const parts = relative.split(path.sep)
  const slug = parts.at(-1) === 'index.md' ? parts.at(-2)! : parts.at(-1)!.replace(/\.md$/, '')
  const urlParts = parts.at(-1) === 'index.md' ? parts.slice(0, -1) : parts
  const url = `/${scope}/${urlParts.join('/')}/`.replace(/\\/g, '/')
  const parsed = matter(fs.readFileSync(file, 'utf8'))
  return { slug, url, file, frontmatter: parsed.data }
}

function walkMarkdown(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkMarkdown(target)
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : []
  })
}

export function discoverProjects(): ContentRecord[] {
  return walkMarkdown(path.join(docsRoot, 'projects'))
    .filter((file) => path.basename(file) === 'index.md' && path.dirname(file) !== path.join(docsRoot, 'projects'))
    .map((file) => readRecord(file, 'projects'))
    .filter((record) => record.frontmatter.type === 'project' && record.frontmatter.draft !== true)
    .sort((a, b) => Number(a.frontmatter.order ?? 999) - Number(b.frontmatter.order ?? 999))
}

export function discoverProjectChapters(projectSlug: string): ContentRecord[] {
  const projectDir = path.join(docsRoot, 'projects', projectSlug)
  return walkMarkdown(projectDir)
    .filter((file) => path.basename(file) !== 'index.md')
    .map((file) => readRecord(file, 'projects'))
    .filter((record) => record.frontmatter.type === 'project-chapter' && record.frontmatter.draft !== true)
    .sort((a, b) => Number(a.frontmatter.order ?? 999) - Number(b.frontmatter.order ?? 999))
}

export function discoverExperiences(): ContentRecord[] {
  return walkMarkdown(path.join(docsRoot, 'experience'))
    .filter((file) => path.basename(file) === 'index.md' && path.dirname(file) !== path.join(docsRoot, 'experience'))
    .map((file) => readRecord(file, 'experience'))
    .filter((record) => record.frontmatter.type === 'experience' && record.frontmatter.draft !== true)
    .sort((a, b) => Number(a.frontmatter.order ?? 999) - Number(b.frontmatter.order ?? 999))
}

export function discoverNotes(): ContentRecord[] {
  return walkMarkdown(path.join(docsRoot, 'notes'))
    .filter((file) => path.basename(file) !== 'index.md')
    .map((file) => readRecord(file, 'notes'))
    .filter((record) => record.frontmatter.type === 'note' && record.frontmatter.draft !== true)
    .sort((a, b) => String(b.frontmatter.date ?? '').localeCompare(String(a.frontmatter.date ?? '')))
}

export function readProfile(): Record<string, any> {
  const file = path.join(docsRoot, 'about', 'index.md')
  return matter(fs.readFileSync(file, 'utf8')).data
}
