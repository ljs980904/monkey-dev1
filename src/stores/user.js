import { defineStore } from "pinia"
const useUserInfoStore = defineStore('userInfo', {
  persist: true, // 持久化
  state: () => ({
    key: null,
    questionList: [],
    answeringMode: false,
    autoNext: false,
    playbackRate: 1,
  })
})
export default useUserInfoStore
