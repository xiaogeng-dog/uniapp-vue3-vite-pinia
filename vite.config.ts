import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import Unocss from 'unocss/vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: './',
    // vite 配置
    define: {
      __APP_ENV__: env.APP_ENV
    },
    server: {
      // http://localhost:5173/api/login -> http://www.test.com/login
      proxy: {
        //api是自行设置的请求前缀，任何请求路径以/api开头的请求将被代理到对应的target目标
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_SERVE, //目标域名
          changeOrigin: true, //需要代理跨域
          rewrite: (path) => path.replace(env.VITE_APP_BASE_API, '') //路径重写，把'/api'替换为''
        }
      }
    },
    plugins: [
      uni(),
      Unocss(),
      Components({
        resolvers: [VantResolver()]
      }),
      AutoImport({
        imports: [
          'vue',
          'uni-app',
          'pinia',
          {
            from: 'uni-mini-router',
            imports: ['createRouter', 'useRouter', 'useRoute']
          }
        ],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/store'],
        eslintrc: {
          enabled: true,
          globalsPropValue: true
        }
      })
    ]
  }
})
