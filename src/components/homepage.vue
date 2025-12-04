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
    <div class="header-row">
      <h3 class="list-title">本地音乐</h3>
      <button class="add-btn" @click="openCreateModal" title="新建本地歌单">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>

    <div class="list-wrapper">
      <ul class="list">
        <li class="list-item" @click="router.push({ name: 'localMusic' })">
          <div class="item-content">
            <div class="cover-container">
              <div class="local-icon-placeholder">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>
            </div>
            <div class="info-container">
              <div class="song-title">本地歌曲文件</div>
              <div class="meta-info">扫描本地文件</div>
            </div>
          </div>
        </li>

        <li
          v-for="(list, index) in localPlaylists"
          :key="list.id"
          class="list-item"
          @click="goToLocalPlaylist(list.id)"
        >
          <div class="item-content">
            <div class="cover-container">
              <img
                
                onerror="this.style.display='none'"
                alt="封面"
                class="cover-img"
              />
              <div class="default-cover" v-if="true">
                <span class="cover-text">{{ list.name.slice(0, 1) }}</span>
              </div>
              <div class="play-mask">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>

            <div class="info-container">
              <div class="song-title" :title="list.name">
                {{ truncateText(list.name, 20) }}
                <span class="tag-local">本地</span>
              </div>
              <div class="meta-info">
                <span class="track-count">{{ list.trackCount || 0 }} 首</span>
                <span class="separator">·</span>
                <span class="create-time">{{ formatDate(list.createTime) }}</span>
              </div>
            </div>

            <div class="right-actions">
              <button class="action-btn delete" @click.stop="deleteLocalPlaylist(list.id)">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
      <div v-if="localPlaylists.length === 0" class="empty-tip">暂无自建歌单</div>
    </div>
  </div>

  <div class="MusicList-container">
    <h3 class="list-title">最近听过</h3>
    <div class="recentList-wrapper">
      <ul class="list">
        <li class="list-item" @click="router.push({ name: 'recentListen' })">
          <div class="item-content">
            <div class="cover-container">
              <img src="/recent.png" alt="歌单封面" loading="lazy" />
              <div class="play-mask">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div class="info-container">
              <div class="recent-title">最近听过的所有歌曲</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>

  <div class="MusicList-container">
    <h3 class="list-title">我的歌单</h3>
    <div class="list-wrapper">
      <ul class="list">
        <li
          v-for="(list, index) in usermusiclist"
          :key="list.id"
          class="list-item"
          @click="goToPlaylist(list.id)"
        >
          <div class="item-content">
            <div class="cover-container">
              <img :src="list.cover + '?param=80y80'" alt="歌单封面" loading="lazy" />
              <div class="play-mask">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
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
            <div class="right-actions">
              <button class="action-btn more" @click.stop="showActions(list)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="closeCreateModal">
    <div class="modal-content">
      <h3>新建本地歌单</h3>
      <input
        v-model="newPlaylistName"
        ref="inputRef"
        type="text"
        placeholder="请输入歌单名称"
        @keyup.enter="confirmCreate"
      />
      <div class="modal-actions">
        <button class="btn-cancel" @click="closeCreateModal">取消</button>
        <button class="btn-confirm" @click="confirmCreate" :disabled="!newPlaylistName.trim()">
          创建
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userInfo } from '@/stores/userInfo'
import { GetUserMusicList } from '@/api/GetMusicList'
import { onMounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const UserInfo = userInfo()

// --- 类型定义 ---
interface Musiclist {
  id: number
  name: string
  cover: string
  playCount?: number
  trackCount?: number
}

// 本地歌单类型
interface LocalPlaylist {
  id: string // 使用 uuid 或时间戳字符串
  name: string
  trackCount: number
  createTime: number
}

// --- 状态 ---
const usermusiclist = ref<Musiclist[]>([])
const localPlaylists = ref<LocalPlaylist[]>([])
const showModal = ref(false)
const newPlaylistName = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

// --- 工具函数 ---
function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

function formatPlayCount(count: number): string {
  if (!count) return '0'
  if (count > 100000000) return (count / 100000000).toFixed(1) + '亿'
  if (count > 10000) return (count / 10000).toFixed(1) + '万'
  return count.toString()
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

// --- 导航 ---
const goToPlaylist = (listid: number) => {
  router.push({ name: 'musiclist', params: { id: listid } })
}

// 跳转到本地歌单详情（假设你有这个路由，参数传 local_xxx）
const goToLocalPlaylist = (id: string) => {
  // 这里你可以定义一个新的路由 name: 'localPlaylist'
  // 或者复用 musiclist，在页面内判断 id 是否以 'local_' 开头
  console.log('跳转本地歌单:', id)
  router.push({ name: 'localPlaylist', params: { id: id } })
}

const showActions = (list: Musiclist) => {
  console.log('显示歌单操作菜单:', list.name)
}

// --- 本地歌单逻辑 ---

// 加载本地歌单
const loadLocalPlaylists = () => {
  const stored = localStorage.getItem('my_local_playlists')
  if (stored) {
    try {
      localPlaylists.value = JSON.parse(stored)
    } catch (e) {
      console.error('读取本地歌单失败', e)
      localPlaylists.value = []
    }
  }
}

// 打开弹窗
const openCreateModal = () => {
  showModal.value = true
  newPlaylistName.value = ''
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 关闭弹窗
const closeCreateModal = () => {
  showModal.value = false
}

// 确认创建
const confirmCreate = () => {
  if (!newPlaylistName.value.trim()) return

  const newList: LocalPlaylist = {
    id: `local_${Date.now()}`, // 生成唯一ID
    name: newPlaylistName.value.trim(),
    trackCount: 0,
    createTime: Date.now(),
  }

  localPlaylists.value.unshift(newList) // 添加到头部
  saveLocalPlaylists()
  closeCreateModal()
}

// 删除本地歌单
const deleteLocalPlaylist = (id: string) => {
  if (confirm('确定要删除这个本地歌单吗？')) {
    localPlaylists.value = localPlaylists.value.filter((list) => list.id !== id)
    saveLocalPlaylists()
  }
}

// 保存到 localStorage
const saveLocalPlaylists = () => {
  localStorage.setItem('my_local_playlists', JSON.stringify(localPlaylists.value))
}

onMounted(async () => {
  loadLocalPlaylists() // 加载本地歌单

  try {
    const userplaylist = await GetUserMusicList(UserInfo.userId)
    usermusiclist.value = userplaylist.playlist.map((list: any) => ({
      id: list.id,
      name: list.name,
      cover: list.coverImgUrl,
      playCount: list.playCount || 0,
      trackCount: list.trackCount || 0,
    }))
  } catch (error) {
    console.error('加载API歌单失败:', error)
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
  margin-bottom: 40px;
}

.daily-card {
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
  padding: 0 20px;
  margin-bottom: 30px; // 模块间距

  // 标题行样式
  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between; // 标题和加号分开
    margin-bottom: 16px;
    margin-left: 8px;
    padding-right: 16px;

    .list-title {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .add-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #fff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: #1c1c1c;
        transform: rotate(90deg);
      }
    }
  }

  // 兼容原本只有 h3 的情况
  & > .list-title {
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
  background: #2a2a2a; // 默认底色

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    position: relative;
    z-index: 1;
  }

  // 本地歌单默认封面
  .default-cover {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #333, #444);
    z-index: 0;
    .cover-text {
      font-size: 24px;
      font-weight: bold;
      color: rgba(255, 255, 255, 0.2);
      text-transform: uppercase;
    }
  }

  // 本地文件图标
  .local-icon-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(11, 220, 154, 0.1);
    color: #1c1c1c;
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
    z-index: 2;

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

.recent-title {
  font-size: 15px;
  color: #e0e0e0;
  margin-bottom: 0; // 修复原本可能的布局问题
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  transition: color 0.2s ease;
  .list-item:hover & {
    color: #fff;
  }
}

// 中间信息
.info-container {
  flex: 1;
  min-width: 0;

  .song-title {
    font-size: 15px;
    color: #e0e0e0;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    .list-item:hover & {
      color: #fff;
    }

    .tag-local {
      font-size: 10px;
      border: 1px solid #1c1c1c;
      color: #1c1c1c;
      padding: 0 4px;
      border-radius: 3px;
      height: 16px;
      line-height: 14px;
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
    &.delete:hover {
      color: #ff4d4f;
      background: rgba(255, 77, 79, 0.1);
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

.empty-tip {
  text-align: center;
  color: #555;
  font-size: 13px;
  padding: 10px 0;
}

// 弹窗样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1c1c1e;
  width: 320px;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);

  h3 {
    margin: 0 0 20px 0;
    color: #fff;
    font-size: 18px;
    text-align: center;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid transparent;
    padding: 12px 16px;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    outline: none;
    margin-bottom: 24px;
    transition: border 0.2s;

    &:focus {
      border-color: #1c1c1c;
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .modal-actions {
    display: flex;
    gap: 12px;

    button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: opacity 0.2s;

      &.btn-cancel {
        background: rgba(255, 255, 255, 0.1);
        color: #ddd;
        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      }

      &.btn-confirm {
        background: #0bdc9a;
        color: #fff;
        &:hover {
          opacity: 0.9;
        }
        &:disabled {
          background: #333;
          color: #666;
          cursor: not-allowed;
        }
      }
    }
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
    opacity: 1;
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
