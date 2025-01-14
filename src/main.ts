import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import Directives from './directives/index';

// import {
//   GM_cookie,
//   unsafeWindow,
//   monkeyWindow,
//   GM_addElement,
//   GM_info,
// } from '$';
const pinia = createPinia();
import App from './App.vue';

const initApp = () => {
  const app = createApp(App);
  app.use(ElementPlus, { locale: zhCn });
  app.use(pinia);
  app.use(Directives);

  app.mount(
    (() => {
      const appEle = document.createElement('div');
      // appEle.style.width = '100%';
      // appEle.style.height = '100vh';

      document.body.append(appEle);
      return appEle;
    })()
  );
};
window.addEventListener('load', initApp);
