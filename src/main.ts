import { createApp } from 'vue';
import './style.css';
import 'element-plus/dist/index.css';
import pinia from './stores'  //引入
import App from './App.vue';

const initApp = () => {
  const app = createApp(App);
  app.use(pinia);
  // 创建挂载点并挂载
  app.mount(
    (() => {
      const app = document.createElement('div');
      app.className = "script-div"
      document.body.append(app);
      return app;
    })()
  );
}
window.addEventListener('load', initApp);
