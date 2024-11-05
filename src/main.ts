import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import Directives from './directives/index';
const pinia = createPinia();
import App from './App.vue';

const initApp = () => {
  const app = createApp(App);
  app.use(ElementPlus, { locale: zhCn, '--el-color-primary': '#008CFF' });
  app.use(pinia);
  app.use(Directives);
  app.mount(
    (() => {
      const appEle = document.createElement('div');
      appEle.style.width = '100%';
      appEle.style.height = '100vh';

      document.body.append(appEle);
      return appEle;
    })()
  );
};
initApp();
