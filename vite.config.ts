import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

// Копирование манифеста
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    buildStart() {
      if (!existsSync('dist')) {
        mkdirSync('dist', { recursive: true })
      }
      copyFileSync('manifest.json', 'dist/manifest.json')
    }
  }
}

export default defineConfig(({ mode }) => {
  return {
    plugins: [vue(), copyManifest()],
    mode: mode,
    build: {
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'src/popup/index.html'),
          widget: resolve(__dirname, 'src/content/widget.ts'),
          support: resolve(__dirname, 'src/content/support.ts'),
          background: resolve(__dirname, 'src/background/background.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      },
      outDir: 'dist',
      emptyOutDir: false,
      minify: false,
      sourcemap: false
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
})