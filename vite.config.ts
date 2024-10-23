import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

import postCssPxToViewport from 'postcss-px-to-viewport-8-plugin'
import tailwindcss from 'tailwindcss'

// #ifdef H5
import { VantResolver } from 'unplugin-vue-components/resolvers'
// #endif

import mockDevServerPlugin from 'vite-plugin-mock-dev-server'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import VueDevTools from 'vite-plugin-vue-devtools'
import { createHtmlPlugin } from 'vite-plugin-html'
import viteCompression from 'vite-plugin-compression'

import { enableCDN } from './build/cdn'

export default defineConfig(async ({ mode }) => {
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
        // api是自行设置的请求前缀，任何请求路径以/api开头的请求将被代理到对应的target目标
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_SERVE, // 目标域名
          changeOrigin: true, // 需要代理跨域
          rewrite: (path) => path.replace(env.VITE_APP_BASE_API, '') // 路径重写，把'/api'替换为''
        }
      }
    },
    plugins: [
      // #ifdef H5
      Components({
        // 生成自定义 `auto-components.d.ts` 全局声明
        dts: 'src/types/auto-components.d.ts',
        resolvers: [VantResolver()]
      }),
      // #endif
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
        dts: 'src/types/auto-imports.d.ts',
        resolvers: [VantResolver()],
        dirs: ['src/store', 'src/store/modules'],
        eslintrc: {
          enabled: true,
          globalsPropValue: true
        }
      }),
      uni(),
      mockDevServerPlugin(),
      vueSetupExtend(),
      // https://github.com/vuejs/devtools-next
      VueDevTools(),
      // 生产环境 gzip 压缩资源
      viteCompression(),
      // 注入模板数据
      createHtmlPlugin({
        inject: {
          data: {
            ENABLE_ERUDA: env.VITE_ENABLE_ERUDA || 'false'
          }
        }
      }),
      // 生产环境默认不启用 CDN 加速
      enableCDN(env.VITE_CDN_DEPS)
    ],
    css: {
      // css预处理器
      postcss: {
        plugins: [
          tailwindcss,
          postCssPxToViewport({
            unitToConvert: 'px',
            viewportWidth: 375,
            unitPrecision: 5, // 单位转换后保留的精度
            propList: ['*'], // 能转化为vw的属性列表
            viewportUnit: 'vmin', // 希望使用的视口单位
            fontViewportUnit: 'vmin', // 字体使用的视口单位
            selectorBlackList: ['ignore-', 'uni-'], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
            minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
            mediaQuery: true, // 媒体查询里的单位是否需要转换单位
            replace: true, //  是否直接更换属性值，而不添加备用属性
            exclude: [], // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
            include: [], // 如果设置了include，那将只有匹配到的文件才会被转换
            landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
            landscapeUnit: 'vw', // 横屏时使用的单位
            landscapeWidth: 1628 // 横屏时使用的视口宽度
          })
        ]
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
        }
      }
    }
  }
})
