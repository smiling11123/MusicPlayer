<template>
  <div class="song-rec-container">
    <div class="header">
      <h2 class="title">歌曲</h2>
      <a class="view-all" @click="goToAllSongs">查看全部</a>
    </div>

    <div class="grid-wrapper">
      <div
        v-for="song in songsList"
        :key="song.id"
        class="song-card"
        @dblclick="playSong(song)"
        :class="{ 'is-active': activeMenuId === song.id }"
      >
        <div class="cover-wrap">
          <img :src="song.cover" alt="cover" loading="lazy" />
          <div class="play-overlay" @click="playSong(song)">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>

        <div class="info-wrap">
          <div class="song-name" :title="song.name">
            {{ song.name }}
          </div>
          <div class="artist-name">
            <span
              v-for="(artist, index) in song.artists"
              :key="artist.id"
              @click.stop="TurnIn(artist.id)"
            >
              {{ artist.name }}<span v-if="index < song.artists.length - 1"> / </span>
            </span>
          </div>
        </div>

        <div class="more-container" @dblclick.stop>
          <button class="more" @click.stop="toggleMenu(song.id)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
              />
            </svg>
          </button>

          <transition name="fade">
            <div class="dropdown-menu" v-show="activeMenuId === song.id" @click.stop>
              <div class="menu-item" @click="handleMenuAction('next', song)">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill="currentColor" />
                </svg>
                <span>下一首播放</span>
              </div>

              <div class="menu-item" @click="handleMenuAction('like', song)">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="currentColor"
                  />
                </svg>
                <span>添加到我喜欢</span>
              </div>

              <div
                class="menu-item has-submenu"
                @click.stop="toggleSubmenu('playlist')"
                :class="{ 'is-active': openSubmenuId === 'playlist' }"
              >
                <div class="menu-content">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M19 11H5m14-6H5m9 12H5"></path>
                    <path d="M17 17v6m3-3h-6"></path>
                  </svg>
                  <span>收藏到歌单</span>
                  <span class="arrow" :class="{ rotate: openSubmenuId === 'playlist' }">›</span>
                </div>

                <transition name="fade">
                  <div class="submenu" v-show="openSubmenuId === 'playlist'" @click.stop>
                    <div class="submenu-scroll">
                      <div
                        v-for="list in myPlaylists"
                        :key="list.id"
                        class="menu-item"
                        @click.stop="addToPlaylist(list.id, song.id)"
                      >
                        <span>{{ list.name }}</span>
                      </div>
                      <div v-if="myPlaylists.length === 0" class="empty-tip">暂无歌单</div>
                    </div>
                  </div>
                </transition>
              </div>

              <div class="menu-item" @click="handleMenuAction('detail', song)">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                    fill="currentColor"
                  />
                </svg>
                <span>评论</span>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Player } from '@/stores/index'
import { userInfo } from '@/stores/userInfo' // 引入 UserInfo
import { useRouter } from 'vue-router'
import { GetSearchData } from '@/api/Search'
import { search } from '@/stores/search'
import { GetMusicDetail, AddToLike, AddToMyList } from '@/api/GetMusic' // 引入操作 API
import { GetUserMusicList } from '@/api/GetMusicList' // 引入歌单列表 API
import type { SongItem } from '@/stores/index'

// --- 状态与逻辑 ---
const router = useRouter()
const player = Player()
const searcher = search()
const userInfos = userInfo() // 初始化 userInfos

const songsList = ref<SongItem[]>([])
const activeMenuId = ref<number | null>(null)
const openSubmenuId = ref<string | null>(null) // 新增：二级菜单状态
const myPlaylists = ref<any[]>([]) // 新增：用户歌单列表

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// 初始化：点击空白关闭菜单 + 获取歌单
onMounted(async () => {
  document.addEventListener('click', closeMenu)

  // 获取用户创建的歌单（用于添加到歌单功能）
  if (userInfos.userId) {
    try {
      const res: any = await GetUserMusicList(userInfos.userId)
      myPlaylists.value = (res.playlist || []).filter(
        (p: any) => p.creator.userId === userInfos.userId,
      )
    } catch (e) {
      console.error('获取歌单失败', e)
    }
  }
})

// 组件销毁清理
onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
  if (debounceTimer) clearTimeout(debounceTimer)
})

// 加载歌曲结果
const loadMusic = async (Keyword: string) => {
  if (!Keyword) return
  try {
    const searchRes = await GetSearchData({ keyword: Keyword, type: 1, limit: 12 })
    const rawSongList = searchRes?.result?.songs || []
    if (rawSongList.length === 0) {
      songsList.value = []
      return
    }
    const ids = rawSongList.map((song: any) => song.id)
    const detailRes = await GetMusicDetail({ ids: ids.join(',') })

    if (detailRes && detailRes.songs) {
      songsList.value = detailRes.songs.map((song: any) => ({
        id: song.id,
        name: song.name,
        album: song.al?.name || '未知专辑',
        artists: song.ar.map((ar: any) => ({ id: ar.id, name: ar.name })),
        duration: song.dt ? Math.floor(song.dt / 1000) : 0,
        cover: song.al?.picUrl || '',
      }))
    }
  } catch (error) {
    console.error('加载歌曲失败:', error)
  }
}

// 监听搜索关键词
watch(
  () => searcher.keyword,
  (newKeyword) => {
    if (typeof newKeyword !== 'string') return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      loadMusic(newKeyword)
    }, 300)
  },
  { immediate: true },
)

const playSong = async (song: SongItem) => {
  player.playFM = false
  player.playnormal = true
  player.nextSongUrl = null
  await player.addSongToPlaylist(song.id, player.currentSongIndex + 1)
  player.playcurrentSong({ firstId: song.id })
}

const goToAllSongs = () => router.push({ name: 'WholeSearchSongs' })
const TurnIn = (artistid: number) => router.push({ name: 'artist', params: { id: artistid } })

// --- 菜单控制逻辑 (复刻 NewSongs) ---

// 打开/切换主菜单
const toggleMenu = (id: number) => {
  if (activeMenuId.value === id) {
    closeMenu()
  } else {
    activeMenuId.value = id
    openSubmenuId.value = null // 切换歌曲时，重置二级菜单
  }
}

// 切换二级菜单
const toggleSubmenu = (key: string) => {
  if (openSubmenuId.value === key) {
    openSubmenuId.value = null
  } else {
    openSubmenuId.value = key
  }
}

// 关闭所有菜单
const closeMenu = () => {
  activeMenuId.value = null
  openSubmenuId.value = null
}

// 添加到歌单
const addToPlaylist = async (pid: number, songId: number) => {
  try {
    const res: any = await AddToMyList({ op: 'add', listid: pid, songid: songId })
    if (res.body.code === 200) console.log('添加成功')
  } catch (error) {
    console.error(error)
  }
  closeMenu()
}

// 菜单动作处理
const handleMenuAction = async (action: string, song: SongItem) => {
  if (action === 'playlist') return

  closeMenu()

  switch (action) {
    case 'next':
      await player.addSongToPlaylist(song.id, player.currentSongIndex + 1)
      player.nextSongUrl = null
      break
    case 'like':
      try {
        const res: any = await AddToLike({ id: song.id, like: 'true' })
        if (res.code === 200) console.log('已喜欢')
      } catch (e) {
        console.error(e)
      }
      break
    case 'detail':
      router.push({ name: 'comment', params: { id: song.id } })
      break
  }
}
</script>

<style scoped lang="scss">
$max-width: 1200px;
$hover-bg: rgba(255, 255, 255, 0.1);
$text-main: #ffffff;
$text-sub: #7d7d7d;
// 定义基础颜色变量
$menu-bg:#1c1c1e;
$menu-hover: #3a3a3a;

.song-rec-container {
  width: 100%;
  max-width: $max-width;
  margin: 0 auto;
  padding: 20px 20px;
  box-sizing: border-box;
  user-select: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  padding: 0 4px;

  .title {
    font-size: 24px;
    font-weight: 700;
    color: $text-main;
    margin: 0;
  }

  .view-all {
    font-size: 13px;
    color: $text-sub;
    cursor: pointer;
    text-decoration: none;
    border-radius: 8px;
    transition: background-color 0.3s ease;
    &:hover {
      background-color: $hover-bg;
      color: $text-main;
    }
  }
}

.grid-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 24px;
  width: 100%;
}

.song-card {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  max-width: 270px;
  transition: background-color 0.3s ease;
  position: relative;

  &:hover,
  &.is-active {
    background-color: $hover-bg;
    .play-overlay {
      opacity: 1;
    }
    .more-container {
      opacity: 1;
    }
  }
}

.cover-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;

    svg {
      width: 20px;
      height: 20px;
      fill: #fff;
    }
  }
}

.info-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
  height: 48px;
}

.song-name {
  font-size: 14px;
  color: $text-main;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-name {
  font-size: 12px;
  color: $text-sub;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    cursor: pointer;
    &:hover {
      color: $text-main;
    }
  }
}

/* 更多操作容器 */
.more-container {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
  position: relative;

  .is-active & {
    opacity: 1;
  }

  .more {
    width: 30px;
    height: 30px;
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .is-active & {
      color: #fff;
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
}

/* --- 下拉菜单样式 (已修复模糊失效问题) --- */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 160px;
  /* 修复: 使用 rgba 确保颜色正确且有透明度 */
  background-color: rgba($menu-bg, 0.6);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  padding: 6px;
  z-index: 100;
  margin-top: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: visible !important;

  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* 修复: 移除 translateZ 以允许嵌套模糊 */
  transition: background 0.3s ease;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: #ddd;
  font-size: 13px;
  transition: background-color 0.2s;
  position: relative;

  &:hover,
  &.is-active {
    background-color: $menu-hover;
    color: #fff;
  }

  svg {
    margin-right: 10px;
    opacity: 0.8;
    flex-shrink: 0;
  }
}

/* 二级菜单内容布局 */
.menu-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.arrow {
  margin-left: auto;
  font-size: 16px;
  color: #888;
  line-height: 1;
  transition: transform 0.2s ease;

  &.rotate {
    transform: rotate(90deg);
  }
}

/* --- 二级菜单样式 --- */
.submenu {
  position: absolute;
  top: -4px;
  left: 100%;
  margin-left: 8px;
  width: 180px;
  /* 修复: 透明度稍微调低一点点以便区分层级，并使用正确的 rgba 语法 */
  background-color: rgba($menu-bg, 0.5);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 101;
  padding: 6px;

  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* 修复: 移除 translateZ */
}

.submenu-scroll {
  max-height: 280px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 2px;
  }
}

.submenu .menu-item {
  padding: 8px 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.empty-tip {
  padding: 10px;
  text-align: center;
  color: #666;
  font-size: 12px;
}

// 动画
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* 响应式 */
@media (max-width: 1100px) {
  .grid-wrapper {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 800px) {
  .grid-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 500px) {
  .grid-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
