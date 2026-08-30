const externalUrlPattern = /^[a-z][a-z\d+.-]*:/i

export function relativeUrl(target: string, currentPath: string) {
  if (!target || target.startsWith('#') || target.startsWith('?') || target.startsWith('//') || externalUrlPattern.test(target)) return target
  if (!target.startsWith('/')) return target

  const match = target.match(/^([^?#]*)(.*)$/)
  const targetPath = match?.[1] || '/'
  const suffix = match?.[2] || ''
  const cleanCurrent = (currentPath.split(/[?#]/, 1)[0] || '/').replace(/^\/+/, '')
  const currentSegments = cleanCurrent.split('/').filter(Boolean)
  const currentDirectory = currentPath.endsWith('/') ? currentSegments : currentSegments.slice(0, -1)
  const targetSegments = targetPath.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)

  let shared = 0
  while (shared < currentDirectory.length && shared < targetSegments.length && currentDirectory[shared] === targetSegments[shared]) shared += 1

  const parentPrefix = '../'.repeat(currentDirectory.length - shared)
  const childPath = targetSegments.slice(shared).join('/')
  let result = `${parentPrefix}${childPath}`

  if (!parentPrefix && childPath) result = `./${childPath}`
  if (!result) result = './'
  if (targetPath.endsWith('/') && !result.endsWith('/')) result += '/'

  return `${result}${suffix}`
}

export function isLocalUrl(target: string) {
  return Boolean(target) && !target.startsWith('//') && !externalUrlPattern.test(target)
}
