#!/usr/bin/env node
/**
 * 校验插件的打包副本与核心仓一致。
 *
 * 用法：node scripts/check-sync.mjs <核心仓目录>
 *
 * 规则：
 *   lib/kb/*.mjs       必须等于 core/src/*.mjs
 *   lib/web/**         必须等于 core/web/**（widget.js 除外）
 *   lib/web/widget.js  必须等于本仓根目录 widget.js
 *
 * 不一致时列出差异并以 1 退出。
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const core = path.resolve(process.argv[2] ?? path.join(root, '..', 'local-experience-kb-mvp'))

function sha(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function walk(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, base, out)
    else out.push(path.relative(base, abs).split(path.sep).join('/'))
  }
  return out
}

const problems = []

function compare(fromDir, toDir, { skip = [] } = {}) {
  const files = walk(fromDir).filter((file) => !skip.includes(file))
  const target = new Set(walk(toDir))
  for (const file of files) {
    const dst = path.join(toDir, file)
    if (!target.has(file)) { problems.push(`缺少：${path.relative(root, dst)}`); continue }
    if (sha(path.join(fromDir, file)) !== sha(dst)) problems.push(`不同：${path.relative(root, dst)}`)
  }
  for (const file of target) {
    if (skip.includes(file)) continue
    if (!files.includes(file)) problems.push(`多余：${path.relative(root, path.join(toDir, file))}`)
  }
}

compare(path.join(core, 'src'), path.join(root, 'lib', 'kb'))
compare(path.join(core, 'web'), path.join(root, 'lib', 'web'), { skip: ['widget.js'] })

const widget = path.join(root, 'widget.js')
const widgetCopy = path.join(root, 'lib', 'web', 'widget.js')
if (!fs.existsSync(widgetCopy)) problems.push('缺少：lib/web/widget.js')
else if (sha(widget) !== sha(widgetCopy)) problems.push('不同：lib/web/widget.js（应与根目录 widget.js 一致）')

if (problems.length) {
  console.error('副本不一致：')
  for (const line of problems) console.error(`  - ${line}`)
  process.exit(1)
}
console.log('副本一致：lib/kb、lib/web、widget.js')
