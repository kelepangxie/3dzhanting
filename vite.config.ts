import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
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
