import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
// import Icons from 'unplugin-icons/vite'
// import IconsResolver from 'unplugin-icons/resolver'
import vue from '@vitejs/plugin-vue';
// 自动导入插件
import AutoImport from 'unplugin-auto-import/vite';
import AutoImportComponents from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import monkey, { cdn, util } from 'vite-plugin-monkey';
// 自定义 CDN 函数
// const cdn = {
//   jsdelivr: (name: string, path: string) =>
//     `https://cdn.baomitu.com/npm/${name}@latest/${path}`,
// };
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3002,
  },
  build: {
    minify: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    vue(),
    AutoImportComponents({
      // 指定组件所在文件夹的位置，默认是src/components
      dirs: ['src/components'],
      // ui库解析器
      resolvers: [ElementPlusResolver()],
      extensions: ['vue'], //文件扩展
      // 配置type文件生成位置
      dts: 'src/components.d.ts',
    }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'], // util.unimportPreset
      // 时使用typescript，需要指定生成对应的d.ts文件或者设置为true,生成默认导入d.ts文件
      dts: 'types/auto-imports.d.ts',
      // dts: path.resolve(__dirname, 'types/auto-import.d.ts'),
      dirs: ['src/components', 'src/hooks'],
      // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
      // resolvers: [
      //   ElementPlusResolver(),
      //   // Auto import icon components
      //   // 自动导入图标组件
      //   IconsResolver({
      //     prefix: 'Icon',
      //   }),
      // ],
      // eslintrc: {
      //   // 这里先设置成true然后npm run dev 运行之后会生成 .eslintrc-auto-import.json 文件之后，在改为false
      //   // enabled: false,
      //   filepath: './.eslintrc-auto-import.json', // 生成的文件路径
      //   // globalsPropValue: true,
      // },
      // 解决eslint报错问题
      eslintrc: {
        // 这里先设置成true然后npm run dev 运行之后会生成 .eslintrc-auto-import.json 文件之后，在改为false
        enabled: false,
        filepath: './.eslintrc-auto-import.json', // 生成的文件路径
        globalsPropValue: true,
      },
    }),
    // Icons({
    //   autoInstall: true,
    // }),
    // 油猴
    monkey({
      /**
       * 脚本文件的入口路径
       */
      entry: 'src/main.ts',
      userscript: {
        description: 'default_description',
        // icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        match: [
          'https://mooc1.chaoxing.com/*',
          'https://mooc1-1.chaoxing.com/*',
          'https://mooc2-ans.chaoxing.com/*',
        ],
        grant: 'unsafeWindow', // none 为沙盒模式
        'run-at': 'document-start',
        noframes: true,
        connect: 'autohelper.top', // 允许跨域的地址,
        resource: {
          // 嵌入 table.json 文件
          Table: 'https://www.forestpolice.org/ttf/2.0/table.json',
        },
      },
      // format?: Format;

      server: {
        // mountGmApi: true, //全局变量用法
        /**
         * 当 第一次启动 或 脚本配置注释改变时 自动在默认浏览器打开脚本
         * @default true
         */
        // open?: boolean;
        /**
         * 开发阶段的脚本名字前缀，用以在脚本安装列表里区分构建好的脚本
         * @default 'dev:'
         */
        // prefix?: string | ((name: string) => string);
      },

      build: {
        /**
         * 打包构建的脚本文件名字 应该以 '.user.js' 结尾
         * @default (package.json.name||'monkey')+'.user.js'
         */
        fileName: 'assistant.user.js',
        // dns 目前jsdelivr 访问较慢 暂时不做sdn处理
        // externalGlobals: {
        //   vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js').concat(
        //     await util.fn2dataUrl(() => {
        //       // @ts-ignore
        //       window.Vue = Vue;
        //     })
        //   ),
        //   'element-plus': cdn.jsdelivr('ElementPlus', 'dist/index.full.min.js'),
        // },
        // externalResource: {
        //   'element-plus/dist/index.css': cdn.jsdelivr(),
        //   'animate.css': cdn.bootcdn(),
        //   'element-plus/package.json': cdn.elemecdn(),
        //   // 'base64-img/test/img/car.svg': cdn.unpkg(),
        //   // 'base64-img/test/img/car.svg?url': cdn.jsdelivr(),
        //   // 'base64-img/test/img/car.svg?raw': cdn.jsdelivr(),
        //   'element-plus/dist/index.css?raw': cdn.jsdelivr(),
        // },
      },
    }),
  ],
});
