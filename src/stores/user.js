import { defineStore } from "pinia"
const useUserInfoStore = defineStore('userInfo', {
  persist: true, // 持久化
  state: () => ({
    key: null,
  })
})
export default useUserInfoStore
