import { request } from '../utils/fetch';
const URL = 'https://autohelper.top/api';

export const getTaskAnswer = (data) => {
  const url = `${URL}/answer/topic=${data}`;
  return request(
    url,
    'GET',
    null,
    (res) => {
      return res;
    },
    (err) => {
      return err;
    }
  );
};
