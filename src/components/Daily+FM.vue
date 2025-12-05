<template>
  <div class="for-you-section">
    <h2 class="section-title">For You</h2>

    <div class="cards-grid">
      <!-- 每日推荐卡片 -->
      <div class="card daily-card" v-if="dailyCover">
        <!-- 使用缩略图作为背景 -->
        <div
          class="bg-image"
          :style="{ backgroundImage: `url(${resizeImage(dailyCover, 500)})` }"
        ></div>
        <div class="overlay" @click="handleDailyClick"></div>

        <div class="daily-content">
          <span class="calendar-text">📅 {{ currentDay }}</span>
          <div class="main-title">每日<br />推荐</div>
        </div>

        <button class="play-btn-overlay" @click="playDaily">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
      <!-- 骨架屏：每日推荐 -->
      <div v-else class="card daily-card loading-skeleton">Loading...</div>

      <!-- 私人 FM 卡片 -->
      <div class="card fm-card" v-if="currentFmSong">
        <div class="fm-cover">
          <img :src="resizeImage(currentFmSong.cover, 200)" alt="FM Cover" loading="lazy" />
        </div>

        <div class="fm-info">
          <div class="song-meta">
            <div class="song-title">{{ currentFmSong.name }}</div>
            <div class="song-artist">{{ currentFmSong.artist }}</div>
          </div>

          <div class="fm-controls">
            <!-- 垃圾桶/不喜欢 -->
            <button class="control-btn sm" @click.stop="handleDislike">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M15.5 4l-1 5H22l-2 10H6v-9l6-6 3.5 4zM4 19h2v-9H4v9z"
                  transform="rotate(180 12 12)"
                />
              </svg>
            </button>

            <!-- 播放/暂停 -->
            <button class="control-btn lg" @click.stop="toggleFmPlay">
              <svg
                v-if="!isFmPlaying"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>

            <!-- 下一首 -->
            <button class="control-btn sm" @click.stop="handleNext">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          <div class="fm-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            私人FM
          </div>
        </div>

        <div
          class="fm-bg-blur"
          :style="{ backgroundImage: `url(${resizeImage(currentFmSong.cover, 50)})` }"
        ></div>
      </div>
      <div v-else class="card fm-card loading-skeleton">Loading...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GetDailyRecommendMusic, GetNextPersonalFM, GetPersonalFM } from '@/api/GetMusicList'
import { ref, onMounted, computed, shallowRef } from 'vue'
import { Player } from '@/stores/index'
import router from '@/router'

interface SimpleSong {
  id: number
  name: string
  album?: string
  artist?: string
  cover?: string
  duration?: number
}

const player = Player()
const currentDay = ref(new Date().getDate())
const dailyCover = ref<string>('')
const mappedDailySongs = shallowRef<SimpleSong[]>([])
const mappedFmSongs = shallowRef<SimpleSong[]>([])

const isFmPlaying = computed(() => {
  return (
    player.isplaying && player.playFM && currentFmSong.value?.id === player.currentSongDetail?.id
  )
})

const currentFmSong = computed(() => {
  return mappedFmSongs.value.length > 0 ? mappedFmSongs.value[0] : null
})

// 图片尺寸优化函数
const resizeImage = (url: string | undefined, size: number) => {
  if (!url) return ''
  return `${url}?param=${size}y${size}`
}

// 统一的数据格式化工具
const formatSongs = (list: any[], isFm = false): SimpleSong[] => {
  return list.map((song: any) => ({
    id: song.id,
    name: song.name,
    album: isFm ? song.album?.name : song.al?.name,
    artist: isFm ? song.artists?.[0]?.name : song.ar?.[0]?.name,
    cover: isFm ? song.album?.picUrl : song.al?.picUrl,
    duration: song.duration ? Math.floor(song.duration / 1000) : 0,
  }))
}

// 统一的 ID 提取工具
const extractIds = (list: SimpleSong[]): number[] => {
  return list.map((s) => s.id)
}

// 检查 FM 列表余量并补充
const checkAndRefillFm = async () => {
  // 阈值：如果当前播放位置接近列表末尾 (剩余 <= 3 首)，或者本地列表为空
  if (
    mappedFmSongs.value.length <= 1 ||
    (player.playFM && player.currentSongIndex - player.playlist.length <= 3)
  ) {
    try {
      const fmRes = await GetPersonalFM()
      const newSongs = formatSongs(fmRes.data, true)

      // 更新本地展示用的列表
      if (mappedFmSongs.value.length === 0) {
        mappedFmSongs.value = newSongs
      }

      // 将新歌加入播放器队列
      const ids = extractIds(newSongs)
      if (ids.length) {
        player.addSongsToPlaylist(ids)
      }
    } catch (e) {
      console.error('Fetch FM failed', e)
    }
  }
}

onMounted(() => {
  // 并行加载，互不阻塞
  initDaily()
  initFm()
})

const initDaily = async () => {
  try {
    const res = await GetDailyRecommendMusic()
    mappedDailySongs.value = formatSongs(res.data.dailySongs, false)
    if (mappedDailySongs.value.length > 0) {
      dailyCover.value = mappedDailySongs.value[0].cover || ''
    }
  } catch (error) {
    console.error('每日推荐获取失败', error)
  }
}

const initFm = async () => {
  try {
    const res = await GetPersonalFM()
    mappedFmSongs.value = formatSongs(res.data, true)
  } catch (error) {
    console.error('私人FM获取失败', error)
  }
}

const handleDailyClick = () => {
  router.push({ name: 'DailyRecommendMusic' })
}

// 播放每日推荐
const playDaily = async () => {
  if (mappedDailySongs.value.length === 0) return

  player.isplaying = true
  player.playnormal = true
  player.playFM = false
  player.nextSongUrl = null

  const ids = extractIds(mappedDailySongs.value)
  const firstId = ids[0]

  // 1. 添加到列表
  await player.addWholePlaylist(ids)
  // 2. 播放第一首
  await player.playcurrentSong(firstId)
  player.loadPlaylistData()
}

// 播放/暂停 FM
const toggleFmPlay = async () => {
  // 如果当前不是 FM 模式，或者当前播放的不是 FM 显示的这首歌
  if (
    !player.playFM ||
    (currentFmSong.value && player.currentSongDetail?.id !== currentFmSong.value.id)
  ) {
    await startFmPlayback()
  } else {
    player.togglePlay()
  }
}

const startFmPlayback = async () => {
  if (mappedFmSongs.value.length === 0) return

  const ids = extractIds(mappedFmSongs.value)
  const firstId = ids[0]

  player.playnormal = false
  player.playFM = true
  player.nextSongUrl = null

  // 确保播放器里有歌
  player.addWholePlaylist(ids)

  await player.playcurrentSong(firstId)
  player.loadPlaylistData()
  player.isplaying = true
}

// 下一首 FM
const handleNext = async () => {
  await checkAndRefillFm()
  player.playNextSong()

  if (mappedFmSongs.value.length > 1) {
    mappedFmSongs.value = mappedFmSongs.value.slice(1)
  }
}

// 不喜欢/垃圾桶
const handleDislike = async () => {
  const currentId = player.currentSongDetail?.id || currentFmSong.value?.id
  if (!currentId) return

  player.removeSongFromPlaylist(currentId)

  try {
    // 调用不喜欢接口，并获取下一首
    const res = await GetNextPersonalFM(currentId)

    // 如果接口返回了新的播放列表，添加到队列
    if (res.data && res.data.length) {
      const newSongs = formatSongs(res.data, true)
      const ids = extractIds(newSongs)
      player.addSongsToPlaylist(ids)

      // 更新本地 UI 列表
      mappedFmSongs.value = newSongs
    } else {
      // 如果没返回新歌，手动切下一首
      await handleNext()
    }
  } catch (e) {
    console.error(e)
    player.playNextSong()
  }
}
</script>

<style scoped lang="scss">
$bg-card: #2b2b2b;
$text-main: #ffffff;
$text-sub: #a1a1a1;
$radius: 16px;

.for-you-section {
  padding: 20px 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  user-select: none;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: $text-main;
  margin-bottom: 16px;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: 180px;
}

/* 骨架屏效果 */
.loading-skeleton {
  background: linear-gradient(90deg, #2b2b2b 25%, #3a3a3a 50%, #2b2b2b 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  color: transparent !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #555;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.card {
  position: relative;
  border-radius: $radius;
  overflow: hidden;
  cursor: pointer;
  // 性能优化：为动画属性开启 will-change
  will-change: transform, box-shadow;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  background-color: $bg-card;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }
}

// --- Daily Card ---
.daily-card {
  display: flex;
  align-items: center;
  padding: 20px;

  .bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    z-index: 0;
    transition: transform 0.5s ease;
    will-change: transform; // 优化缩放性能
  }

  &:hover .bg-image {
    transform: scale(1.05);
  }

  .overlay {
    position: absolute;
    inset: 0; // 简写 top/left/right/bottom: 0
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
    // 移除 backdrop-filter: blur(2px) 以提升性能，或者仅在高性能设备启用
    // 如果必须要有模糊，建议直接在图片上做处理
  }

  .daily-content {
    position: relative;
    z-index: 2;
    margin-left: 20px;

    .calendar-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: block;
      margin-bottom: 4px;
    }

    .main-title {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.2;
      color: #fff;
    }
  }

  .play-btn-overlay {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    backdrop-filter: blur(10px);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s ease;

    svg {
      width: 24px;
      height: 24px;
      fill: #fff;
      margin-left: 2px;
    }
  }

  &:hover .play-btn-overlay {
    opacity: 1;
    transform: scale(1);
  }
}

// --- FM Card ---
.fm-card {
  display: flex;
  padding: 0;

  .fm-bg-blur {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    // 性能热点：大半径模糊非常消耗 GPU，使用缩略图+opacity替代，
    // 或者用 CSS 蒙版。这里保留 blur 但建议配合小图使用。
    filter: blur(40px) opacity(0.2);
    z-index: 0;
    pointer-events: none;
    transform: scale(1.2); // 放大一点避免模糊边缘白边
  }

  .fm-cover {
    position: relative;
    z-index: 2;
    height: 100%;
    aspect-ratio: 1 / 1;
    padding: 16px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      background: #333; // 图片未加载时的占位色
    }
  }

  .fm-info {
    position: relative;
    z-index: 2;
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0; // Flexbox 溢出省略号修复

    .song-meta {
      .song-title {
        font-size: 18px;
        font-weight: 700;
        color: $text-main;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .song-artist {
        font-size: 14px;
        color: $text-sub;
        margin-top: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .fm-controls {
      display: flex;
      align-items: center;
      gap: 16px;

      .control-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
        border-radius: 8px;
        padding: 4px;

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        &.sm svg {
          width: 24px;
          height: 24px;
          color: $text-sub;
        }
        &.lg svg {
          width: 36px;
          height: 36px;
          fill: $text-main;
        }
      }
    }

    .fm-logo {
      position: absolute;
      bottom: 16px;
      right: 16px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
    height: auto; // 移动端自适应高度
  }
  .card {
    height: 160px; // 移动端卡片高度
  }
}
</style>
