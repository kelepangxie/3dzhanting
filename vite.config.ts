import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import fs from 'node:fs'
import path from 'node:path'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

/**
 * 展品素材直读中间件：绕过 vite public 白名单（其只含启动快照，
 * 且 public 监听被禁用后不随文件增删更新，导致新素材 404→SPA 回退）。
 * 实时读盘 + 正确 decodeURI，中文文件名同样可用。
 */
function serveExhibits() {
  return {
    name: 'serve-exhibits',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = (req.url ?? '').split('?')[0]
        if (!url.startsWith('/exhibits/')) return next()
        let rel = url.slice('/exhibits/'.length)
        try {
          rel = decodeURI(rel)
        } catch {
          /* 非法编码交给 next */
        }
        const root = path.join(server.config.root, 'public', 'exhibits')
        const file = path.normalize(path.join(root, rel))
        if (!file.startsWith(root + path.sep)) return next() // 防目录穿越
        fs.readFile(file, (err: any, data: any) => {
          if (err) return next()
          const mime = MIME[path.extname(file).toLowerCase()]
          if (!mime) return next()
          res.setHeader('Content-Type', mime)
          res.setHeader('Cache-Control', 'no-cache')
          res.end(data)
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    serveExhibits(),
    react(),
    tsconfigPaths()
  ],
  // 静态资源目录不需要参与 HMR 监听；Windows 下批量拷贝图片会触发
  // fs.watch EBUSY 直接把 dev server 打挂，忽略之（改动 src 仍正常热更）
  server: {
    watch: {
      ignored: ['**/public/**'],
    },
  },
})
