<!--
 * @FilePath: index.vue
 * @Author: ljs
 * @Date: 2024-10-09 14:27:35
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-10-09 15:26:35
 * Copyright: 2024 xxxTech CO.,LTD. All Rights Reserved.
 * @Descripttion: 
-->

<script setup lang="ts">
import type { TabName } from './index';
import { LOG_VAL, getSetUp } from './model';

const { htmlEle, logArrs, sleep, pushLog } = getSetUp();

// 用于保存resolve函数
let currentPageTabs: any = []; // 当前tab
let nowIdx = 0; // 当前tab索引

const resetVal = () => {
  currentPageTabs = [];
  nowIdx = 0;
};

// 进入下一页
const next = async () => {
  const findElementByText = (parent: any, text: string) => {
    return Array.from(parent.querySelectorAll('.prev_next')).find(
      (element: any) => element?.textContent?.trim() === text
    );
  };
  const nextButton: any = findElementByText(
    document.getElementById('prevNextFocus'),
    '下一节'
  );
  if (!nextButton) {
    return;
  }
  resetVal();
  nextButton?.onclick();
  await sleep(1000);
  requestAnimationFrame(initDom);
};

// 播放视频
const videoPlay = (videoEle: any) => {
  videoEle.muted = true;
  videoEle.play();
  // videoEle.addEventListener('canplay', () => {
  //   debugger;
  //   videoEle.play();
  // });
  // videoEle.play();
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
  ele: HTMLVideoElement,
  resolve: (value?: unknown) => void,
  reject: (value?: unknown) => void
) => {
  const videoElement = ele;
  const loadedmetadata = () => {
    //视频的总长度
    const text = `视频任务点长度--${videoElement.duration} s`;
    pushLog({ value: text, type: 'warning' });
  };
  const play = () => {
    //播放
    pushLog({ value: '视频开始播放', type: 'success' });
  };
  const playing = () => {
    //播放中
    pushLog({ value: '视频播放中...', type: 'default' });
  };
  const onEnded = () => {
    //监听视频播放结束
    videoElement.removeEventListener('ended', onEnded);
    pushLog({ value: '视频点播放完成', type: 'success' });
    resolve();
  };
  const onError = () => {
    videoElement.removeEventListener('error', onError);
    reject('视频播放出错');
    pushLog({ value: '视频播放出错', type: 'danger' });
  };
  videoElement.addEventListener('loadedmetadata', loadedmetadata);
  videoElement.addEventListener('play', play);
  videoElement.addEventListener('playing', playing);
  videoElement.addEventListener('ended', onEnded, false);
  videoElement.addEventListener('error', onError);
};
const playVideo = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const course_main = document.getElementsByClassName('course_main');
      const iframeEle = course_main[0].getElementsByTagName('iframe')[0];
      const iframeDocument = iframeEle.contentWindow?.document;
      const iframeBody = iframeDocument?.body;

      pushLog({ value: '正在解析当前任务点', type: 'warning' });

      await sleep(1000);
      const wraps = iframeBody?.getElementsByClassName('wrap');
      const wrap = wraps![0];
      const extGen1050 = wrap.getElementsByClassName('ans-job-icon');
      if (extGen1050?.length && extGen1050[0]?.ariaLabel === '任务点已完成') {
        pushLog({ value: '视频点已完成,跳过', type: 'success' });
        resolve('');
        return;
      }

      const wrapIframe = wrap.getElementsByTagName('iframe')[0];
      const iframeWrapEle = wrapIframe.contentWindow?.document;
      const videoElements = iframeWrapEle?.getElementsByTagName('video');
      debugger;
      if (!videoElements?.length) {
        reject(new Error('未找到任务'));
        pushLog({ value: '未找到任务点', type: 'warning' });
        return;
      }
      pushLog({ value: '脚本检测到视频任务', type: 'primary' });
      const videoElement = videoElements[0];
      pushLog({ value: '即将播放视频', type: 'primary' });
      await sleep(5000);
      videoListener(videoElement, resolve, reject);
      videoPlay(videoElement);
    } catch (error) {
      console.error('视频播放出错:', error);
      reject({ value: '视频播放出错', type: 'danger' });
    }
  });
};
// 获取当前页面的所有标签页
const getCurrentPageTabs = () => {
  const prevList = document.querySelector('.prev_ul'); // 根据实际情况修改选择器
  return prevList?.getElementsByTagName('li');
};

// 初始化当前页面的标签页
const initializeCurrentPageTabs = () => {
  const prevTitle: any = document.querySelector('.prev_title') || '暂无标题';
  // 排除不需要进入的标题
  const prevTie = ['问卷调查', '阅读'];
  if (prevTie.includes(prevTitle?.innerHTML)) {
    return;
  }
  currentPageTabs = getCurrentPageTabs();
  for (let i = 0; i < currentPageTabs.length; i++) {
    const element = currentPageTabs[i];
    if (element.className === 'active') {
      nowIdx = i;
    }
  }
};
// 执行各方法
const executeFunc = (title: string) => {
  return new Promise((resolve, reject) => {
    if (title.includes('视频')) {
      // 视频
      playVideo().then(resolve);
    } else if (title.includes('章节检测') || title.includes('章节测验')) {
      // 章节测验
      // next();
      resolve('');
    }
  });
};

// 处理当前标签页
const processCurrentTab = async () => {
  try {
    const tab = currentPageTabs[nowIdx];
    await sleep(1000);
    if (!tab?.innerText.includes('学习目标')) {
      await executeFunc(tab.innerText);
    }
    pushLog({ value: '本章任务已完成，进入下个任务', type: 'success' });
    if (++nowIdx < currentPageTabs.length) {
      await sleep(4000);
      currentPageTabs[nowIdx]?.onclick();
      // 继续处理下一个标签页
      processCurrentTab();
    } else {
      await isPageLoaded();
      resetVal();
      next();
    }
  } catch (error) {
    pushLog({ value: '错误', type: 'danger' });
  }
};

// 初始化当前页面 开始对当前页面内容进行分析
const initDom = () => {
  pushLog({ value: '正在解析任务点', type: 'warning' });
  initializeCurrentPageTabs();
  processCurrentTab();
};
onMounted(async () => {
  pushLog({ value: '脚本加载成功', type: 'warning' });
  nextTick(() => {
    setTimeout(() => {
      initDom();
    }, 4000);
  });
});
</script>
<template>
  <div class="glass-container flex" v-drag="'.glass-header'">
    <div class="glass-header bottom-border pointer">
      网课助手
      <!-- <span @click="initDom">开始</span> -->
    </div>
    <div class="glass-body">
      <ul class="log-ul">
        <li v-for="log in logArrs" :key="log">
          <span> {{ log.time }}：</span>
          <span :class="{ [log.type]: true }">{{ log.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.default {
  color: #909399;
}
.primary {
  color: #409eff;
}
.success {
  color: #67c23a;
}
.warning {
  color: #e6a23c;
}
.danger {
  color: #f56c6c;
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
/* .glass-body {
  margin: 10px;
} */
.header {
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

  /* display: flex;
  justify-content: space-between;
  padding: 0 10px; */
}
.glass-content {
  /* padding: 10px; */
}
.glass-container {
  width: 260px;
  height: 325px;
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
.log-ul {
  line-height: 20px;
  font-size: 12px;
  color: #303133;
}
</style>
