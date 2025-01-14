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
  data: any,
  onSuccess: Function,
  onError: Function
) => {
  GM_xmlhttpRequest({
    method: method,
    url: url,
    data: method === 'POST' ? data : null,
    onload: function (response) {
      if (response.status >= 200 && response.status < 300) {
        if (onSuccess) {
          onSuccess(response.responseText);
        }
      } else {
        if (onError) {
          onError(new Error(`Request failed with status ${response.status}`));
        }
      }
    },
    onerror: function (error) {
      if (onError) {
        onError(error);
      }
    },
  });
};
