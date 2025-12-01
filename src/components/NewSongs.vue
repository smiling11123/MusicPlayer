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

        <div class="more-container">
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
              <div class="menu-item" @click="handleMenuAction('detail', song)">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                    fill="currentColor"
                  />
                </svg>
                <span>更多详情</span>
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
import { useRouter } from 'vue-router'
import { GetRecommendNewMusic } from '@/api/GetMusicList'
import type { SongItem } from '@/stores/index'

const router = useRouter()
const player = Player()
const songs = ref<SongItem[]>([])

// --- 修改点 1: 使用 ID 控制当前激活的菜单 ---
const activeMenuId = ref<number | null>(null)

onMounted(async () => {
  // 全局点击监听，用于关闭菜单
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
})

onUnmounted(async () => {
  document.removeEventListener('click', closeMenu)
})

const playSong = async (song: SongItem) => {
  console.log('播放:', song.name)
  await player.addSongToPlaylist(song.id, player.currentSongIndex + 1)
  player.nextSongUrl = null
  player.playcurrentSong({ firstId: song.id })
}

const goToAllSongs = () => {
  router.push({ name: 'WholeNewSongs' })
}

const TurnIn = (artistid: number) => {
  router.push({ name: 'artist', params: { id: artistid } })
}

// --- 修改点 2: 菜单逻辑 ---

// 切换菜单显示
const toggleMenu = (id: number) => {
  if (activeMenuId.value === id) {
    activeMenuId.value = null // 如果点击的是当前已打开的，则关闭
  } else {
    activeMenuId.value = id // 打开新的
  }
}

// 点击空白处关闭
const closeMenu = () => {
  activeMenuId.value = null
}

// 菜单操作处理
const handleMenuAction = async (action: string, song: SongItem) => {
  closeMenu() // 操作后关闭菜单

  switch (action) {
    case 'next':
      console.log('下一首播放', song.name)
      await player.addSongToPlaylist(song.id, player.currentSongIndex + 1)
      player.nextSongUrl = null
      break
    case 'like':
      console.log('喜欢', song.name)
      // 调用你的喜欢 API
      break
    case 'detail':
      console.log('详情', song.name)
      // router.push(...)
      break
  }
}
</script>

<style scoped lang="scss">
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
  // --- 修改点 3: 移除 overflow: hidden ---
  // 必须移除这个，否则下拉菜单会被卡片边缘切掉。
  // 圆角效果现在由 border-radius 自身负责，只要子元素不溢出即可。
  //overflow: hidden;
  position: relative; // 确保 z-index 上下文

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
  overflow: hidden; // 图片圆角保持
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
  opacity: 0; // 默认隐藏
  transition: opacity 0.2s ease;
  position: relative; // 关键：作为绝对定位下拉菜单的锚点

  // 如果菜单打开，保持按钮显示
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

    // 菜单打开时的按钮激活态
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

/* --- 修改点 4: 下拉菜单样式 --- */
.dropdown-menu {
  position: absolute;
  top: 100%; // 在按钮正下方
  right: 0; // 右对齐
  width: 50px;
  background-color: $menu-bg;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  padding: 6px;
  z-index: 100; // 确保浮在最上层
  margin-top: 4px; // 稍微有点间距
  border: 1px solid rgba(255, 255, 255, 0.05);

  .menu-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 4px;
    cursor: pointer;
    color: #ddd;
    font-size: 13px;
    transition: background-color 0.2s;

    &:hover {
      background-color: $menu-hover;
      color: #fff;
    }

    svg {
      margin-right: 10px;
      opacity: 0.8;
    }
  }
}

// 简单的淡入淡出动画
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

/* 响应式调整 */
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
