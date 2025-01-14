<script setup lang="ts">
import LogDialog from '../../components/dialog/index.vue';
import { request } from '../../utils/fetch';
import { crackFont } from '../../directives/crack-font';
import { sleep } from '../../utils';
import {
  getSetUp,
  getNestedIframeDocument,
  TASK_TEXTS,
  EXCLUDES_TASK,
  cleanText,
} from './model';

const { list, addList, url, title } = getSetUp() as {
  list: any;
  addList: (obj: any) => void;
  url: any;
  title: string;
};

let currentPageTabs: any = []; // 当前任务章节 tab
let nowIdx = 0; // 当前tab索引

/**
 * 重置
 */
const resetVal = () => {
  currentPageTabs = [];
  nowIdx = 0;
};

/**
 * 下一步
 */
const next = async () => {
  const findElementByText = () => {
    return Array.from(document.querySelectorAll('.prev_next')).find(
      (element: any) => element?.textContent?.trim() === TASK_TEXTS.nextTxt
    );
  };
  const nextButton: any = findElementByText();
  if (!nextButton || nextButton.style.display === 'none') {
    await sleep(1000);
    addList({ message: '任务已完成', level: 'success' });
    return;
  }
  nextButton?.onclick();
  resetVal();
  await sleep(3000);
  requestAnimationFrame(init);
};

/**
 *  判断页面是否加载完成
 */
const isPageLoaded = () => {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve(true);
    } else {
      const intervalId = setInterval(() => {
        if (document.readyState === 'complete') {
          clearInterval(intervalId);
          resolve(true);
        }
      }, 500);
    }
  });
};

/**
 * 监听视频事件
 * @param videoElement  视频元素
 * @param resolve  成功
 * @param reject  失败
 */
const videoListener = (
  videoElement: HTMLVideoElement,
  resolve: () => void,
  reject: (reason?: any) => void
) => {
  const handlers = {
    loadedmetadata: () => {
      const text = `视频时常--${videoElement.duration} s`;
      addList({ message: text, level: 'warning' });
    },
    pause: () => {
      console.log(videoElement);
      // 遇到暂停时 判断是否做题 如果存在当前按钮 则出发继续按钮
      const isContinue = videoElement?.parentElement?.querySelector(
        '#videoquiz-continue'
      );
      if (isContinue) {
        // 跳过题目 继续播放
        const isContinueButton = isContinue as HTMLButtonElement;
        isContinueButton?.click();
        addList({ message: '视频继续播放', level: 'warning' });
      } else {
        if (!videoElement.ended) {
          videoElement.play(); // 视频暂停时 会出现题目 答题完成之后 继续播放
        }
      }
    },
    ended: () => {
      removeEventListeners();
      resolve();
      addList({ message: '视频播放完成', level: 'warning' });
    },
    error: () => {
      removeEventListeners();
      reject('视频播放出错');
      addList({ message: '视频播放出错', level: 'error' });
    },
  };
  // 删除监听器
  const removeEventListeners = () => {
    Object.entries(handlers).forEach(([event, handler]) => {
      videoElement.removeEventListener(event, handler);
    });
  };

  // 添加监听器
  Object.entries(handlers).forEach(([event, handler]) => {
    videoElement.addEventListener(event, handler);
  });

  videoElement.muted = true;
  videoElement.play();
};

/**
 *  播放视频
 * @param iframeEle 任务元素
 */
const playVideo = async (iframeEle: HTMLElement) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      await sleep(3000);
      const wrapIframe = iframeEle.querySelector('iframe');
      await sleep(1000);
      const iframeWrapEle = (
        wrapIframe as any
      ).contentWindow?.document.querySelector('video') as HTMLVideoElement;
      if (!iframeWrapEle) {
        addList({ message: '未找到任务点，跳过', level: 'warning' });
        resolve();
        return;
      }
      addList({ message: '发现一个视频任务，即将播放', level: 'primary' });
      await sleep(3000);
      videoListener(iframeWrapEle, resolve, reject);
    } catch (error) {
      reject({ message: '视频播放出错', level: 'error' });
    }
  });
};

// 初始化当前页面的标签页
const initializeCurrentPageTabs = () => {
  const prevTitle = document.querySelector('.prev_title');
  // 排除不需要进入的标题
  if (EXCLUDES_TASK.tasks.includes(prevTitle?.innerHTML as string)) {
    return;
  }
  currentPageTabs = Array.from(document.querySelectorAll('.prev_ul li')); // 获取当前页面的所有标签
  // 找到当前激活的标签索引
  nowIdx = currentPageTabs.findIndex(
    (element) => element.className === 'active'
  );
};

// 执行各方法
const executeFunc = async (ele) => {
  return new Promise<void>(async (resolve, reject) => {
    const innerText = currentPageTabs[nowIdx]?.innerText; // 不需要做题的章节
    const ansJobIcon =
      ele.querySelector('.ans-job-icon')?.ariaLabel ?? '未完成'; // 当前章节 是否完成
    console.log('ansJobIcon---', ansJobIcon);

    if (ansJobIcon == TASK_TEXTS.successTxt) {
      resolve();
      return;
    }
    if (innerText == TASK_TEXTS.videoTxt) {
      await playVideo(ele); // 如果已完成 跳过
    } else if (innerText.includes(TASK_TEXTS.detection)) {
      addList({ message: '检测到任务点，正在解析', level: 'warning' });
      await sleep(3000);
      await runTest(ele);
    } else {
      await addList({ message: '本章没有任务点，跳过', level: 'warning' });
    }
    resolve();
  });
};

/**
 *  处理当前标签页
 */
const processCurrentTab = async () => {
  try {
    await sleep(4000);
    const iframeDocument = getNestedIframeDocument('iframe');
    await executeFunc(iframeDocument);
    addList({ message: '本章任务已完成，进入下个任务', level: 'success' });
    await sleep(2000);
    if (++nowIdx < currentPageTabs.length) {
      currentPageTabs[nowIdx]?.onclick();
      processCurrentTab(); // 继续处理下一个标签页
    } else {
      await isPageLoaded();
      next();
    }
  } catch (error) {
    addList({ message: '错误', level: 'error' });
  }
};

/**
 *  初始化任务
 */
const initTask = () => {
  initializeCurrentPageTabs();
  if (currentPageTabs.length) {
    processCurrentTab();
  }
};

/**
 *  找出正确答案所在的索引
 * @param options  选项
 * @param correctAnswers  答案
 */
const findCorrectOptionIndices = (options: any, correctAnswers: string[]) => {
  let correctIndices: any = [];
  for (let answer of correctAnswers) {
    let index = options.findIndex((option) => option.startsWith(answer));
    if (index !== -1) {
      correctIndices.push(index as number);
    }
  }
  return correctIndices;
};

/**
 * 发送请求
 * @param ele 选项元素
 * @param data 题目和选项
 */
const simulateRequest = async (ele, data) => {
  console.log('data----', data);
  return new Promise<void>((resolve) => {
    const params = `题目：${data.question}，选项：${data.options}`;
    request(
      `${url.value}/answer?topic=${params}`,
      'get',
      {},
      (response) => {
        const resData = JSON.parse(response);
        console.log('resData-------', resData);
        const content = JSON.parse(
          resData?.output?.choices[0]?.message?.content
        );
        findCorrectOptionIndices(data.options, content)?.forEach((i) => {
          const checkEle = ele[i];
          if (!checkEle.ariaChecked) {
            checkEle.onclick();
          }
        });
        resolve();
      },
      (err) => {
        console.log(err);
      }
    );
  });
};

/**
 * 保存后的确认提示弹窗
 */
const subEvent = () => {
  const maskDivEle = document.querySelector('.maskDiv');
  if (maskDivEle) {
    const popok = maskDivEle.querySelector('#popok') as HTMLElement; // 添加类型断言
    popok?.click();
  }
};
/**
 * 自动答题
 * @param taskEle 任务元素
 */
const autoAnswer = async (taskEle) => {
  const singleQues = taskEle.querySelector('.ZyBottom');
  if (!singleQues) return;
  addList({ message: '开始答题', level: 'warning' });

  const singleChoiceQuestions = singleQues.querySelectorAll('.singleQuesId'); // 获取当前页面的所有题目
  for (const questions of singleChoiceQuestions) {
    const question = questions.querySelector('.fontLabel').textContent; // 获取当前题目问题
    const li = questions.querySelectorAll('ul li'); // 获取当前题目选项
    const liArrs = Array.from(li);
    const options = liArrs.map((option: any) => cleanText(option.textContent));
    await sleep(1000);
    // 请求发送 并将将结果直接对当前的元素进行答题
    await simulateRequest(li, {
      question: cleanText(question),
      options,
    });
  }
  addList({ message: '答题已完成', level: 'success' });
  // 提交
  const saveEles = taskEle.querySelector('.ZY_sub.clearfix');
  const saveEle = saveEles?.querySelector('.btnSubmit.workBtnIndex');
  saveEle?.click();
  addList({ message: '正在提交', level: 'success' });
  await sleep(2000);
  subEvent();
  await sleep(2000);
  addList({ message: '提交完成', level: 'success' });
};

/**
 * 章节检测/测试
 * @param ele 任务元素
 */
const runTest = async (ele) => {
  // const iframeDocument = getNestedIframeDocument('iframe');
  // const taskDoc = iframeDocument
  //   ?.querySelector('iframe')
  //   ?.contentWindow?.document?.querySelector('iframe')?.contentWindow?.document;

  const taskDoc = ele // 获取最终的 task 文档
    ?.querySelector('iframe')
    ?.contentWindow?.document?.querySelector('iframe')?.contentWindow?.document;
  if (taskDoc) {
    await crackFont(taskDoc); // 解密
    await autoAnswer(taskDoc); // 获取检测数据
  }
};

// 测试
// const testRq = async (data) => {
//   try {
//     console.log();
//     const params = `题目：${data.question}，选项：${data.options}`;

//     request(
//       `${url.value}/answer?topic=${params}`,
//       'get',
//       {},
//       (response) => {
//         const resData = JSON.parse(response);
//         console.log(resData);
//         const content =
//           resData.correct_answer?.output?.choices[0]?.message?.content;
//         console.log(content);
//       },
//       (err) => {
//         return err;
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
// };
// const crackFonts = async () => {
//   const iframeDocument = getNestedIframeDocument('iframe');
//   const taskDoc = iframeDocument
//     ?.querySelector('iframe')
//     ?.contentWindow?.document?.querySelector('iframe')?.contentWindow?.document;
//   await crackFont(taskDoc);
// };

/**
 * 考试
 */
const examination = async () => {
  const completeBtn = document.querySelector('.subNav .completeBtn.fl');

  if (completeBtn && completeBtn?.textContent == '整卷预览') {
    (completeBtn as HTMLButtonElement).click();
  }
  await sleep(2000);
  crackFont(document);
  await sleep(2000);
  const questionLis = document.querySelectorAll('.questionLi'); // 整卷预览 所有选项
  const questionArray = Array.from(questionLis);

  for (const questionLi of questionArray) {
    const question = questionLi?.querySelector('.mark_name')?.textContent; // 题目
    const stemAnswer = questionLi?.querySelector('.stem_answer'); // 选项容器
    const answerBgs = stemAnswer?.querySelectorAll('.answerBg'); // 所有选项
    const answer = Array.from(answerBgs as ArrayLike<Element>);
    const options = answer.map((option: any) => cleanText(option.textContent));
    await simulateRequest(answerBgs, {
      question: cleanText(question ?? null),
      options,
    });
  }
  addList({ message: '答题结束，10分钟后或手动提交', level: 'success' });
  setInterval(async () => {
    const time = document
      .querySelector('.marking_left_280')
      ?.querySelector('#timer')?.innerHTML;
    const minute = time?.split("' ")[0];
    if (Number(minute) < 50) {
      const sub = document.querySelector('.sub-button.fr')?.querySelector('a');
      sub?.click();
      await sleep(2000);
      const submitEle = document.querySelector('#submitConfirmPop');
      const aEle = submitEle?.querySelector('.confirm');
      (aEle as HTMLElement)?.click(); // 限时提交
    }
  }, 300000);
};

/**
 * 考试
 */
const init = () => {
  const topTxt = document.querySelector('.subNav.top-subNav')?.ariaLabel;
  if (topTxt?.includes('考试')) {
    examination();
  } else {
    initTask(); // 章节检测
  }
};
onMounted(async () => {
  addList({ message: '脚本加载成功', level: 'warning' });
  await nextTick();
  init();
});
const dialogVisible = ref(true);
</script>
<template>
  <LogDialog
    v-model:list="list"
    v-if="dialogVisible"
    :title="title"
    :statusInfo="{ text: '正在执行', type: 'info' }"
  >
    <!-- <button @click="runTest">测试</button> -->
    <!-- <button @click="runTests">测试</button> -->
    <button @click="examination">考试</button>
  </LogDialog>
</template>

<style scoped>
.demo-tabs {
  width: 100%;
  height: 100%;
}

.bottom-border {
  margin: 8px 0;
  border-bottom: 0.5px solid #eeeeee;
}

.glass-body {
  width: 100%;
  height: 100%;
  font-size: 12px;
  overflow: auto;
}

.glass-body::-webkit-scrollbar {
  width: 8px;
  /* height: 11px; */
  /* background-color: #f5f5f5; */
}

.glass-body::-webkit-scrollbar-track {
  /* -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3); */
  border-radius: 10px;
  background-color: #f5f5f5;
}

.glass-body::-webkit-scrollbar-thumb {
  border-radius: 10px;
  /* background-color: #4b5563; */
  border: 2px solid transparent;
  background-clip: padding-box;
}

.flex {
  display: flex;
  flex-direction: column;
}

.pointer {
  cursor: pointer;
}

.glass-header {
  height: 30px;
  line-height: 24px;
  font-size: 14px;
  color: #303133;
  border-bottom: 1px solid #eeeeee;
}

.glass-container {
  width: 300px;
  height: 300px;
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 9999;
  margin-top: -300px;
  margin-left: -217.5px;
  color: #333333;
  border-radius: 8px;
  backdrop-filter: blur(5px);
  background-color: rgba(255, 255, 255, 1);
  /* box-shadow: rgba(0, 0, 0, 0.3) 2px 8px 8px; */
  /* border: 2px rgba(255, 255, 255, 0.4) solid;
  border-bottom: 2px rgba(40, 40, 40, 0.35) solid;
  border-right: 2px rgba(40, 40, 40, 0.35) solid; */
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  padding: 0 10px 10px;
}
</style>
