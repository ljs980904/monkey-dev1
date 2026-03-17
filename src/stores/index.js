
import { createPinia } from "pinia" //引入pinia
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createSharedState } from '@pinian/shared-state';

const pinia = createPinia() //创建pinia实例

pinia.use(piniaPluginPersistedstate)
// pinia.use(createSharedState({
//   auto: true,
// }))

export default pinia //导出pinia用于main.js注册
