import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
// 自动导入插件
import AutoImport from 'unplugin-auto-import/vite';
import AutoImportComponents from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import monkey, { util } from 'vite-plugin-monkey';
// 自定义 CDN 函数
const cdn = {
  jsdelivr: (name: string, path: string) =>
    `https://cdn.baomitu.com/npm/${name}@latest/${path}`,
};
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3002,
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
      imports: ['vue', 'vue-router', 'pinia', util.unimportPreset],
      // 时使用typescript，需要指定生成对应的d.ts文件或者设置为true,生成默认导入d.ts文件
      dts: 'types/auto-imports.d.ts',
      // dts: path.resolve(__dirname, 'types/auto-import.d.ts'),
      dirs: ['src/components', 'src/hooks'],
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

    // 油猴
    monkey({
      // meta: {
      //   grant: 'none',
      //   runAt: 'document-end',
      // },
      /**
       * 脚本文件的入口路径
       */
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        require: [
          cdn.jsdelivr('vue', 'dist/vue.global.prod.js'),
          'https://unpkg.com/vue-demi@latest/lib/index.iife.js',
          cdn.jsdelivr('element-plus', 'dist/index.full.min.js'),
          cdn.jsdelivr('pinia', 'dist/pinia.min.js'),
        ],
        match: [
          'https://mooc1.chaoxing.com/*',
          'https://mooc1-1.chaoxing.com/*',
        ],
        grant: 'none',
        'run-at': 'document-start',
        noframes: true,
      },
      // format?: Format;

      server: {
        mountGmApi: true,

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

        /**
         * @example
         * {
         *  vue:'Vue',
         *  // 你需要额外设置脚本配置 userscript.require = ['https://unpkg.com/vue@3.0.0/dist/vue.global.js']
         *  vuex:['Vuex', 'https://unpkg.com/vuex@4.0.0/dist/vuex.global.js'],
         *  // 插件将会自动注入 cdn 链接到 userscript.require
         *  vuex:['Vuex', (version)=>`https://unpkg.com/vuex@${version}/dist/vuex.global.js`],
         *  // 相比之前的，加了版本号，当依赖升级的时候，cdn 链接自动改变
         *  vuex:['Vuex', (version, name)=>`https://unpkg.com/${name}@${version}/dist/vuex.global.js`],
         *  // 还可以加依赖名字,不过各个依赖的 cdn basename 都不尽一致, 导致可能没什么用
         * }
         *
         */
        //     * {  // resourceName default value is pkg.importName
        //  *   'element-plus/dist/index.css': pkg=>`https://unpkg.com/${pkg.name}@${pkg.version}/${pkg.resolveName}`,
        //  *   'element-plus/dist/index.css': {
        //  *     resourceName: pkg=>pkg.importName,
        //  *     resourceUrl: pkg=>`https://unpkg.com/${pkg.name}@${pkg.version}/${pkg.resolveName}`,
        //  *     loader: pkg=>{ // there are default loaders that support [css, json, the assets that vite support, ?url, ?raw] file/name suffix
        //  *        const css = GM_getResourceText(pkg.resourceName);
        //  *        GM_addStyle(css);
        //  *        return css;
        //  *     },
        //  *     nodeLoader: pkg=>{
        //  *        return [
        //  *          `export default (()=>{`,
        //  *          `const css = GM_getResourceText(${JSON.stringify(pkg.resourceName)});`,
        //  *          `GM_addStyle(css);`,
        //  *          `return css;`,
        //  *          `})();`
        //  *        ].join('');
        //  *     },
        //  *   },
        //  *   'element-plus/dist/index.css': [
        //  *      (version, name, importName, resolveName)=>importName,
        //  *      (version, name, importName, resolveName)=>`https://unpkg.com/${name}@${version}/${resolveName}`,
        //  *       // for compat externalGlobals cdn function, if (version/name/importName/resolveName) == '', plugin will use their own default values
        //  *   ],
        //  *   'element-plus/dist/index.css': cdn.jsdelivr(),
        //  * }
        // 外部包配置
        externalGlobals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          pinia: 'Pinia',
        },
        externalResource: {
          'element-plus/dist/index.css': cdn.jsdelivr(),
        },
        minifyCss: true,
        /**
         * 自动识别代码里用到的 浏览器插件api，然后自动配置 GM_* 或 GM.* 函数到脚本配置注释头
         *
         * 识别依据是判断代码文本里有没有特定的函数名字
         * @default true
         */
        // autoGrant: true,
      },
    }),
  ],
});
