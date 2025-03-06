import { defineConfig, EnvironmentModuleNode, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

let newCode: string | undefined
let pendingUpdates: Set<EnvironmentModuleNode> = new Set()

const TransformPlugin: Plugin = {
  name: 'transform',
  transform(code, id) {
    if (!newCode) return
    if (id.endsWith('App.vue')) {
      return newCode
    } else if (id.endsWith('App.vue?raw')) {
      return `export default ${JSON.stringify(newCode)}`
    }
  },
}

const TriggerHotUpdate: Plugin = {
  name: 'trigger-hot-update',
  enforce: 'post', //! important
  configureServer(server) {
    // server.watcher.on('change', (file) => {
    //   console.log('changed', file)
    // })

    server.ws.on('update-code', async (code) => {
      newCode = code

      for (const env of Object.values(server.environments)) {
        const modules = env.moduleGraph.getModulesByFile(
          path.resolve(__dirname, 'src/App.vue'),
        )
        for (const mod of modules || []) {
          env.moduleGraph.invalidateModule(mod)
          server.watcher.emit('change', mod.id)
          pendingUpdates.add(mod)
        }
      }
    })
  },

  hotUpdate({ modules }) {
    const mod = [...pendingUpdates, ...modules]
    pendingUpdates.clear()
    return mod
  },
}

export default defineConfig({
  plugins: [TransformPlugin, vue(), TriggerHotUpdate],
})
