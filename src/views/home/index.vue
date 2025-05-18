<script setup>
import useUserInfoStore from '../../stores/user'; //引入仓库
import DraggableDialog from '../../components/draggable-dialog.vue';
import { crackFont } from '../../utils/crack-font';
import { sleep } from '../../utils';
import { simulateRequest } from './model';

const userInfoStore = useUserInfoStore();
// 配置工具
const configStore = reactive({
  isShow: true,
  platformParams: {
    cx: {
      autoNext: true, // 自动切换
      answeringMode: false, // 只答题
    },
  },
  // 入参
  otherParams: {
    timeInterval: 3, // 切换、答题间隔，单位秒
    rate: 85, // 正确率达到多少自动提交
    name: '其他参数',
  },
  rate: 80, // 完成率
  currentPageTabs: [], // 当前任务章节 tab
  nowIdx: 0, // 当前tab索引
  title: 'AT助手',
  logData: [], // 日志
  isfalse: false,
  sizes: 'small',
  activeTab: 'log',
  tabBar: [
    {
      value: 'log',
      label: '首页',
    },
    {
      value: 'keys',
      label: '答题',
    },
    {
      value: 'guide',
      label: '指南',
    },
    {
      value: 'settings',
      label: '设置',
    },
  ],
  assistantName: 'AI 助手',
  avatarSrc:
    'https://public.readdy.ai/ai/img_res/2d58579252345596c10002ce85d4f6f8.jpg',
  workUrl: window.location.href,
  key: userInfoStore.key, // keys
  validatedKeys: false, // 是否验证
  url: 'https://autohelper.top/prod-api/question/dpQuestion',
  // url: 'http://localhost:8080/question/dpQuestion',
});
const inputNumberAttr = {
  step: 1,
  'step-strictly': true,
  size: 'small',
};

const __defProp = Object.defineProperty;
const __defNormalProp = (obj, key, value) =>
  key in obj
    ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value,
      })
    : (obj[key] = value);
const __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== 'symbol' ? key + '' : key, value);
  return value;
};

const _unsafeWindow = (() =>
  typeof unsafeWindow != 'undefined' ? unsafeWindow : void 0)();

const addLog = (obj) => {
  configStore.logData.unshift({
    time: new Date().toLocaleTimeString(),
    ...obj,
  });
};

// 工具函数：等待 iframe 加载完成

const waitIframeLoad = async (iframe) => {
  return new Promise((resolve) => {
    const intervalId = setInterval(async () => {
      if (iframe.contentDocument?.readyState === 'complete') {
        resolve();
        clearInterval(intervalId);
      }
    }, 500);
  });
};
// 处理单个 iframe
const processIframe = async (iframe) => {
  const iframeSrc = iframe.src;
  console.log('iframeSrc=========', iframeSrc);
  const iframeDocument = iframe.contentDocument;
  const iframeWindow = iframe.contentWindow;
  // 检查 iframe 是否有效
  if (!iframeDocument || !iframeWindow) {
    return Promise.resolve();
  }
  // 跳过 JavaScript iframe
  if (iframeSrc.includes('javascript:')) {
    return Promise.resolve();
  }
  // 等待 iframe 加载完成
  await waitIframeLoad(iframe);
  // 判断任务点是否已完成
  const parentClass = iframe.parentElement?.className || '';
  if (parentClass.includes('ans-job-finished')) {
    addLog({
      value: `发现一个已完成任务点`,
      type: 'success',
    });
    return Promise.resolve();
  }
  // 根据 iframe 的 src 处理任务点
  if (iframeSrc.includes('api/work')) {
    // 作业
    return await processWork(iframe, iframeDocument, iframeWindow);
  }
  if (configStore.platformParams.cx.answeringMode) {
    addLog({
      value: `只答题模式已开，可在设置里调整`,
      type: 'primary',
    });
  } else {
    const ansJobIcon = iframe.parentElement
      ? iframe.parentElement.querySelector('.ans-job-icon')
      : '';
    if (ansJobIcon) {
      if (iframeSrc.includes('video')) {
        return processMedia('video', iframeDocument);
      } else if (iframeSrc.includes('audio')) {
        return processMedia('audio', iframeDocument);
      } else if (
        ['ppt', 'doc', 'pptx', 'docx', 'pdf'].some((type) =>
          iframeSrc.includes('modules/' + type)
        )
      ) {
        return processPpt(iframeWindow);
      } else if (
        ['innerbook'].some((type) => iframeSrc.includes('modules/' + type))
      ) {
        return processBook(iframeWindow);
      }
    }
  }
  return Promise.resolve();
};
// 处理任务点：视频/音频
const processMedia = async (mediaType, iframeDocument) => {
  return new Promise(async (resolve) => {
    addLog({
      value: `发现一个${mediaType}，正在解析`,
      type: 'warning',
    });
    addLog({
      value: `正在尝试播放${mediaType}，请稍等`,
      type: 'primary',
    });
    await sleep(1);
    let isExecuted = false;
    addLog({
      value: `播放成功`,
      type: 'success',
    });
    const intervalId = setInterval(async () => {
      const mediaElement =
        iframeDocument.documentElement.querySelector(mediaType);
      if (mediaElement && !isExecuted) {
        await mediaElement.pause();
        mediaElement.muted = true;
        await mediaElement.play();
        const listener = async () => {
          await sleep(3);
          await mediaElement.play();
        };
        mediaElement.addEventListener('pause', listener);
        mediaElement.addEventListener('ended', () => {
          addLog({
            value: `${mediaType}已播放完成`,
            type: 'success',
          });
          mediaElement.removeEventListener('pause', listener);
          resolve();
        });
        isExecuted = true;
        clearInterval(intervalId);
      }
    }, 2500);
  });
};

// 处理任务点：PPT/文档
const processPpt = async (iframeWindow) => {
  // addLog({
  //   value: `处理 PPT/文档任务点`,
  //   type: 'info',
  // });
  // const pptWindow =
  //   iframeWindow.document.querySelector('#panView').contentWindow;
  // await pptWindow.scrollTo({
  //   top: pptWindow.document.body.scrollHeight,
  //   behavior: 'smooth',
  // });
  // addLog({
  //   value: `发现一个PPT，正在解析`,
  //   type: 'warning',
  // });
  // noRunFunc();
  return Promise.resolve();
};

// 处理任务点：书籍
const processBook = async (iframeWindow) => {
  addLog({
    value: `发现一个电子书，正在解析`,
    type: 'warning',
  });
  _unsafeWindow?.top?.onchangepage(iframeWindow.getFrameAttr('end'));
  addLog({
    value: `阅读完成`,
    type: 'success',
  });
  return Promise.resolve();
};

class BaseQuestionHandler {
  constructor() {
    __publicField(this, '_document', document);
    __publicField(this, '_window', _unsafeWindow);
    // __publicField(this, 'addLog', undefined);
    // __publicField(this, 'addQuestion', undefined);
    __publicField(this, 'questions', []);
    __publicField(this, 'correctNum', 0);
    __publicField(this, 'parseHtml', () => {
      throw new Error('请使用继承类的重写方法');
    });
    __publicField(this, 'fillQuestion', (question) => {
      throw new Error('请使用继承类的重写方法');
    });
    __publicField(this, 'questionType', {
      单选题: '0',
      A1型题: '0',
      多选题: '1',
      X型题: '1',
      填空题: '2',
      判断题: '3',
      简答题: '4',
      名词解释: '5',
      论述题: '6',
      计算题: '7',
    });
    __publicField(this, 'removeHtml', (html) => {
      if (html == null) {
        return '';
      }

      return html
        .replace(/<((?!img|sub|sup|br)[^>]+)>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<img.*?src="(.*?)".*?>/g, '<img src="$1"/>')
        .trim();
    });
    __publicField(this, 'clean', (str) => {
      return str.replace(/^【.*?】\s*/, '').replace(/\s*（\d+\.\d+分）$/, '');
    });
  }
}

class CxQuestionHandler extends BaseQuestionHandler {
  constructor(type, iframe) {
    super();
    __publicField(this, 'type');
    __publicField(this, 'init', async () => {
      this.questions = [];
      this.parseHtml();
      if (this.questions.length) {
        addLog({
          value: `成功解析到${this.questions.length}个题目`,
          type: 'primary',
        });
        for (const [index, question] of this.questions.entries()) {
          console.log('question===========', question);

          const resp = await simulateRequest(
            configStore.url,
            question,
            _unsafeWindow,
            configStore.key
          );

          if (resp?.code === 200) {
            const { answers, number } = resp.data;
            question.answer = answers;
            this.fillQuestion(question);
            addLog({
              value: `第${index + 1}道题搜索成功，剩余次数：${number}`,
              type: 'success',
            });
            this.correctNum += 1;
          } else {
            addLog({
              value: `第${index + 1}道题搜索失败，${resp.msg}`,
              type: 'error',
            });
            question.answer[0] = '请求失败，请稍后再试';
          }
          if (!this._document) {
            let _a = this._document;
            await _a.querySelectorAll('.switch-btn-box > button')[1].click();
          }
          await sleep(2);
        }
      } else {
        addLog({
          value: `未解析到题目，请进入正确页面`,
          type: 'danger',
        });
      }
      return Promise.resolve((this.correctNum / this.questions.length) * 100);
    });
    __publicField(this, 'parseHtml', () => {
      if (!this._document) return [];
      if (['zj'].includes(this.type)) {
        const questionElements = this._document.querySelectorAll('.TiMu');
        this.addQuestions(questionElements);
      } else if (['zy', 'ks'].includes(this.type)) {
        const questionElements = this._document.querySelectorAll('.questionLi');
        this.addQuestions(questionElements);
      }
    });
    __publicField(this, 'fillQuestion', (question) => {
      var _a, _b;
      // 0：单选题，1：多选题，3：判断题
      if (!this._window) return;
      if (question.type === '0' || question.type === '1') {
        question.answer.forEach((answer) => {
          for (const key in question.options) {
            if (key === this.removeHtml(answer)) {
              if (['zj', 'zy'].includes(this.type)) {
                const optionElement = question.options[key];
                if (optionElement.getAttribute('aria-checked') === 'true') {
                  return;
                }

                optionElement == null ? void 0 : optionElement.click();
              } else if (['ks'].includes(this.type)) {
                console.log('key');

                const optionElement = question.options[key];
                console.log(optionElement);
                if (
                  optionElement.querySelector('.check_answer') ||
                  optionElement.querySelector('.check_answer_dx')
                ) {
                  return;
                }

                optionElement?.click();
              }
            }
          }
        });
      } else if (question.type === '2') {
        const textareaElements = question.element.querySelectorAll('textarea');
        if (textareaElements.length === 0) return;
        textareaElements.forEach((textareaElement, index) => {
          try {
            const ueditor = this._window.UE.getEditor(textareaElement.name);
            ueditor.setContent(question.answer[index]);
          } catch (e) {
            textareaElement.value = '';
          }
        });
      } else if (question.type === '3') {
        let answer = 'true';
        if (
          question.answer[0].match(/(^|,)(正确|是|对|√|T|ri|right|true)(,|$)/)
        ) {
          answer = 'true';
        } else if (
          question.answer[0]
            .toString()
            .match(/(^|,)(错误|否|错|×|F|wr|wrong|false)(,|$)/)
        ) {
          answer = 'false';
        }
        const trueOrFalse = {
          true: '对',
          false: '错',
        };
        for (const key in question.options) {
          if (['zj', 'zy'].includes(this.type)) {
            if (
              (_a = question.options[key].getAttribute('aria-label')) == null
                ? void 0
                : _a.includes(`${trueOrFalse[answer]}选择`)
            ) {
              if (question.options[key].getAttribute('aria-checked') === 'true')
                return;
              (_b = question.options[key]) == null ? void 0 : _b.click();
            }
          } else if (['ks'].includes(this.type)) {
            const optionElement = question.options[key].querySelector(
              `span[data='${answer}']`
            );
            if (
              optionElement == null
                ? void 0
                : optionElement.querySelector('.check_answer')
            )
              return;
            optionElement == null ? void 0 : optionElement.click();
          }
        }
      } else if (question.type === '4' || question.type === '6') {
        const textareaElement = question.element.querySelector('textarea');
        if (!textareaElement) return;
        const ueditor = this._window.UE.getEditor(textareaElement.name);
        ueditor.setContent(question.answer[0]);
      } else;
    });
    this.type = type;
    if (iframe) {
      this._document = iframe.contentDocument;
      this._window = iframe.contentWindow;
    }
  }
  extractOptions(optionElements, optionSelector) {
    const optionsObject = {};
    const optionTexts = [];
    optionElements.forEach((optionElement) => {
      var _a;
      const optionTextContent = this.removeHtml(
        ((_a = optionElement.querySelector(optionSelector)) == null
          ? void 0
          : _a.innerHTML) || ''
      );
      optionsObject[optionTextContent] = optionElement;
      optionTexts.push(optionTextContent);
    });
    return [optionsObject, optionTexts];
  }
  addQuestions(questionElements) {
    questionElements.forEach((questionElement) => {
      var _a, _b, _c, _d;
      let questionTitle = '';
      let questionTypeText = '';
      let optionElements;
      let optionsObject = {};
      let optionTexts = [];
      if (['zy', 'ks'].includes(this.type)) {
        const titleElement =
          ((_a =
            questionElement == null
              ? void 0
              : questionElement.querySelector('h3')) == null
            ? void 0
            : _a.innerHTML) || '';
        const colorShallowElement =
          ((_b = questionElement.querySelector('.colorShallow')) == null
            ? void 0
            : _b.outerHTML) || '';
        if (['zy'].includes(this.type)) {
          questionTypeText =
            (questionElement == null
              ? void 0
              : questionElement.getAttribute('typename')) || '';
        } else if (['ks'].includes(this.type)) {
          questionTypeText =
            this.removeHtml(colorShallowElement).slice(1, 4) || '';
        }
        questionTitle = this.removeHtml(
          titleElement.split(colorShallowElement || '')[1] || ''
        );
        optionElements = questionElement.querySelectorAll('.answerBg');
        [optionsObject, optionTexts] = this.extractOptions(
          optionElements,
          '.answer_p'
        );
      } else if (['zj'].includes(this.type)) {
        questionTitle = this.removeHtml(
          ((_c = questionElement.querySelector('.fontLabel')) == null
            ? void 0
            : _c.innerHTML) || ''
        );
        questionTypeText = this.removeHtml(
          ((_d = questionElement.querySelector('.newZy_TItle')) == null
            ? void 0
            : _d.innerHTML) || ''
        );
        optionElements = questionElement.querySelectorAll(
          '[class*="before-after"]'
        );
        [optionsObject, optionTexts] = this.extractOptions(
          optionElements,
          '.fl.after'
        );
      }
      this.questions.push({
        element: questionElement,
        type:
          this.questionType[
            questionTypeText.replace('【', '').replace('】', '')
          ] || '999',
        title: this.clean(questionTitle),
        optionsText: optionTexts,
        options: optionsObject,
        answer: [],
        workType: this.type,
        refer: this._window?.location?.href,
      });
    });
  }
}

// 处理任务点：作业
const processWork = async (iframe, iframeDocument, iframeWindow) => {
  addLog({
    value: `处理作业任务点`,
    type: 'info',
  });
  addLog({
    value: `发现一个作业，正在解析`,
    type: 'warning',
  });
  return new Promise(async (resolve) => {
    if (!iframeDocument) return resolve();
    if (
      iframeDocument.documentElement.innerText.includes('已完成') ||
      iframeDocument.documentElement.innerText.includes('待批阅')
    ) {
      addLog({
        value: `作业已经完成，跳过`,
        type: 'success',
      });

      return resolve();
    }
    crackFont(iframeDocument); // 解密
    addLog({
      value: `题目列表获取成功`,
      type: 'primary',
    });
    await sleep(2);
    const correctRate = await new CxQuestionHandler('zj', iframe)?.init(); // 答题
    if (configStore.platformParams.cx.autoNext) {
      addLog({
        value: `自动提交已开启，尝试提交`,
        type: 'primary',
      });

      if (correctRate < configStore.otherParams.rate) {
        addLog({
          value: `正确率小于${configStore.otherParams.rate}%，暂存`,
          type: 'danger',
        });

        await iframeWindow.noSubmit();
      } else {
        addLog({
          value: `正确率大于${configStore.otherParams.rate}%，提交`,
          type: 'success',
        });
        await iframeWindow.btnBlueSubmit();
        await sleep(configStore.otherParams.timeInterval / 2);
        await iframeWindow.submitCheckTimes();
        addLog({
          value: `提交成功`,
          type: 'success',
        });
      }
    } else {
      addLog({
        value: `未开启自动提交，暂存`,
        type: 'primary',
      });
      await iframeWindow.noSubmit();
    }
    addLog({
      value: `作业已完成`,
      type: 'success',
    });

    return resolve();
  });
};

// 工具函数：递归获取所有嵌套 iframe
const getAllNestedIframes = (documentElement) => {
  const iframes = [];
  const scan = (doc) => {
    const frames = doc.querySelectorAll('iframe');
    frames.forEach((iframe) => {
      try {
        iframes.push(iframe);
        if (iframe.contentDocument) {
          scan(iframe.contentDocument);
        }
      } catch (e) {
        console.warn('无法访问跨域 iframe:', iframe.src);
      }
    });
  };
  scan(documentElement);
  return iframes;
};

// 主函数：遍历并处理所有 iframe
const watchIframe = (documentElement) => {
  const iframes = getAllNestedIframes(documentElement);
  // 按顺序处理每个 iframe
  iframes
    .reduce((promiseChain, iframe) => {
      return promiseChain.then(() => processIframe(iframe));
    }, Promise.resolve())
    .then(async () => {
      addLog({
        value: `本页任务点已全部完成，正前往下一章节`,
        type: 'success',
      });
      await sleep(2);

      // 检查是否需要跳转到下一章节
      if (configStore.platformParams.cx.autoNext) {
        const nextBtn = documentElement.querySelector('#prevNextFocusNext');
        if (!nextBtn || nextBtn.style.display === 'none') {
          addLog({
            value: `已经到达最后一章节，无法跳转`,
            type: 'danger',
          });
        } else {
          await sleep(2);
          document
            ?.querySelector('.jb_btn.jb_btn_92.fr.fs14.nextChapter')
            ?.click();
        }
      } else {
        addLog({
          value: `已经关闭自动下一章节，在设置里可更改`,
          type: 'danger',
        });
      }
    });
};

const processIframeTask = () => {
  const documentElement = document.documentElement;
  const iframe = documentElement.querySelector('iframe');
  if (!iframe) {
    console.warn('No iframe found.');
    return;
  }
  watchIframe(documentElement);
  iframe.addEventListener('load', function () {
    watchIframe(documentElement);
  });
};
const setupInterceptor = () => {
  let currentUrl = window.location.href;
  setInterval(() => {
    if (currentUrl !== window.location.href) {
      currentUrl = window.location.href;
      processIframeTask();
    }
  }, 5000);
};
const useCxChapterFunc = () => {
  const init = () => {
    if (!window.location.href.includes('&mooc2=1')) {
      window.location.href = currentUrl + '&mooc2=1';
    }
    addLog({
      value: `检测到用户进入到章节学习页面`,
      type: 'primary',
    });
    addLog({
      value: `正在解析任务点，请稍等（如长时间没有反应，请刷新页面）`,
      type: 'warning',
    });
  };
  init();
  processIframeTask();
  setupInterceptor();
};
const useCxWorkLogicFunc = async () => {
  addLog({
    value: `进入新版作业页面，开始准备答题`,
    type: 'primary',
  });
  addLog({
    value: `正在解析题目, 请等待`,
    type: 'warning',
  });
  await new CxQuestionHandler('zy').init();
};
const useCxExamLogicFunc = async () => {
  addLog({
    value: `进入新版考试页面，开始准备答题`,
    type: 'primary',
  });
  addLog({
    value: `正在解析题目, 请等待`,
    type: 'warning',
  });
  await new CxQuestionHandler('ks').init();
  if (configStore.platformParams.cx.autoNext) {
    addLog({
      value: `自动切换已开启，正在前往下一题`,
      type: 'success',
    });
    await sleep(configStore.otherParams.timeInterval);
    _unsafeWindow.getTheNextQuestion(1);
  } else {
    addLog({
      value: `已经关闭自动切换，在设置里可更改`,
      type: 'danger',
    });
  }
};
// const hookError = () => {
//   console.log('hookError');
//   const oldset = _unsafeWindow.setInterval;
//   const oldout = _unsafeWindow.setTimeout;
//   _unsafeWindow.setInterval = function (...args) {
//     const err = new Error();
//     if (err.stack && err.stack.indexOf('checkoutNotTrustScript') !== -1) {
//       return -1;
//     }
//     return oldset.call(this, ...args);
//   };
//   _unsafeWindow.setTimeout = function (...args) {
//     const err = new Error();
//     if (err.stack && err.stack.indexOf('checkoutNotTrustScript') !== -1) {
//       return -1;
//     }
//     return oldout.call(this, ...args);
//   };
// };
// const useZhsAnswerLogicFunc = async () => {
//   hookError();
//   const logStore = useLogStore();
//   useConfigStore();
//   logStore.addLog(`进入答题页面，开始准备答题`, 'primary');
//   logStore.addLog(`正在解析题目, 请等待5s`, 'warning');
//   new XMLHttpRequestInterceptor(['gateway/t/v1/answer/hasAnswer'], async () => {
//     await sleep(1);
//     _unsafeWindow.document.getSelection = function () {
//       return {
//         removeAllRanges: function () {},
//       };
//     };
//     _unsafeWindow.document.onselectstart = true;
//     _unsafeWindow.document.oncontextmenu = true;
//     _unsafeWindow.document.oncut = true;
//     _unsafeWindow.document.oncopy = true;
//     _unsafeWindow.document.onpaste = true;
//     await new ZhsQuestionHandler().init();
//     return true;
//   });
// };
const getFunc = () => {
  const urlLogicPairs = [
    { keyword: '/mycourse/studentstudy', logic: useCxChapterFunc },
    { keyword: '/mooc2/work/dowork', logic: useCxWorkLogicFunc },
    { keyword: '/exam-ans/exam', logic: useCxExamLogicFunc },
    { keyword: '/exam-ans/mooc2/exam/preview', logic: useCxExamLogicFunc },
    {
      keyword: 'mycourse/stu?courseid',
      logic: () => {
        addLog({
          value: `该页面无任务，请进入章节或答题页面使用`,
          type: 'error',
        });
      },
    },
    // { keyword: '/stuExamWeb.html', logic: useZhsAnswerLogicFunc },
  ];
  const executeLogicByUrl = () => {
    for (const { keyword, logic } of urlLogicPairs) {
      if (window.location.href.includes(keyword)) {
        logic();
        configStore.isShow = true;
        return;
      }
    }
    configStore.isShow = false;
  };
  executeLogicByUrl();
};

const keyInput = (value) => {
  if (value) {
    userInfoStore.key = value;
  }
};
const clearKey = () => {
  userInfoStore.key = null;
};
onMounted(() => {
  // if (localStorage.getItem('keys')) {
  //   configStore.keys = localStorage.getItem('keys');
  // }
  // logStore.addLog('用户悉知：使用脚本即为完全同意用户协议', 'success');
  // validateKeys();

  addLog({
    value: `脚本加载成功，正在解析网页`,
    type: 'primary',
  });
  addLog({
    value: `请不要多个脚本同时使用，会有脚本冲突问题`,
    type: 'warning',
  });
  addLog({
    value: `如果脚本出现异常，请用谷歌、火狐等浏览器`,
    type: 'warning',
  });
  getFunc();
});
</script>
<template>
  <DraggableDialog :boundary="true" axis="both" v-if="configStore.isShow">
    <div class="tab-bar">
      <el-button
        v-for="tab in configStore.tabBar"
        :key="tab.value"
        :size="configStore.sizes"
        @click="configStore.activeTab = tab.value"
        :type="configStore.activeTab === tab.value ? 'primary' : ''"
      >
        {{ tab.label }}
      </el-button>
    </div>
    <div v-if="configStore.activeTab === 'log'">
      <div class="log-generation">
        <div
          v-for="item in configStore.logData"
          :key="item"
          class="log-item"
          :class="[item.type]"
        >
          <span class="mr-6">{{ item.time }}</span>
          <span>{{ item.value }}</span>
        </div>
      </div>
    </div>
    <div v-if="configStore.activeTab === 'settings'">
      <div class="settings-section">
        <span class="title">答题模式</span>
        <el-switch
          v-model="configStore.platformParams.cx.answeringMode"
          active-text="只答题，不做其他"
          inline-prompt
        ></el-switch>
      </div>
      <div class="settings-section">
        <span class="title">自动切换</span>
        <el-switch
          v-model="configStore.platformParams.cx.autoNext"
          active-text="自动跳转下一章节"
          inline-prompt
        ></el-switch>
      </div>

      <div class="settings-section">
        <span class="title">答题正确率</span>
        <el-input-number
          v-model="configStore.otherParams.rate"
          v-bind="{ inputNumberAttr }"
          :min="50"
          :max="90"
        />
      </div>
    </div>
    <div v-if="configStore.activeTab === 'guide'" class="guide">
      <div class="section">
        <p>
          1、如需填写卡密，依次操作：[1] 点击标签页"答题" --> [2] 在文本框内填写
          --> [3] 刷新
        </p>
      </div>
      <div class="tip">
        <div class="title">注意</div>
        <p>1、卡密可通过微信搜索 "AT搜题" 免费获取</p>
      </div>
    </div>
    <div v-if="configStore.activeTab === 'keys'" class="keys">
      <div class="validate-key">
        <el-input
          v-model.trim="configStore.key"
          style="width: 100%"
          placeholder="输入卡密，在指南中查看卡密获取方式"
          clearable
          @input="keyInput"
          @clear="clearKey"
        />
      </div>
    </div>
  </DraggableDialog>
</template>
<style lang="scss" scoped>
.tab-bar {
  margin-bottom: 16px;
}
.log-generation {
  max-height: 260px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 3px;
  }
  .log-item {
    border-bottom: 1px solid #ccc;
    border-radius: 3px;
    padding: 2px;
    margin-bottom: 6px;
    font-size: 12px;
  }
  .mr-6 {
    margin-right: 6px;
  }
  .warning {
    color: #e6a23c;
  }
  .error {
    color: #dc3545;
  }

  .success {
    color: #67c23a;
  }

  .default {
    color: #909399;
  }

  .primary {
    color: #409eff;
  }
}
.settings-section {
  display: flex;
  align-items: center;
  .title {
    width: 85px;
    font-size: 12px;
    font-weight: 400;
  }
}
.guide {
  .section {
    p {
      line-height: 24px;
      color: #303133;
    }
  }

  .tip {
    margin: 10px 0;
    .title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    p {
      color: #dc3545;
    }
  }
}
.keys {
  .userinfo {
    margin: 20px 0 0;

    .el-row {
      margin-bottom: 10px;
    }
  }
  .validate-key {
    margin: 10px 0 0;
    display: flex;
    gap: 10px;
  }
  .key-btn {
    width: 100%;
    margin: 18px auto;
  }
}
</style>
