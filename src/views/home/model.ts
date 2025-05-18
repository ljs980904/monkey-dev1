import { request } from '../../utils/fetch';


// 0：单选题，1：多选题，3：判断题
const types = {
  0: '单选题',
  1: '多选题',
  3: '判断题'
}

// const url = 'http://localhost:8080/question/dpQuestion'
// const url = ''
/**
 * 发送请求
 * @param ele 选项元素
 * @param data 题目和选项
 */
export const simulateRequest = async (url, params, _self, keys) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      ...params,
      typeText: types[params.type],
      key: keys
    })
    console.log(data);

    let { author, version } = GM_info.script
    request(
      `${url}?s=${author}&v=${version}`,
      'POST',
      {
        "Content-Type": "application/json",
        "referer": params.refer,
        "u": _self.uid || _self.getCookie("UID") || _self.getCookie("_uid") || "",
        "t": Math.floor((new Date()).getTime() / 1e3).toString()
      },
      data,
      (response) => {
        try {
          const resp = JSON.parse(response)
          resolve(resp)
        } catch (error) {
          resolve({ code: 500, error }); // 即使出错，也继续执行
        }
      },
      (error) => {
        resolve({ code: 500, error }); // 即使出错，也继续执行
      }
    );
  });
};

