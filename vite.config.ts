import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// 自动导入插件
// import AutoImport from 'unplugin-auto-import/vite';
// import AutoImportComponents from 'unplugin-vue-components/vite';
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import monkey, { cdn, util } from 'vite-plugin-monkey';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3002,
  },
  build: {
    minify: false, // 关闭所有压缩
  },
  plugins: [
    vue(),
    // 油猴
    monkey({
      entry: 'src/main.ts', // 脚本文件的入口路径
      userscript: {
        name: '超星网课自动助手（智能答题版）',
        namespace: 'kaoyuansoft',
        version: '2.0.1',
        description:
          '学习通全场景自动化神器！自动刷课（跳过弹窗、无缝切视频），章节测验、期末考全自动答题 —— 不止简单匹配题库，更用 DeepSeek 深度解析题目逻辑，让答题有 “智慧”，正确率远超普通脚本！所有功能可自定义（开关功能、选答题模式），彻底帮你省时间、少操心，轻松搞定学习通任务～',
        author: 'kaoyuansoft',
        match: ['*://*.chaoxing.com/*'],
        grant: ['unsafeWindow'], // 使用window对象
        noframes: true,
        connect: ['autohelper.top', 'localhost'], // 允许跨域的地址,
        'run-at': 'document-start',
        license: 'MIT',
        resource: {
          // 嵌入 table.json 文件
          Table: 'https://www.forestpolice.org/ttf/2.0/table.json',
        },
      },
      server: { mountGmApi: true },
      build: {
        // metaFileName: true,
        externalGlobals: [
          [
            'vue',
            cdn
              .jsdelivr('Vue', 'dist/vue.global.prod.js')
              .concat(
                cdn.jsdelivr('', 'lib/index.iife.js')[1]('latest', 'vue-demi')
              )
              .concat(util.dataUrl(';window.Vue=Vue;')),
          ],
          ['pinia', cdn.jsdelivr('Pinia', 'dist/pinia.iife.prod.js')],
          [
            'element-plus',
            cdn.jsdelivr('ElementPlus', 'dist/index.full.min.js'),
          ],
        ],
        externalResource: {
          'element-plus/dist/index.css': cdn.jsdelivr(),
          'element-plus/dist/index.css?inline': cdn.jsdelivr(),
        },
      },
    }),
  ],
});
