import { defineConfig, EnvironmentModuleNode } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

let i = 0
let needUpdates: Set<EnvironmentModuleNode> = new Set()

export default defineConfig({
  plugins: [
    {
      name: 'hack-fn',
      transform(code, id) {
        if (id.endsWith('Comp.vue')) {
          return code.replace('MAGIC_FN()', String(0.5 + i))
        }
      },
    },
    vue(),

    {
      name: 'hack-hmr',
      enforce: 'post',
      configureServer(server) {
        server.watcher.on('change', (file) => {
          console.log('changed', file)
        })

        server.ws.on('inc', async () => {
          i++

          for (const env of Object.values(server.environments)) {
            const modules = env.moduleGraph.getModulesByFile(
              path.resolve(__dirname, 'src/Comp.vue'),
            )
            for (const mod of modules || []) {
              env.moduleGraph.invalidateModule(mod)
              server.watcher.emit('change', mod.id)
              needUpdates.add(mod)
            }
          }
        })
      },

      hotUpdate({ modules }) {
        const mod = [...needUpdates, ...modules]
        needUpdates.clear()
        return mod
      },
    },
  ],
})
