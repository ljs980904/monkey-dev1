export const questionData = {
  question: '题目：关于 Vue.js 的生命周期钩子，以下哪些说法是正确的？（多选）',
  options: [
    'A. beforeCreate 钩子在实例初始化之后、数据观测 (data observer) 和事件配置之前被调用。',
    'B. created 钩子在实例创建完成后立即调用，此时已经完成了数据观测 (data observer) 和事件配置，但 DOM 还未生成。',
    'C. mounted 钩子在实例挂载到 DOM 后调用，此时可以访问到真实的 DOM 元素。',
    'D. beforeUpdate 钩子在数据更新时调用，但在 DOM 更新之前。',
    'E. updated 钩子在数据更新并且 DOM 重新渲染后调用，此时可以安全地操作更新后的 DOM。',
    'F. destroyed 钩子在实例销毁后调用，此时所有的事件监听器和子组件都会被移除。',
    'G. beforeDestroy 钩子在实例销毁之前调用，此时实例仍然完全可用，可以进行最后的清理工作。',
    'H. activated 和 deactivated 钩子只在使用 <keep-alive> 包裹的组件中有效，分别在组件激活和停用时调用。',
  ],
};
