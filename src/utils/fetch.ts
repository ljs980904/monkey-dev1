import { GM_xmlhttpRequest } from '$';

/**
 *
 * @param url 地址
 * @param method 方法
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @param data post时的入参 可不传
 */
export const request = (
  url: string,
  method: string = 'GET',
  headers: any,
  data: any,
  onSuccess: Function,
  onError: Function
) => {
  debugger;
  GM_xmlhttpRequest({
    method: method,
    headers,
    url: url,
    // timeout: 20000, // 5秒超时
    data: method === 'POST' ? data : null,
    onload: function (response) {
      if (response.status >= 200 && response.status < 300) {
        debugger
        if (onSuccess) {
          const resp = JSON.parse(response.responseText);
          if (resp.code === 200) {
            onSuccess(resp);
          } else {
            onError(resp);
          }
        }
      } else {
        onError(new Error(`Request failed with status ${response.status}`));

      }
    },
    onerror: function (error) {
      onError(error);
    },
  });
};
