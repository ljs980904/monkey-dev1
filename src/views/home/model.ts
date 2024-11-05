export const LOG_VAL = {
  loadHtml: {
    val: '正在检测页面状态',
    color: 'red',
  },
  videoPlayReloadStart: {
    val: '视频开始解析',
    color: '#eeeeee',
  },
  videoPlayReloadEnd: {
    val: '视频解析完成',
    color: '#eeeeee',
  },
  videoPlaying: {
    val: '视频播放中',
    color: '#eeeeee',
  },
  videoPlayStart: {
    val: '视频开始播放',
    color: '#eeeeee',
  },
  videoPlayOver: {
    val: '视频播放完成',
    color: '#eeeeee',
  },
  videoNext: {
    val: '进入下个视频',
    color: 'blue',
  },
  realyNext: {
    val: '页面处理完成，准备进入下个页面',
    color: 'blue',
  },
  error: {
    val: '当前处理错误',
    color: 'red',
  },
  // videoPlayReloadStart: '视频开始解析',
  // videoPlayReloadEnd: '视频解析完成',
  // videoPlaying: '视频播放中',
  // videoPlayStart: '视频开始播放',
  // videoPlayOver: '视频播放完成',
  // videoNext: '进入下个视频',
  // realyNext: '页面处理完成，准备进入下个页面',
  // error: '当前处理错误',
};
export const getSetUp = () => {
  const data: any = reactive({
    host: '',
    dialogTableVisible: true,
    htmlEle: {
      nowIdx: 0, // 当前索引
      tabLength: 0, // 当前章节有几个tab
      inClassName: 'active',
      tabs: [], // 存储当前title
      currentPageTabs: [],
      videoPlayOver: false,
    },
    dialogConfig: {
      modal: false,
      modalClass: 'dialog-class',
      lockScroll: false,
      showClose: false,
      draggable: true,
      appendToBody: true,
      closeOnPressEscape: false,
      closeOnClickModal: false,
      destroyOnClose: true,
    },
    logArrs: [], // // 当前操作日志
  });
  // 永远滚动到底部
  // 脚本进程
  // const pushLog = (key) => {
  //   // const txt = isEmnu ? key : LOG_VAL[key];
  //   data.logArrs.unshift({
  //     // ...txt,
  //     value:key
  //     time: new Date().toLocaleTimeString(),
  //   });
  // };

  const pushLog = (obj: any) => {
    data.logArrs.unshift({
      time: new Date().toLocaleTimeString(),
      ...obj,
    });
  };
  const sleep = (ms: any) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  return { ...toRefs(data), pushLog, sleep };
};
