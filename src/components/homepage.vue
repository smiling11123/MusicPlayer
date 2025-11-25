<template>
  <div class="main">
    <h2 class="section-title">我的</h2>
    <div class="cards-grid">
      <div class="card daily-card" v-if="UserInfo.backgroundUrl">
        <div class="bg-image" :style="{ backgroundImage: `url(${UserInfo.backgroundUrl})` }"></div>
        <div class="avatar-container">
          <img
            v-if="UserInfo.avatarUrl"
            :src="UserInfo.avatarUrl"
            alt="用户头像"
            class="user-avatar"
          />
        </div>
        <div class="user-info">
          <h3>{{ UserInfo.nickname || '用户名' }}</h3>
        </div>
      </div>
    </div>
  </div>
  
  <div class="MusicList-container">
    <h3 class="list-title">我的歌单</h3>
    <div class="list-wrapper">
      <ul class="list">
        <li v-for="(list, index) in usermusiclist" :key="list.id" class="list-item" @click="goToPlaylist(list.id)">
          <div class="item-content">
            <!-- 左侧封面 -->
            <div class="cover-container">
              <img :src="list.cover + '?param=80y80'" alt="歌单封面" loading="lazy" />
              <div class="play-mask">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <!-- 中间信息 -->
            <div class="info-container">
              <div class="song-title" :title="list.name">
                {{ truncateText(list.name, 20) }}
              </div>
              <div class="meta-info">
                <span class="track-count">{{ list.trackCount || 0 }} 首</span>
                <span class="separator">·</span>
                <span class="play-count">{{ formatPlayCount(list.playCount || 0) }} 播放</span>
              </div>
            </div>

            <!-- 右侧操作 -->
            <div class="right-actions">
              <button class="action-btn more" @click.stop="showActions(list)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userInfo } from '@/stores/userInfo'
import { GetUserMusicList } from '@/api/GetMusicList'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const UserInfo = userInfo()

interface Musiclist {
  id: number
  name: string
  cover: string
  playCount?: number
  trackCount?: number
}

const usermusiclist = ref<Musiclist[]>([])

function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// 格式化播放数
function formatPlayCount(count: number): string {
  if (!count) return '0'
  if (count > 100000000) return (count / 100000000).toFixed(1) + '亿'
  if (count > 10000) return (count / 10000).toFixed(1) + '万'
  return count.toString()
}

// 跳转到歌单详情
const goToPlaylist = (listid: number) => {
  router.push({ name: 'musiclist', params: { id: listid } })
}

// 显示更多操作（占位函数）
const showActions = (list: Musiclist) => {
  console.log('显示歌单操作菜单:', list.name)
  // 这里可以弹出一个菜单，包含“编辑”、“删除”、“分享”等选项
}

onMounted(async () => {
  try {
    const userplaylist = await GetUserMusicList(UserInfo.userId)
    console.log(userplaylist)
    
    usermusiclist.value = userplaylist.playlist.map((list: any) => ({
      id: list.id,
      name: list.name,
      cover: list.coverImgUrl,
      playCount: list.playCount || 0,
      trackCount: list.trackCount || 0,
    }))
  } catch (error) {
    console.error('加载歌单失败:', error)
  }
})
</script>

<style scoped lang="scss">
.main {
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  user-select: none;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
}

.cards-grid {
  display: grid;
  gap: 24px;
  width: 100%;
  margin-bottom: 40px; // 增加与用户歌单的间距
}

.daily-card {
  // 保持原有样式不变
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);
    z-index: 1;
  }

  .bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform 0.5s ease;
    z-index: 0;
  }

  .avatar-container {
    position: relative;
    z-index: 2;
    margin-bottom: 12px;
  }

  .user-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
  }

  .user-info {
    position: relative;
    z-index: 2;
    text-align: center;

    h3 {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

    .bg-image {
      transform: scale(1.05);
    }

    .user-avatar {
      transform: scale(1.1);
    }
  }
}

// 歌单列表样式
.MusicList-container {
  width: 100%;
  padding: 0 20px; // 与顶部卡片对齐
  
  .list-title {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16px;
    margin-left: 8px;
  }
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-item {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(4px) scale(0.99);
  }
}

.item-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 16px;
}

// 左侧封面
.cover-container {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .play-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.2s ease;
    backdrop-filter: blur(2px);

    svg {
      width: 28px;
      height: 28px;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
  }

  &:hover .play-mask {
    opacity: 1;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

// 中间信息
.info-container {
  flex: 1;
  min-width: 0; // 防止flex item溢出

  .song-title {
    font-size: 15px;
    color: #e0e0e0;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    transition: color 0.2s ease;

    .list-item:hover & {
      color: #fff;
    }
  }

  .meta-info {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: #888;

    .separator {
      opacity: 0.5;
    }
  }
}

// 右侧操作
.right-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;

  .list-item:hover & {
    opacity: 1;
  }

  .action-btn {
    width: 32px;
    height: 32px;
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

    &:active {
      transform: scale(0.9);
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;

  svg {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  p {
    font-size: 16px;
    margin-bottom: 8px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .main {
    padding: 16px;
  }

  .section-title {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .MusicList-container {
    padding: 0;
  }

  .item-content {
    padding: 10px 12px;
    gap: 12px;
  }

  .cover-container {
    width: 50px;
    height: 50px;
  }

  .info-container {
    .song-title {
      font-size: 14px;
    }

    .meta-info {
      font-size: 12px;
      gap: 8px;
    }
  }

  .right-actions {
    opacity: 1; // 移动端始终显示操作按钮
  }
}

@media (max-width: 480px) {
  .cover-container {
    width: 45px;
    height: 45px;
  }

  .info-container .song-title {
    font-size: 13px;
  }
}
</style>