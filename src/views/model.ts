import { request } from '../utils/fetch';
export const column = [
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

export const inputNumberAttr = {
  step: 1,
  'step-strictly': true,
  size: 'small',
};

export const tabBars = [
  {
    value: 'settings',
    label: '配置',
  },
  {
    value: 'key',
    label: '卡密',
  },
  {
    value: 'help',
    label: '帮助',
  },
  {
    value: 'protocol',
    label: '协议',
  },
];

export const settings = [
  // {
  //   name: '自动下一题',
  //   desc: '开启后，自动进入下一题',
  //   value: 'autoNext',
  //   type: 'switch',
  // },
  // {
  //   name: '答题模式',
  //   desc: '只答题，不做其他',
  //   value: 'answeringMode',
  //   type: 'switch',
  // },
  {
    name: '答题正确率',
    desc: '满足答题率后自动提交',
    value: 'rate',
    type: 'input',
  },
  {
    name: '视频倍速',
    desc: '视频播放速度',
    value: 'playbackRate',
    type: 'input',
  },
  {
    name: '答题后切换间隔',
    desc: '答题、切换间隔(秒)',
    value: 'interval',
    type: 'inputNumber',
  },
];

export const guide = [
  // {
  //   index: 1,
  //   content: '本脚本完全免费，无任何付费项目',
  // },
  {
    index: 1,
    content: '使用第三方题库资源，内容准确率非100%，仅供参考',
  },
  {
    index: 2,
    content: '请先打开需要处理的课程视频或作业页面',
  },
  {
    index: 3,
    content: '根据实际需求，配置相应的自动化选项',
  },
  {
    index: 4,
    content: '进入答题页面后，等待解析完成后自动进入答题流程',
  },
  {
    index: 5,
    content: '自动答题需要填写卡密，获取方法如下',
  },
  {
    index: 6,
    content: '微信搜索「AT搜题」公众号，免费获取卡密',
  },
  {
    index: 7,
    content: '点击「答题」标签页 → 输入卡密并验证 → 刷新页面',
  },
];

export const protocol = [
  {
    index: 1,
    content:
      '本脚本仅供学习和研究目的使用，并应在24小时内删除。脚本的使用不应违反任何法律法规及学术道德标准。',
  },
  {
    index: 2,
    content:
      '用户在使用脚本时，必须遵守所有适用的法律法规。任何由于使用脚本而引起的违法行为或不当行为，其产生的一切后果由用户自行承担。',
  },
  {
    index: 4,
    content:
      '开发者不对用户使用脚本所产生的任何直接或间接后果负责。用户应自行评估使用脚本的风险，并对任何可能的负面影响承担全责。',
  },
  {
    index: 5,
    content:
      '本声明的目的在于提醒用户注意相关法律法规与风险，确保用户在明智、合法的前提下使用脚本。',
  },
  {
    index: 6,
    content:
      '如用户在使用脚本的过程中有任何疑问，建议立即停止使用，并删除所有相关文件。',
  },
  {
    index: 7,
    content: '本免责声明的最终解释权归脚本开发者所有。',
  },
];

// 0：单选题，1：多选题，3：判断题
const types = {
  0: '单选题',
  1: '多选题',
  3: '判断题',
};

/**
 * 发送请求
 * @param ele 选项元素
 * @param data 题目和选项
 */
export const simulateRequest = async (params, _self, keys) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      ...params,
      typeText: types[params.type],
      key: keys,
    });

    let { author, version } = GM_info.script;
    const SYSTEM_API_URL = 'https://autohelper.top/tiku/question/dpQuestion';
    request(
      `${SYSTEM_API_URL}?s=${author}&v=${version}`,
      'POST',
      {
        'Content-Type': 'application/json',
        referer: params.refer,
        u: _self.uid || _self.getCookie('UID') || _self.getCookie('_uid') || '',
        t: Math.floor(new Date().getTime() / 1e3).toString(),
      },
      data,
      (response) => {
        resolve(response);
      },
      (error) => {
        resolve(error); // 即使出错，也继续执行
      },
    );
  });
};
