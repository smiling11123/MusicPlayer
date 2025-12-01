import { defineStore } from 'pinia'
import { ref } from 'vue'
export const pagecontrol = defineStore('pagecontrol', () => {
  const ShowLyric = ref(false) //是否显示歌词页面
  const ShowPlayList = ref(false)
  const ShowAdditionRight = ref(false)
  const ShowDeskLyric = ref(false)
  //IsLogin: false
  const ShowQRCode = ref(false)
  const IsLogin = ref(false)
  const IsFold = ref(false)
  const isShowLyric = () => {
    ShowLyric.value = !ShowLyric.value
  }
  const isShowPlayList = () => {
    ShowPlayList.value = !ShowPlayList.value
  }
  const isShowDeskLyric = () => {
    ShowDeskLyric.value = !ShowDeskLyric.value
  }

  return {
    ShowLyric,
    ShowPlayList,
    ShowAdditionRight,
    ShowQRCode,
    ShowDeskLyric,
    IsLogin,
    IsFold,
    isShowLyric,
    isShowPlayList,
    isShowDeskLyric,
  }

},
   { 
    persist: {
        key: 'pagecontrol',
      storage: localStorage,
      paths: [
        'IsLogin',
        'IsFold',
        'ShowDeskLyric',
      ],
    } as any
}

)
