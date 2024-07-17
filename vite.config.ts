import { defineConfig, ModuleNode } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

let i = 0
let needUpdates: Set<ModuleNode> = new Set()

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'hack-fn',
      enforce: 'post',
      transform(code, id) {
        if (id.endsWith('App.vue')) {
          return code.replace('MAGIC_FN()', String(0.5 + i))
        }
      },

      configureServer(server) {
        server.watcher.on('change', (file) => {
          console.log('changed', file)
        })

        server.ws.on('inc', async () => {
          i++

          const modules = server.moduleGraph.getModulesByFile(
            path.resolve(__dirname, 'src/App.vue'),
          )
          for (const mod of modules || []) {
            server.moduleGraph.invalidateModule(mod)
            server.watcher.emit('change', mod.id)
            needUpdates.add(mod)
          }
        })
      },

      handleHotUpdate() {
        return Array.from(needUpdates)
      },
    },
  ],
})
