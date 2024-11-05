/*
 * @FilePath: index.js
 * @Author: ljs
 * @Date: 2024-05-11 16:01:42
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-10-12 10:56:18
 * Copyright: 2024 xxxTech CO.,LTD. All Rights Reserved.
 * @Descripttion:
 */
import drag from './drag';

// 自定义指令
const directives: any = {
  drag,
};
// 这种写法可以批量注册指令
export default {
  install(Vue: any) {
    Object.keys(directives).forEach((key) => {
      Vue.directive(key, directives[key]);
    });
  },
};
