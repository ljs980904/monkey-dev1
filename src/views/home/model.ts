import { request } from '../../utils/fetch';
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
// tabs
export const tabPane = [
  {
    label: '首页',
    name: 'home',
  },
  // {
  //   label: '设置',
  //   name: 'setting',
  // },
];

export const TASK_TEXTS = {
  videoTxt: '视频',
  detection: '章节测验',
  successTxt: '任务点已完成',
  nextTxt: '下一节',
};

export const EXCLUDES_TASK = {
  tasks: ['问卷调查', '阅读'],
};

export const getSetUp = () => {
  const data: any = reactive({
    url: 'https://autohelper.top/api',
    title: 'AI 助手',
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
    list: [], // // 当前操作日志
    activeName: 'home', // home / setting / task
    settingForm: {
      onlyVide: 0, // 只看视频
      onlySubject: 0, // 只刷题
      time: 1000, // 等待时间
    },
  });
  // 添加日志
  const addList = (obj: any) => {
    data.list.unshift({
      timestamp: new Date().toLocaleTimeString(),
      ...obj,
    });
  };

  return { ...toRefs(data), addList };
};
export const service = () => {
  const generationService = () => {
    fetch('http://192.168.1.3:5000/answer', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Request failed: ' + error);
      });
  };
  return { generationService };
};
// 获取嵌套的 iframe 文档
export const getNestedIframeDocument = (iframeSelector) => {
  const iframe = document.querySelector(iframeSelector);
  return iframe?.contentWindow?.document;
};

export const enums = {
  videoTxt: '视频',
  detection: '章节测验',
  successTxt: '任务点已完成',
};

export const logTxt = {
  // 进入下个任务
  successNext: {
    value: '本章任务已完成，进入下个任务',
    type: 'success',
  },
  // 当前任务状态
  success: {},
  // 发现任务
  findTask: {},
  // 正在解析
  nowFind: {},
  // 解析失败
  findError: {},
  // 脚本加载成功
  load: {},
};

export const cleanText = (text: string | null) => {
  if (!text) return ''; // 如果 text 为空或 null，返回空字符串
  return text.replace(/\s+/g, ' ').trim();
};

const url = 'https://autohelper.top/api';
// 测试
export const testRq = async (data) => {
  try {
    console.log();
    const params = `题目：${data.question}，选项：${data.options}`;
    request(
      `${url}/answer?topic=${params}`,
      'get',
      {},
      (response) => {
        const resData = JSON.parse(response);
        const cet =
          resData.correct_answer?.output?.choices[0]?.message?.content;
      },
      (err) => {
        return err;
      }
    );
  } catch (error) {
    console.log(error);
  }
};
