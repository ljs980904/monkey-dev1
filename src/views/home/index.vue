<script setup lang="ts">
import LogDialog from '../../components/dialog/index.vue';
import { request } from '../../utils/fetch';
import { questionData } from './mock';
import {
  getSetUp,
  getNestedIframeDocument,
  TASK_TEXTS,
  EXCLUDES_TASK,
  cleanText,
} from './model';
const { list, sleep, addList, activeName, settingForm, url } = getSetUp();
// 用于保存resolve函数
let currentPageTabs: any = []; // 当前tab
let nowIdx = 0; // 当前tab索引
const resetVal = () => {
  currentPageTabs = [];
  nowIdx = 0;
};

// 进入下一页
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
  // requestAnimationFrame(initTask);
};

// 检测页面是否完全加载
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

// 监听视频事件
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
    play: () => {
      addList({ message: '视频开始播放', level: 'success' });
    },
    ended: () => {
      removeEventListeners();
      resolve();
    },
    error: () => {
      removeEventListeners();
      reject('视频播放出错');
      addList({ message: '视频播放出错', level: 'error' });
    },
  };

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

// 优化 playVideo 函数
const playVideo = async (iframeEle: HTMLElement) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      await sleep(3000);
      const wrapIframe = iframeEle.querySelector('iframe');
      await sleep(2000);
      const iframeWrapEle = (
        wrapIframe as any
      ).contentWindow?.document.querySelector('video') as HTMLVideoElement;

      if (!iframeWrapEle) {
        addList({ message: '未找到任务点', level: 'warning' });
        reject(new Error('未找到任务'));
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
  if (EXCLUDES_TASK.tasks.includes(prevTitle?.innerHTML)) {
    return;
  }

  // 获取当前页面的所有标签
  currentPageTabs = Array.from(document.querySelectorAll('.prev_ul li'));
  // 找到当前激活的标签索引
  nowIdx = currentPageTabs.findIndex(
    (element) => element.className === 'active'
  );
};

// 执行各方法
const executeFunc = async (ele) => {
  return new Promise<void>(async (resolve, reject) => {
    const innerText = currentPageTabs[nowIdx]?.innerText;
    if (innerText.includes(TASK_TEXTS.videoTxt)) {
      const gen1051 = ele.querySelector('#ext-gen1051')?.ariaLabel;
      if (!gen1051.includes(TASK_TEXTS.successTxt)) {
        // 如果已完成 跳过
        await playVideo(ele).then(resolve).catch(reject);
      }
    } else if (innerText.includes(TASK_TEXTS.detection)) {
      // addList({ value: '章节检测暂不支持，跳过', type: 'warning' });
      const gen1050 = ele.querySelector('#ext-gen1050')?.ariaLabel || '未完成';
      if (!gen1050.includes(TASK_TEXTS.successTxt)) {
        await sleep(3000);
        await runTest(ele);
      }
    } else {
      await addList({ message: '本章没有任务点，跳过', level: 'warning' });
    }
    resolve();
  });
};

// 处理当前标签页
const processCurrentTab = async () => {
  try {
    await sleep(4000);
    const iframeDocument = getNestedIframeDocument('iframe');
    await executeFunc(iframeDocument);
    addList({ message: '本章任务已完成，进入下个任务', level: 'success' });
    await sleep(2000);
    if (++nowIdx < currentPageTabs.length) {
      currentPageTabs[nowIdx]?.onclick();
      // 继续处理下一个标签页
      processCurrentTab();
    } else {
      await isPageLoaded();
      next();
    }
  } catch (error) {
    addList({ message: '错误', level: 'error' });
  }
};

// 初始化任务点
const initTask = () => {
  initializeCurrentPageTabs();
  if (currentPageTabs.length) {
    processCurrentTab();
  }
};
// 发送请求
const simulateRequest = async (ele, data) => {
  return new Promise<void>((resolve) => {
    debugger;
    const params = `题目：${data.question}，选项：${data.options}`;
    request(
      `${url.value}/answer?topic=${params}`,
      'get',
      {},
      (response) => {
        debugger;
        const resData = JSON.parse(response);
        console.log(resData);
        const content =
          resData.correct_answer?.output?.choices[0]?.message?.content;
        const index = data.options.findIndex((v) => {
          return v.includes(content);
        });
        if (index != -1) {
          ele[index].onclick();
        }
        resolve();
      },
      (err) => {
        console.log(err);
      }
    );

    // 返回数据后 根据选型判断选中值 并使用ele.onclick(); 选中 然后使用  resolve(mockResponse); 回调
    // arrs.find((item) =>item.)

    // for (let i = 0; i < ele.length; i++) {
    //   const element = ele[i];
    // }

    // setTimeout(() => {
    //   // 模拟返回的数据
    //   const mockResponse = {
    //     correct_answer: 'A:语义性', // 假设这是正确的答案
    //   };
    //   resolve(mockResponse);
    // }, 1000);
  });
};

// 保存后的确认提示弹窗
const subEvent = () => {
  const maskDivEle = document.querySelector('.maskDiv');
  if (maskDivEle) {
    const popok = maskDivEle.querySelector('#popok') as HTMLElement; // 添加类型断言
    popok?.click();
  }
};
const autoAnswer = async (taskEle) => {
  debugger;
  const singleQues = taskEle.querySelector('.ZyBottom');
  if (!singleQues) return;
  // 获取当前页面的所有题目
  const singleChoiceQuestions = singleQues.querySelectorAll('.singleQuesId');
  for (const questions of singleChoiceQuestions) {
    // 获取当前题目问题
    const question = questions.querySelector('.fontLabel').textContent;
    // 获取当前题目选项
    const li = questions.querySelectorAll('ul li');
    const liArrs = Array.from(li);
    const options = liArrs.map((option: any) => cleanText(option.textContent));
    console.log(options);
    console.log(li);
    console.log(liArrs);
    console.log({ question, options });
    // TODO  解决各种类型题目答案返回问题 目前python 服务有问题
    // 请求发送 并将将结果直接对当前的元素进行答题
    await simulateRequest(li, {
      question: cleanText(question),
      options,
    });
  }
  // const saveEles = taskEle.querySelector('.ZY_sub.clearfix');
  // const saveEle = saveEles.querySelector('.btnSubmit.workBtnIndex');
  // saveEle?.click();
  // await sleep(2000);
  // subEvent();
};

// 章节检测
const runTest = async (ele) => {
  console.log(ele);

  const iframeDocument = getNestedIframeDocument('iframe');
  const taskDoc = iframeDocument
    ?.querySelector('iframe')
    ?.contentWindow?.document?.querySelector('iframe')?.contentWindow?.document;
  // 获取最终的 task 文档
  // const taskDoc = ele
  //   ?.querySelector('iframe')
  //   ?.contentWindow?.document?.querySelector('iframe')?.contentWindow?.document;
  if (taskDoc) {
    // 获取检测数据
    await autoAnswer(taskDoc);
    // initTask();
  }
};

// 测试
const testRq = async (data) => {
  try {
    console.log();
    const params = `题目：${data.question}，选项：${data.options}`;

    request(
      `${url.value}/answer?topic=${params}`,
      'get',
      {},
      (response) => {
        debugger;
        const resData = JSON.parse(response);
        console.log(resData);
        const content =
          resData.correct_answer?.output?.choices[0]?.message?.content;
        console.log(content);
      },
      (err) => {
        return err;
      }
    );
  } catch (error) {
    console.log(error);
  }
};

onMounted(async () => {
  addList({ message: '脚本加载成功', level: 'warning' });
  await nextTick();
  await sleep(2000);
  // initTask();
});
const dialogVisible = ref(true);
</script>
<template>
  <LogDialog v-model:list="list" v-if="dialogVisible">
    <button @click="runTest">测试</button>

    <button @click="testRq(questionData)">测试</button>
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
