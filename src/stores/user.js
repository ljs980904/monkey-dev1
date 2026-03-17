import { defineStore } from "pinia"
import { createSharedState } from '@pinian/shared-state';
import { GM_setValue, GM_getValue } from '$';
const useUserInfoStore = defineStore('userInfo', {
  state: () => {
    const storedConfig = GM_getValue("config");
    const defaultConfig = {
      key: null,
      questionList: [],
      answeringMode: false,
      autoNext: false,
      playbackRate: 1,
    }
    return defaultConfig;
  }
})
export default useUserInfoStore
