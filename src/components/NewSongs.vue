<template>
  <div class="song-rec-container">
    <div class="header">
      <h2 class="title">最新音乐</h2>
      <a class="view-all" @click="goToAllSongs">查看全部</a>
    </div>

    <div class="grid-wrapper">
      <div
        v-for="song in songs"
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
            <span v-if="song.alias" class="alias">({{ song.alias }})</span>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { Player } from '@/stores/index'
import { userInfo } from '@/stores/userInfo'
import { useRouter } from 'vue-router'
import { GetRecommendNewMusic, GetUserMusicList } from '@/api/GetMusicList'
import type { SongItem } from '@/stores/index'
import { AddToLike, AddToMyList } from '@/api/GetMusic'

const router = useRouter()
const player = Player()
const userInfos = userInfo()
const songs = ref<SongItem[]>([])
const activeMenuId = ref<number | null>(null) // 当前打开的一级菜单ID (歌曲ID)
const openSubmenuId = ref<string | null>(null) // 当前打开的二级菜单ID ('playlist'等)
const myPlaylists = ref<any[]>([])

onMounted(async () => {
  document.addEventListener('click', closeMenu)

  try {
    const res = await GetRecommendNewMusic({ limit: 12 })
    songs.value = (res.result || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      alias: item.song.alias?.[0] || item.song.transName || '',
      artists: item.song.artists.map((ar: any) => ({ id: ar.id, name: ar.name })),
      album: item.song.album.name,
      cover: item.picUrl,
      duration: Math.floor(item.song.duration / 1000),
    }))
  } catch (error) {
    console.error('获取新歌失败', error)
  }

  if (userInfos.userId) {
    try {
      const res: any = await GetUserMusicList(userInfos.userId)
      myPlaylists.value = (res.playlist || []).filter(
        (p: any) => p.creator.userId === userInfos.userId,
      )
    } catch (e) {
      console.error(e)
    }
  }
})

onUnmounted(async () => {
  document.removeEventListener('click', closeMenu)
})

// --- 菜单控制逻辑优化 ---

// 打开主菜单
const toggleMenu = (id: number) => {
  if (activeMenuId.value === id) {
    closeMenu() // 如果点击当前已打开的，则关闭
  } else {
    activeMenuId.value = id
    openSubmenuId.value = null // 切换歌曲时，重置二级菜单
  }
}

// 切换二级菜单显示
const toggleSubmenu = (key: string) => {
  if (openSubmenuId.value === key) {
    openSubmenuId.value = null // 关闭
  } else {
    openSubmenuId.value = key // 打开
  }
}

// 关闭所有菜单
const closeMenu = () => {
  activeMenuId.value = null
  openSubmenuId.value = null
}

// 菜单动作处理
const handleMenuAction = async (action: string, song: SongItem) => {
  // 注意：这里不要处理 playlist，playlist 单独由 toggleSubmenu 处理
  if (action === 'playlist') return

  closeMenu() // 点击普通项后关闭菜单

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

const addToPlaylist = async (pid: number, songId: number) => {
  try {
    const res: any = await AddToMyList({ op: 'add', listid: pid, songid: songId })
    if (res.body.code === 200) console.log('添加成功')
  } catch (error) {
    console.error(error)
  }
  closeMenu()
}

// 其他辅助函数保持不变
const playSong = async (song: SongItem) => {
  await player.addSongToPlaylist(song.id, player.currentSongIndex + 1)
  player.nextSongUrl = null
  player.playcurrentSong(song.id)
}
const goToAllSongs = () => router.push({ name: 'WholeNewSongs' })
const TurnIn = (artistid: number) => router.push({ name: 'artist', params: { id: artistid } })
</script>

<style scoped lang="scss">
/* ... 之前的 Grid 和 Card 样式保持不变 ... */
$max-width: 1200px;
$hover-bg: rgba(255, 255, 255, 0.1);
$text-main: #ffffff;
$text-sub: #7d7d7d;
$menu-bg: #1c1c1e;
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

  .alias {
    color: $text-sub;
    margin-left: 4px;
    font-weight: 400;
  }
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
  opacity: 0; /* 默认隐藏 */
  transition: opacity 0.2s ease;
  position: relative;

  /* 激活状态保持显示 */
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

/* --- 下拉菜单样式 --- */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 160px;
  background-color: rgb($menu-bg, 0.6);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  padding: 6px;
  z-index: 100;
  margin-top: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: visible !important;

  /* 关键点 2: 开启毛玻璃模糊效果 */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* 开启硬件加速 */
  transform: translateZ(0);
  will-change: transform;

  /* 可选：添加细微的边框线增强层次感 */
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

/* --- 二级菜单样式修改 --- */
.has-submenu {
  /* 移除 hover 显示逻辑，完全由 v-show 控制 */
}

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
  transition: transform 0.2s ease; /* 箭头旋转动画 */

  &.rotate {
    transform: rotate(90deg);
  }
}

.submenu {
  /* 移除 display: none */
  position: absolute;
  top: -4px;
  left: 100%;
  margin-left: 8px;
  width: 180px;
  background-color: rgb($menu-bg, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 101;
  padding: 6px;

  /* 关键点 2: 开启毛玻璃模糊效果 */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* 开启硬件加速 */
  transform: translateZ(0);
  will-change: transform;

  /* 可选：添加细微的边框线增强层次感 */
  transition: background 0.3s ease;
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
