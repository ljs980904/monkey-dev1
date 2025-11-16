import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import piniaStore from './stores'; //引入
import App from './App.vue';
const app = createApp(App);

app.use(ElementPlus);
app.use(piniaStore);
createApp(App).mount(
  (() => {
    const app = document.createElement('div');
    document.body.append(app);
    return app;
  })()
);
