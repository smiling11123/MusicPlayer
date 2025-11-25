<template>
  <div class="mv-player-container">
    <!-- 加载状态 -->
    <div v-if="!mv.id" class="loading">正在加载视频...</div>
    
    <div v-else class="mv-content">
      <!-- 视频播放区域 -->
      <div class="video-wrapper">
        <video 
          :src="MVUrl" 
          controls
          autoplay
          class="video-player"
          referrerpolicy="no-referrer"
          :poster="mv.cover"
        ></video>
      </div>

      <!-- MV 信息区域 -->
      <div class="mv-info">
        <h1 class="mv-title">{{ mv.tittle }}</h1>
        
        <div class="mv-meta">
          <router-link 
            :to="`/artist/${mv.artistid}`" 
            class="artist-name"
          >
            {{ mv.artistname }}
          </router-link>
          
          <span class="publish-time">{{ mv.publishtime }}</span>
        </div>

        <div class="mv-stats">
          <div class="stat-item">
            <span class="stat-icon">▶</span>
            <span class="stat-value">{{ formatPlayCount(mv.playcount) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">❤</span>
            <span class="stat-value">{{ formatNumber(mv.subcount) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">💬</span>
            <span class="stat-value">{{ formatNumber(mv.commentcount) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">↗</span>
            <span class="stat-value">{{ formatNumber(mv.sharecount) }}</span>
          </div>
        </div>

        <div class="mv-duration">
          时长: {{ formatDuration(mv.duration) }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn-primary">
          <span class="btn-icon">❤</span>
          收藏
        </button>
        <button class="btn-secondary" @click="shareMV">
          <span class="btn-icon">↗</span>
          分享
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Artist } from '@/stores/index'
import { GetVideo, GetVideoUrl } from '@/api/video'

interface MV {
  id: number
  tittle: string  // 修正: title
  artist: Artist[]
  duration: number
  playcount?: number
  subcount?: number
  commentcount?: number
  publishtime?: string
  sharecount?: number
  cover: string
}

const route = useRoute()
const MVUrl = ref<string>('')
const mv = ref<any>({
  id: null,
  tittle: '',
  artistname: '',
  artistid: null,
  duration: 0,
  playcount: 0,
  subcount: 0,
  commentcount: 0,
  publishtime: '',
  sharecount: 0,
  cover: '',
  url: '',
})

const Mvid = computed(() => {
  const mvid = route.params.id
  return Array.isArray(mvid) ? Number(mvid[0]) : Number(mvid)
})

// 格式化播放数 (万/亿)
const formatPlayCount = (count: number = 0) => {
  if (count >= 100000000) return (count / 100000000).toFixed(1) + '亿'
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  return count.toString()
}

// 格式化普通数字
const formatNumber = (num: number = 0) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

// 格式化时长 (mm:ss)
const formatDuration = (ms: number = 0) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// 分享功能
const shareMV = () => {
  if (navigator.share && mv.value.id) {
    navigator.share({
      title: mv.value.tittle,
      text: `正在观看 ${mv.value.artistname} 的 MV《${mv.value.tittle}》`,
      url: window.location.href
    }).catch(() => {
      // 用户取消分享
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('链接已复制到剪贴板')
    })
  }
}

onMounted(async () => {
  try {
    const [mvData, urlData] = await Promise.all([
      GetVideo(Mvid.value),
      GetVideoUrl(Mvid.value)
    ])
    
    mv.value = {
      id: mvData.data.id,
      tittle: mvData.data.name,
      artistname: mvData.data.artistName,
      artistid: mvData.data.artistId,
      duration: mvData.data.duration,
      playcount: mvData.data.playCount,
      subcount: mvData.data.subCount,
      commentcount: mvData.data.commentCount,
      publishtime: mvData.data.publishTime,
      sharecount: mvData.data.shareCount,
      cover: mvData.data.cover,
    }
    
    MVUrl.value = urlData.data.url
  } catch (error) {
    console.error('加载MV失败:', error)
  }
})
</script>

<style scoped lang="scss">
.mv-player-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #fff;
}

.loading {
  text-align: center;
  padding: 60px;
  font-size: 16px;
  color: #888;
}

.video-wrapper {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;

  .video-player {
    width: 100%;
    height: 100%;
    max-height: 675px; // 16:9比例
    display: block;
  }
}

.mv-info {
  margin-bottom: 24px;

  .mv-title {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #fff;
  }

  .mv-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    .artist-name {
      font-size: 16px;
      color: #1db954;
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }

    .publish-time {
      font-size: 14px;
      color: #888;
    }
  }

  .mv-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #b3b3b3;

      .stat-icon {
        font-size: 16px;
      }

      .stat-value {
        font-weight: 500;
      }
    }
  }

  .mv-duration {
    font-size: 14px;
    color: #888;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;

    .btn-icon {
      font-size: 16px;
    }

    &:hover {
      transform: scale(1.04);
    }
  }

  .btn-primary {
    background: #1db954;
    color: #000;

    &:hover {
      background: #1ed760;
    }
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .mv-info .mv-title {
    font-size: 24px;
  }
  
  .mv-stats {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .video-player {
    max-height: 50vh;
  }
}
</style>