class BaseQuestionHandler {
  constructor() {
    __publicField(this, '_document', document);
    __publicField(this, '_window', _unsafeWindow);
    __publicField(this, 'addLog');
    __publicField(this, 'addQuestion');
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
    const logStore = useLogStore();
    const questionStore = useQuestionStore();
    this.addLog = logStore.addLog;
    this.addQuestion = questionStore.addQuestion;
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
        this.addLog(`成功解析到${this.questions.length}个题目`, 'primary');
        for (const [index, question] of this.questions.entries()) {
          const answerData = await getAnswer(question);
          if (answerData.code === 200) {
            question.answer = answerData.data.answer;
            this.fillQuestion(question);
            this.addLog(`第${index + 1}道题搜索成功`, 'success');
            this.addLog(`剩余次数:${answerData.data.num}`, 'primary');
            this.correctNum += 1;
          } else {
            this.addLog(
              `第${index + 1}道题搜索失败，点击上方答题查看原因`,
              'danger'
            );
            question.answer[0] = answerData.msg;
          }
          this.addQuestion(question);
        }
      } else this.addLog('未解析到题目，请进入正确页面', 'danger');
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
      if (!this._window) return;
      if (question.type === '0' || question.type === '1') {
        question.answer.forEach((answer) => {
          for (const key in question.options) {
            if (key === this.removeHtml(answer)) {
              if (['zj', 'zy'].includes(this.type)) {
                const optionElement = question.options[key];
                if (optionElement.getAttribute('aria-checked') === 'true')
                  return;
                optionElement == null ? void 0 : optionElement.click();
              } else if (['ks'].includes(this.type)) {
                const optionElement = question.options[key];
                if (optionElement.querySelector('.check_answer')) return;
                if (optionElement.querySelector('.check_answer_dx')) return;
                optionElement == null ? void 0 : optionElement.click();
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
          question.answer[0].match(/(^|,)(错误|否|错|×|F|wr|wrong|false)(,|$)/)
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
        refer: this._window.location.href,
      });
    });
  }
}
class XMLHttpRequestInterceptor {
  constructor(urlList, callback) {
    __publicField(this, 'xhr');
    __publicField(this, 'originalOpen');
    __publicField(this, 'originalSend');
    __publicField(this, 'callback');
    this.xhr = new XMLHttpRequest();
    this.originalOpen = this.xhr.open;
    this.originalSend = this.xhr.send;
    this.callback = callback;
    this.intercept(urlList);
  }
  intercept(urlList) {
    const self = this;
    XMLHttpRequest.prototype.open = function (method, url2) {
      self.originalOpen.apply(this, [method, url2]);
      const shouldIntercept = urlList.some((urlItem) => url2.includes(urlItem));
      if (shouldIntercept) {
        self.callback(this.responseText);
      }
    };
  }
}
const useZhsAnswerLogic = async () => {
  hookError();
  const logStore = useLogStore();
  useConfigStore();
  logStore.addLog(`进入答题页面，开始准备答题`, 'primary');
  logStore.addLog(`正在解析题目, 请等待5s`, 'warning');
  new XMLHttpRequestInterceptor(['gateway/t/v1/answer/hasAnswer'], async () => {
    await sleep(1);
    _unsafeWindow.document.getSelection = function () {
      return {
        removeAllRanges: function () {},
      };
    };
    _unsafeWindow.document.onselectstart = true;
    _unsafeWindow.document.oncontextmenu = true;
    _unsafeWindow.document.oncut = true;
    _unsafeWindow.document.oncopy = true;
    _unsafeWindow.document.onpaste = true;
    await new ZhsQuestionHandler().init();
    return true;
  });
};

const useConfigStore = pinia.defineStore('configStore', {
  state: () => {
    const scriptInfo = getScriptInfo();
    const defaultConfig = {
      version: scriptInfo.version,
      isMinus: false,
      position: {
        x: '800px',
        y: '200px',
      },
      menuIndex: '0',
      platformName: 'cx',
      platformParams: {
        cx: {
          name: '超星网课助手',
          parts: [
            {
              name: '章节设置',
              params: [
                //     {
                //     name: '视频速率',
                //     value: 1,
                //     type: 'number',
                // },
                {
                  name: '章节作业自动提交',
                  value: true,
                  type: 'boolean',
                },
                {
                  name: '是否自动下一章节',
                  value: true,
                  type: 'boolean',
                },
                {
                  name: '只答题，不做其他',
                  value: false,
                  type: 'boolean',
                },
              ],
            },
            {
              name: '考试设置',
              params: [
                {
                  name: '是否自动切换',
                  value: true,
                  type: 'boolean',
                },
              ],
            },
          ],
        },
        zhs: {
          name: '智慧树网课助手',
          parts: [
            {
              name: '答题设置',
              params: [
                {
                  name: '是否自动切换',
                  value: true,
                  type: 'boolean',
                },
              ],
            },
          ],
        },
        unknown: {
          name: '未知平台',
          parts: [
            {
              name: '答题设置',
              params: [
                {
                  name: '是否自动切换',
                  value: true,
                  type: 'boolean',
                },
              ],
            },
          ],
        },
      },
      // 没答案自动选择
      otherParams: {
        name: '其他参数',
        params: [
          //     {
          //     name: '没答案随机选择',
          //     value: true,
          //     type: 'boolean',
          // },
          {
            name: '切换、答题间隔，单位秒',
            value: 3,
            type: 'number',
          },
          {
            name: '正确率达到多少自动提交',
            value: 85,
            type: 'number',
          },
        ],
      },
      queryApis: [
        {
          name: '题库',
          token: '',
          url: 'http://api.tikuhai.com',
        },
        // {
        //     name: '一之题库',
        //     token: '',
        //     url: "http://api.tikuhai.com"
        // }
      ],
    };
    let globalConfig = defaultConfig;
    const storedConfig = _GM_getValue('config');
    if (storedConfig) {
      try {
        const parsedStoredConfig = JSON.parse(storedConfig);
        if (scriptInfo.version === parsedStoredConfig.version) {
          globalConfig = parsedStoredConfig;
        } else {
          parsedStoredConfig.version = scriptInfo.version;
          globalConfig = parsedStoredConfig;
        }
      } catch (error) {
        console.error(error);
      }
    }
    _GM_setValue('globalConfig', JSON.stringify(globalConfig));
    return globalConfig;
  },
  actions: {},
});
const useCxChapterLogic = () => {
  const logStore = useLogStore();
  const init = () => {
    const currentUrl = window.location.href;
    if (!currentUrl.includes('&mooc2=1')) {
      window.location.href = currentUrl + '&mooc2=1';
    }
    logStore.addLog(`检测到用户进入到章节学习页面`, 'primary');
    logStore.addLog(
      `正在解析任务点，请稍等5-10秒（如果长时间没有反应，请刷新页面）`,
      'warning'
    );
  };
  const configStore = useConfigStore();
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
    }, 2e3);
  };
  let currentWatchIframeTaskId = 0;
  const watchIframe = (documentElement) => {
    const thisTaskId = ++currentWatchIframeTaskId;
    IframeUtils.getAllNestedIframes(documentElement).subscribe((allIframes) => {
      console.log(allIframes);
      rxjs
        .from(allIframes)
        .pipe(concatMap((iframe) => processIframe(iframe)))
        .subscribe({
          complete: async () => {
            if (thisTaskId === currentWatchIframeTaskId) {
              logStore.addLog(
                `本页任务点已全部完成，正前往下一章节`,
                'success'
              );
              if (configStore.platformParams.cx.parts[0].params[1].value) {
                const nextBtn =
                  documentElement.querySelector('#prevNextFocusNext');
                if (!nextBtn || nextBtn.style.display === 'none') {
                  logStore.addLog(`已经到达最后一章节，无法跳转`, 'danger');
                } else {
                  await sleep(configStore.otherParams.params[0].value);
                  document
                    .querySelector('.jb_btn.jb_btn_92.fr.fs14.nextChapter')
                    .click();
                }
              } else {
                logStore.addLog(
                  `已经关闭自动下一章节，在设置里可更改`,
                  'danger'
                );
              }
            }
          },
        });
    });
  };
  const processMedia = async (mediaType, iframeDocument) => {
    return new Promise((resolve) => {
      logStore.addLog(`发现一个${mediaType}，正在解析`, 'warning');
      logStore.addLog(`正在尝试播放${mediaType}，请稍等5s`, 'primary');
      let isExecuted = false;
      logStore.addLog('播放成功', 'success');

      const intervalId = setInterval(async () => {
        const mediaElement =
          iframeDocument.documentElement.querySelector(mediaType);
        if (mediaElement && !isExecuted) {
          await mediaElement.pause();
          mediaElement.muted = true;
          await mediaElement.play();
          const listener = async () => {
            await sleep(configStore.otherParams.params[0].value);
            await mediaElement.play();
          };
          mediaElement.addEventListener('pause', listener);
          mediaElement.addEventListener('ended', () => {
            logStore.addLog(`${mediaType}已播放完成`, 'success');
            mediaElement.removeEventListener('pause', listener);
            resolve();
          });
          isExecuted = true;
          clearInterval(intervalId);
        }
      }, 2500);
    });
  };
  const processWork = async (iframe, iframeDocument, iframeWindow) => {
    logStore.addLog('发现一个作业，正在解析', 'warning');
    return new Promise(async (resolve) => {
      if (!iframeDocument) return resolve();
      if (
        iframeDocument.documentElement.innerText.includes('已完成') ||
        iframeDocument.documentElement.innerText.includes('待批阅')
      ) {
        logStore.addLog('作业已经完成，跳过', 'success');
        return resolve();
      }
      decrypt(iframeDocument);
      logStore.addLog(`题目列表获取成功`, 'primary');
      const correctRate = await new CxQuestionHandler('zj', iframe).init();
      iframeWindow.alert = () => {};
      if (configStore.platformParams.cx.parts[0].params[0].value) {
        logStore.addLog('自动提交已开启，尝试提交', 'primary');
        if (correctRate < Number(configStore.otherParams.params[1].value)) {
          logStore.addLog(
            `正确率小于${configStore.otherParams.params[1].value}%，暂存`,
            'danger'
          );
          await iframeWindow.noSubmit();
        } else {
          logStore.addLog(
            `正确率大于${configStore.otherParams.params[1].value}%，提交`,
            'success'
          );
          await iframeWindow.btnBlueSubmit();
          await sleep(configStore.otherParams.params[0].value / 2);
          await iframeWindow.submitCheckTimes();
          logStore.addLog('提交成功', 'success');
        }
      } else {
        logStore.addLog('未开启自动提交，暂存', 'primary');
        await iframeWindow.noSubmit();
      }
      logStore.addLog('作业已完成', 'success');
      return resolve();
    });
  };
  const processPpt = async (iframeWindow) => {
    const pptWindow =
      iframeWindow.document.querySelector('#panView').contentWindow;
    logStore.addLog('发现一个PPT，正在解析', 'warning');
    await pptWindow.scrollTo({
      top: pptWindow.document.body.scrollHeight,
      behavior: 'smooth',
    });
    logStore.addLog('阅读完成', 'success');
    return Promise.resolve();
  };
  const processBook = async (iframeWindow) => {
    logStore.addLog('发现一个电子书，正在解析', 'warning');
    _unsafeWindow.top.onchangepage(iframeWindow.getFrameAttr('end'));
    logStore.addLog('阅读完成', 'success');
    return Promise.resolve();
  };
  const waitIframeLoad = async (iframe) => {
    return new Promise((resolve) => {
      const intervalId = setInterval(async () => {
        var _a;
        if (
          iframe.contentDocument &&
          ((_a = iframe.contentDocument) == null ? void 0 : _a.readyState) ==
            'complete'
        ) {
          resolve();
          clearInterval(intervalId);
        }
      }, 500);
    });
  };
  const processIframe = async (iframe) => {
    var _a, _b;
    const iframeSrc = iframe.src;
    const iframeDocument = iframe.contentDocument;
    const iframeWindow = iframe.contentWindow;
    if (!iframeDocument || !iframeWindow) return Promise.resolve();
    if (iframeSrc.includes('javascript:')) return Promise.resolve();
    await waitIframeLoad(iframe);
    const parentClass =
      ((_a = iframe.parentElement) == null ? void 0 : _a.className) || '';
    if (parentClass.includes('ans-job-finished')) {
      logStore.addLog('发现一个已完成任务点', 'success');
    } else {
      if (iframeSrc.includes('api/work')) {
        return processWork(iframe, iframeDocument, iframeWindow);
      }
      if (configStore.platformParams.cx.parts[0].params[2].value) {
        logStore.addLog('只答题，不做其他已开启，可在设置里调整', 'primary');
      } else {
        const ansJobIcon =
          (_b = iframe.parentElement) == null
            ? void 0
            : _b.querySelector('.ans-job-icon');
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
    }
    return Promise.resolve();
  };
  init();
  processIframeTask();
  setupInterceptor();
};
