import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// 自动导入插件
import AutoImport from 'unplugin-auto-import/vite';
import AutoImportComponents from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import monkey, { cdn, util } from 'vite-plugin-monkey';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3002,
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
      imports: ['vue', 'pinia', util.unimportPreset], // util.unimportPreset
      // 时使用typescript，需要指定生成对应的d.ts文件或者设置为true,生成默认导入d.ts文件
      dts: 'types/auto-imports.d.ts',
      // dts: path.resolve(__dirname, 'types/auto-import.d.ts'),
      dirs: ['src/components',],
      // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
      resolvers: [
        ElementPlusResolver(),
      ],
      // 解决eslint报错问题
      // eslintrc: {
      //   // 这里先设置成true然后npm run dev 运行之后会生成 .eslintrc-auto-import.json 文件之后，在改为false
      //   enabled: false,
      //   filepath: './.eslintrc-auto-import.json', // 生成的文件路径
      //   globalsPropValue: true,
      // },
    }),

    // 油猴
    monkey({
      entry: 'src/main.ts', // 脚本文件的入口路径
      userscript: {
        name: '超星学习通--网课小助手|修复视频播放|自动跳转任务点|自动答题|超高题库覆盖率|逐渐支持更多平台',
        namespace: 'helper',
        version: '1.0.0',
        description: '学习助手-支持学习通，目前已完成：视频自动播放，自动切换任务点，章节测试，作业自动完成，自动保存，使用脚本进入对应平台的页面',
        author: 'helper',
        'run-at': 'document-start',
        match: ['*://*.chaoxing.com/*'],
        // grant: 'unsafeWindow', // none 为沙盒模式
        grant: ['unsafeWindow'], // 使用window对象
        noframes: true,
        connect: ['autohelper.top', 'localhost'], // 允许跨域的地址,
        resource: {
          // 嵌入 table.json 文件
          Table: 'https://www.forestpolice.org/ttf/2.0/table.json',
        },
        require: [
          // 'https://cdn.jsdelivr.net/npm/vue@3.4.27/dist/vue.global.min.js',
          // 'https://cdn.jsdelivr.net/npm/element-plus@2.7.2/dist/index.full.min.js'
        ],
      },
      build: {
        // externalGlobals: {
        // vue: cdn
        //   .jsdelivr("Vue", "dist/vue.global.prod.js")
        //   .concat(
        //     "https://cdn.jsdelivr.net/npm/vue@3.4.27/dist/vue.global.min.js"
        //   )
        //   .concat(util.dataUrl(";window.Vue=Vue;")),
        // 'element-plus': cdn
        //   .jsdelivr("ElementPlus", "dist/index.full.min.js")
        //   .concat(
        //     "https://cdn.jsdelivr.net/npm/element-plus@2.7.2/dist/index.full.min.js"
        //   )
        //   .concat(util.dataUrl(";window.ElementPlus=ElementPlus;")),
        // },
      },
    }),
  ],
});
