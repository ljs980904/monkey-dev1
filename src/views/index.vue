<script setup>
import {
  Operation,
  Key,
  Comment,
  List,
  QuestionFilled,
  Tools,
  Notebook,
  Warning,
} from '@element-plus/icons-vue';
import useUserInfoStore from '../stores/user'; //引入仓库
import DraggableDialog from '../components/draggable-dialog.vue';
import { crackFont } from '../utils/crack-font';
import { sleep } from '../utils';
import {
  simulateRequest,
  tabBars,
  settings,
  guide,
  inputNumberAttr,
  protocol,
} from './model';
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
  activeTab: 'settings',
  // avatarSrc:
  //   'https://public.readdy.ai/ai/img_res/2d58579252345596c10002ce85d4f6f8.jpg',
  workUrl: window.location.href,
  key: userInfoStore.key, // keys
  validatedKeys: false, // 是否验证
  // url: 'https://autohelper.top/prod-api/question/dpQuestion',
  url: 'http://localhost:8080/question/dpQuestion',
});

const column = [
  {
    prop: 'title',
    label: '题目',
  },
  {
    prop: 'answer',
    label: '答案',
    width: '140',
  },
];
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
      type: 'warning',
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
      type: 'warning',
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
          type: 'success',
        });
        for (const [index, question] of this.questions.entries()) {
          try {
            const resp = await simulateRequest(
              configStore.url,
              question,
              _unsafeWindow,
              configStore.key
            );
            const { answer, count } = resp;
            question.source = resp.source;
            if (answer?.length) {
              question.answer = answer;
              this.fillQuestion(question);
              addLog({
                value: `第${index + 1}道题搜索成功，剩余次数：${count}`,
                type: 'success',
              });
              this.correctNum += 1;
            } else {
              addLog({
                value: `第${index + 1}道题没有找到答案`,
                type: 'warning',
              });
            }
            userInfoStore.questionList = [question];
          } catch (error) {
            addLog({
              value: `第${index + 1}道题搜索失败`,
              type: 'error',
            });
          } finally {
            if (!this._document) {
              let _a = this._document;
              await _a.querySelectorAll('.switch-btn-box > button')[1].click();
            }
            await sleep(2);
          }
        }
      }
      if (this.questions.length === 0) {
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
        debugger;
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
      type: 'success',
    });
    await sleep(2);
    const correctRate = await new CxQuestionHandler('zj', iframe)?.init(); // 答题
    if (configStore.platformParams.cx.autoNext) {
      addLog({
        value: `自动提交已开启，尝试提交`,
        type: 'warning',
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
        type: 'warning',
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
      type: 'success',
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
    type: 'success',
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
    type: 'success',
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

const validateKey = () => {
  if (!configStore.key) {
    addLog({
      value: `请先输入卡密`,
      type: 'warning',
    });
    return;
  }
  userInfoStore.key = configStore.key;
};

const clearKey = () => {
  userInfoStore.key = null;
};

onMounted(() => {
  userInfoStore.questionList = [];
  addLog({
    value: `请不要多个脚本同时使用，会有脚本冲突问题`,
    type: 'warning',
  });
  addLog({
    value: `如果脚本出现异常，请用谷歌、火狐等浏览器`,
    type: 'warning',
  });
  addLog({
    value: `脚本加载成功，正在解析网页`,
    type: 'success',
  });
  getFunc();
});
</script>
<template>
  <DraggableDialog :boundary="true" axis="both" v-if="configStore.isShow">
    <div class="tab-bar">
      <div
        v-for="tab in tabBars"
        :key="tab.value"
        :size="configStore.sizes"
        @click="configStore.activeTab = tab.value"
        class="tab-bar-item"
        :class="[configStore.activeTab === tab.value ? 'active' : '']"
      >
        <el-icon>
          <Key v-if="tab.value === 'key'" />
          <Tools v-if="tab.value === 'settings'" />
          <QuestionFilled v-if="tab.value === 'help'" />
          <Warning v-if="tab.value === 'protocol'" />
        </el-icon>
        {{ tab.label }}
      </div>
    </div>
    <div class="content-body">
      <template v-if="configStore.activeTab === 'key'" class="keys">
        <div class="validate-key body-box">
          <div class="card-title">
            <el-icon :size="18" color="#4a90e2"><Key /></el-icon>授权管理
          </div>
          <el-input
            v-model.trim="configStore.key"
            style="width: 100%"
            placeholder="输入卡密、在指南中查看卡密获取方式"
            clearable
            @clear="clearKey"
          />
          <div class="start-parse" @click="validateKey">验证卡密</div>
          <div style="margin-top: 16px">
            <div class="card-title">
              <el-icon :size="18" color="#4a90e2"><List /></el-icon>题目列表
            </div>
            <el-table
              v-if="userInfoStore.questionList.length"
              :data="userInfoStore.questionList"
              style="width: 100%"
              :show-header="false"
            >
              <el-table-column v-for="c in column" :key="c" v-bind="c" />
            </el-table>
          </div>
        </div>
      </template>
      <template v-if="configStore.activeTab === 'settings'">
        <div class="body-box">
          <div class="card-title">
            <el-icon :size="18" color="#4a90e2"><Operation /></el-icon>功能配置
          </div>
          <div class="settings-main">
            <div
              v-for="setting in settings"
              class="settings-section"
              :key="setting.value"
            >
              <div class="title">
                <span class="title-text">{{ setting.name }}</span>
                <span class="sub-title">{{ setting.desc }}</span>
              </div>
              <el-switch
                v-if="setting.value === 'answeringMode'"
                class="settings-switch"
                v-model="configStore.platformParams.cx.answeringMode"
                inline-prompt
              />
              <el-switch
                v-if="setting.value === 'autoNext'"
                class="settings-switch"
                v-model="configStore.platformParams.cx.autoNext"
                inline-prompt
              />
              <el-input-number
                v-if="setting.value === 'rate'"
                class="settings-switch"
                v-model="configStore.otherParams.rate"
                v-bind="{ inputNumberAttr }"
                :min="60"
                :max="90"
              />
            </div>
          </div>
        </div>
      </template>
      <template v-if="configStore.activeTab === 'help'" class="guide">
        <div class="guide body-box">
          <div class="card-title">
            <el-icon :size="18" color="#4a90e2"><Notebook /></el-icon>使用指南
          </div>
          <div class="guide-content">
            <div
              v-for="item in guide"
              :key="item.index"
              class="guide-content-item"
            >
              <div class="guide-content-index">{{ item.index }}</div>
              <div class="guide-content-content">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="configStore.activeTab === 'protocol'" class="guide">
        <div class="guide body-box">
          <div class="card-title">
            <el-icon :size="18" color="#f56c6c"><Warning /></el-icon>协议
          </div>
          <div class="guide-content">
            <div
              v-for="item in protocol"
              :key="item.index"
              class="guide-content-item"
            >
              <div class="guide-content-index">{{ item.index }}</div>
              <div class="guide-content-content">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- <div class="start-parse" @click="getFunc">
        <el-icon :size="18"><VideoPlay /></el-icon>开始解析
      </div> -->
      <div
        class="log-generation body-box"
        v-if="configStore.activeTab !== 'protocol'"
      >
        <div class="card-title">
          <el-icon :size="18"><Comment /></el-icon>
          操作反馈
        </div>
        <div class="log-generation-content">
          <el-alert
            v-for="item in configStore.logData"
            :key="item.time"
            :title="item.value"
            :type="item.type"
            show-icon
            :closable="false"
            style="margin-bottom: 8px; border-radius: 4px"
            ><template #title>
              <span class="value">{{ item.value }}</span>
            </template>
          </el-alert>
        </div>
      </div>
    </div>
  </DraggableDialog>
</template>
<style lang="scss" scoped>
.tab-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 8px;
  box-sizing: border-box;
  .tab-bar-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 4px;
    text-align: center;
    font-size: 14px;
    font-family: Roboto;
    font-weight: normal;
    line-height: 21px;
    text-align: center;
    letter-spacing: 0px;
    font-feature-settings: 'kern' on;
    &:hover {
      background-color: #e6f7ff;
      color: #4a90e2;
    }
    &.active {
      background-color: #e6f7ff;
      color: #4a90e2;
    }
  }
}
.content-body {
  padding: 16px;
  box-sizing: border-box;
  background-color: #f5f5f5;
}
.body-box {
  border-radius: 8px;
  opacity: 1;
  /* 自动布局 */
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 0px 10px;
  flex-wrap: wrap;
  align-content: flex-start;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.001), rgba(0, 0, 0, 0.001)),
    #ffffff;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
}
.card-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: Roboto;
  font-size: 14px;
  font-weight: 600;
  line-height: 21px;
  letter-spacing: 0px;

  font-feature-settings: 'kern' on;
  color: #333333;
  margin-bottom: 8px;
}
.start-parse {
  /* 自动布局子元素 */
  cursor: pointer;
  height: 40px;
  line-height: 40px;
  border-radius: 4px;
  opacity: 1;
  margin: 18px 0;
  /* 自动布局 */

  background: #3b82f6;

  /* 自动布局子元素 */

  font-family: Roboto;
  font-size: 14px;
  font-weight: 500;

  text-align: center;
  letter-spacing: 0px;

  font-feature-settings: 'kern' on;
  color: #ffffff;
}
.log-generation {
  box-sizing: border-box;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1);
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.001), rgba(0, 0, 0, 0.001)),
    #ffffff;
  margin-top: 16px;
  .log-generation-content {
    width: 100%;
    max-height: 120px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 2px;
    }
  }
  .value {
    color: #000000;
    font-size: 13px;
    font-weight: normal;
    line-height: 20px;
    letter-spacing: 0px;
    font-feature-settings: 'kern' on;
    font-family: Roboto;
  }
}

.settings-main {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.settings-section {
  width: 100%;
  display: flex;
  align-items: center;

  .settings-switch {
    margin-left: auto;
  }
  .title {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .title-text {
      height: 24px;
      opacity: 1;
      background: rgba(0, 0, 0, 0);
      opacity: 1;
      font-family: Roboto;
      font-size: 16px;
      font-weight: normal;
      line-height: 24px;
      letter-spacing: 0px;
      font-feature-settings: 'kern' on;
      color: #000000;
    }
    .sub-title {
      opacity: 1;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      line-height: 18px;
      letter-spacing: 0px;

      font-feature-settings: 'kern' on;
      color: #666666;
    }
  }
}

.guide {
  .guide-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
    .guide-content-item {
      display: flex;
      align-items: start;
      gap: 10px;
      .guide-content-index {
        width: 20px;
        height: 20px;
        text-align: center;
        line-height: 20px;
        border-radius: 50%;
        background-color: #e6f7ff;
        color: #53aeed;
      }
      .guide-content-content {
        flex: 1;
        color: #333333;
        font-size: 13px;
      }
    }
  }
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
    cursor: pointer;
    width: 100%;
    margin: 18px auto;
  }
}
</style>
