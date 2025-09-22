import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    // 库模式配置
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AIBotComponent',
      fileName: (format) => format === 'es' ? 'ai-bot-component.js' : 'ai-bot-component.umd.cjs',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // 排除外部依赖，避免打包React等
      external: ['react', 'react-dom'],
      output: {
        // 为外部依赖提供全局变量名
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        }
      }
    },
    emptyOutDir: false,
    outDir: 'dist'
  } 
}))
