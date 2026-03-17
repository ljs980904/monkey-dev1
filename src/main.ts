import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// import piniaStore from './stores'; //引入
import App from './App.vue';

// 等待页面加载完成后执行插入
function initApp() {
  // 检查 DOM 是否已准备好
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
  } else {
    // DOM 已经加载完成，直接执行
    mountApp();
  }
}

function mountApp() {
  // 确保 body 元素存在
  if (!document.body) {
    // 如果 body 还不存在，等待一下再试
    setTimeout(mountApp, 10);
    return;
  }

  const app = createApp(App);
  app.use(ElementPlus);
  // app.use(piniaStore);

  const container = document.createElement('div');
  document.body.append(container);
  app.mount(container);
}

// 启动应用
initApp();
