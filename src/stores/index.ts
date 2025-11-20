import { MusicUrl, GetMusicDetail } from '@/api/GetMusic'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { computed, ComputedRef, ref } from 'vue'
export interface Song {
  id: number
  name: string
  album: string
  artist: string
  duration: number
  cover: string
}
export interface Playlist {
  id: number
  name: string
  coverImgUrl: string
  description: string
  playCount: number
  trackCount: number
  creator?: {
    nickname: string
    avatarUrl: string
  }
}
export const Player = defineStore(
  'Player',
  () => {
    const audio = new Audio() // 音频对象
    const audiovolume = ref<number>(null)
    //audio.volume = audiovolume
    const isplaying = ref(false) // 播放状态
    const playlist = ref<number[]>([]) // 播放列表
    const currentSong = ref<number | null>(null) // 当前播放的歌曲
    const currentSongUrl = ref<String | null>(null) //上次播放位置
    const currentSongTime = ref<number>(0)
    const useCookie = ref<String | null>(null)
    const currentSongDetial = ref({
      id: null,
      name: null,
      artist: null,
      cover: null,
      duration: null,
      album: null,
    }) // 当前播放歌曲的详细信息

    const currentSongList = ref<Song[]>([])
    
    const currentSongIndex: ComputedRef<number> = computed(() => {
      if (currentSong.value === null) return -1
      return playlist.value.findIndex((songId) => songId === currentSong.value)
    }) // 获取当前播放歌曲索引

    const setupAudioListener = () => {
      // 移除旧的监听器（防止重复添加）
      audio.removeEventListener('ended', End.bind(this))
      // 添加新监听器
      audio.addEventListener('ended', End.bind(this))
      audio.addEventListener('playtimeupdate', () => {
        currentSongTime.value = audio.currentTime
        //localStorage.setItem('currentSongTime', currentSongTime.value.toString())
      })
      // 监听错误
      audio.addEventListener('error', (e) => {
        console.error('音频加载错误:', e)
        isplaying.value = false
      })
    }
    const play = async () => {
      if(currentSong.value && isplaying.value === false){
        isplaying.value = true
        const urls = await MusicUrl({ id: currentSong.value})
        const url = urls[0].url
        audio.src = url
        setupAudioListener()
        audio.load()
        audio.currentTime = currentSongTime.value
        audio.play()
      }
      
    }
    const playcurrentSong = async (input) => {
      const id = input.firstId || input
      console.log('Playing song with id:', id)
      isplaying.value = true // 设置播放状态为 true
      const urls = await MusicUrl({ id: id }) // 获取歌曲 URL
      const data = await GetMusicDetail({ ids: id }) // 获取歌曲详细信息
      const detail = data.songs[0] // 设置当前歌曲详细信息
      currentSongUrl.value = urls[0].url
      currentSongDetial.value = {
        id: detail.id,
        name: detail.name,
        artist: detail.ar.map((artist) => artist.name).join(', '),
        cover: detail.al.picUrl,
        duration: detail.dt ? Math.floor(detail.dt / 1000) : 0,
        album: detail.al.name,
      }
      currentSong.value = id
      audio.src = urls[0].url // 设置音频源
      setupAudioListener() // 设置音频监听器
      audio.load()
      audio.play() // 播放音频
    }
    const loadPlaylistData = async () => {
      try {
        const songIds = playlist.value // 假设是 number[]
        if (songIds.length === 0) {
          currentSongList.value = []
          return
        }
        const results = await Promise.all(
          songIds.map((id) =>
            GetMusicDetail({ ids: id }) // 单个请求
              .then((res) => res) // 提取数据
              .catch((err) => {
                console.error(`歌曲 ${id} 加载失败:`, err)
                return null // 失败时返回null
              }),
          ),
        )
        currentSongList.value = results
          .filter(Boolean) // 移除null
          .map((song) => ({
            id: song.songs[0].id,
            name: song.songs[0].name,
            album: song.songs[0].al?.name || '未知专辑',
            artist: song.songs[0].ar?.map((a) => a.name).join('/') || '未知艺术家',
            duration: song.songs[0].dt ? Math.floor(song.songs[0].dt / 1000) : 0,
            cover: song.songs[0].al?.picUrl || '',
          }))
        console.log(currentSongList.value)
      } catch (error) {
        console.error('加载歌曲失败:', error)
      } finally {
      }
    }
    const End = () => {
      playNextSong() // 播放下一首歌曲
    }
    const addSongToPlaylist = (song) => {
      playlist.value.push(song) // 添加歌曲到播放列表
    }
    const addWholePlaylist = (songs) => {
      playlist.value = songs // 替换整个播放列表
    }
    const removeSongFromPlaylist = (songId) => {
      const wasPlaying = currentSong.value === songId // 检查是否是当前播放的歌曲
      playlist.value = playlist.value.filter((song) => song !== songId) // 从播放列表中移除歌曲
      if (wasPlaying && playlist.value.length > 0) {
        playNextSong() // 如果移除的是当前播放的歌曲且播放列表不为空，切换到下一首
      } else if (playlist.value.length === 0) {
        currentSong.value = null
        audio.pause()
        isplaying.value = false
      }
    }
    const togglePlay = () => {
      if (isplaying.value) {
        audio.pause()
        isplaying.value = false
      } else {
        // 如果 currentSong 没有 url，store.playNextSong / store.playcurrentSong 应负责拉取 url
        if (!audio.src) {
          play()
          return
        }
        audio
          .play()
          .then(() => {
            isplaying.value = true
          })
          .catch((e) => {
            console.error('play failed', e)
            isplaying.value = false
          })
      }
    }
    const playNextSong = async () => {
      if (playlist.value.length === 0) return // 如果播放列表为空，直接返回

      // 如果 currentSongIndex 为 -1（当前没有匹配 id），从 0 开始
      const currentIndex = currentSongIndex.value === -1 ? 0 : currentSongIndex.value
      const nextIndex = (currentIndex + 1) % playlist.value.length // 计算下一首歌曲索引
      const song = playlist.value[nextIndex]
      await playcurrentSong(song)
    }
    const playPrevSong = async () => {
      if (playlist.value.length === 0) return // 如果播放列表为空，直接返回

      const length = playlist.value.length
      const currentIndex = currentSongIndex.value === -1 ? 0 : currentSongIndex.value
      // 修复负数取模：先加上 length 再取模
      const prevIndex = (currentIndex - 1 + length) % length
      const song = playlist.value[prevIndex]
      playcurrentSong(song)
    }
    return {
      audio,
      audiovolume,
      isplaying,
      playlist,
      currentSong,
      currentSongDetial,
      useCookie,
      currentSongList,
      currentSongIndex,
      currentSongTime,
      playcurrentSong,
      loadPlaylistData,
      addSongToPlaylist,
      addWholePlaylist,
      removeSongFromPlaylist,
      togglePlay,
      playNextSong,
      playPrevSong,
    }
  },
  {
    persist: {
      key: 'Player',
      storage: localStorage,
      paths: ['playlist', 'currentSongList', 'currentSong', 'currentSongDetail', 'currentSongUrl', 'audiovolume', 'currentSongTime'],
    } as any,
  },
)
