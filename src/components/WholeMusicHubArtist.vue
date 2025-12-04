<template>
  <div class="artist-library-page">
    <main class="content">
      <div class="top-tags-bar">
        <button
          v-for="area in areas"
          :key="area.value"
          class="tag-pill"
          :class="{ active: queryParams.area === area.value }"
          @click="handleFilterChange('area', area.value)"
        >
          {{ area.name }}
        </button>
        <button class="tag-pill icon-btn" :class="{ active: isPanel }" @click="showPanel">
           •••
        </button>
      </div>

      <transition name="fade">
        <div class="filter-panel" v-if="isPanel">
          <div class="filter-row">
            <div class="filter-label">分类</div>
            <div class="filter-options">
              <span
                v-for="type in types"
                :key="type.value"
                class="option-item"
                :class="{ active: queryParams.type === type.value }"
                @click="handleFilterChange('type', type.value)"
              >
                {{ type.name }}
              </span>
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-label">筛选</div>
            <div class="filter-options initial-options">
              <span
                v-for="initial in initials"
                :key="initial.value"
                class="option-item"
                :class="{ active: queryParams.initial === initial.value }"
                @click="handleFilterChange('initial', initial.value)"
              >
                {{ initial.name }}
              </span>
            </div>
          </div>
        </div>
      </transition>

      <div class="artist-grid">
        <div
          class="artist-card"
          v-for="item in artists"
          :key="item.id"
          @click="goToDetail(item.id)"
        >
          <div class="cover-box">
            <img :src="item.picUrl + '?param=300y300'" class="cover-img" loading="lazy" alt="" />
          </div>
          <div class="card-name">{{ item.name }}</div>
        </div>

        <template v-if="loading && artists.length === 0">
          <div class="artist-card skeleton" v-for="n in 10" :key="'skel-' + n">
            <div class="cover-box"></div>
            <div class="text-placeholder"></div>
          </div>
        </template>
      </div>

      <div ref="loadTrigger" class="load-trigger">
        <span v-if="loading && artists.length > 0">
          <div class="mini-spinner"></div>
          加载中...
        </span>
        <span v-else-if="!hasMore && artists.length > 0">没有更多歌手了</span>
      </div>

      <div v-if="!loading && artists.length === 0" class="empty-state">暂无相关歌手</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// 假设你有一个 Artist 的 API 文件，如果没有请参考下方的 mock 或自行创建
import { GetArtistList } from '@/api/Artist'

const router = useRouter()

export interface ArtistItem {
  id: number
  name: string
  picUrl: string
  musicSize: number
  albumSize: number
}

// --- 筛选配置 ---
// Area: -1:全部, 7:华语, 96:欧美, 8:日本, 16:韩国, 0:其他
const areas = [
  { name: '全部', value: -1 },
  { name: '华语', value: 7 },
  { name: '欧美', value: 96 },
  { name: '日本', value: 8 },
  { name: '韩国', value: 16 },
  { name: '其他', value: 0 },
]

// Type: -1:全部, 1:男歌手, 2:女歌手, 3:乐队
const types = [
  { name: '全部', value: -1 },
  { name: '男歌手', value: 1 },
  { name: '女歌手', value: 2 },
  { name: '乐队/组合', value: 3 },
]

// Initial: -1 (热门), A-Z, 0 (其他)
const initials = [
  { name: '热门', value: -1 },
  ...Array.from({ length: 26 }, (_, i) => ({
    name: String.fromCharCode(65 + i),
    value: String.fromCharCode(97 + i), // api通常接受小写 a-z
  })),
  { name: '#', value: 0 },
]

// --- 状态定义 ---
const isPanel = ref(false) // 筛选面板开关
const artists = ref<ArtistItem[]>([])
const loading = ref(false)
const hasMore = ref(true)
const loadTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// 查询参数
const queryParams = reactive({
  type: -1,
  area: -1,
  initial: -1 as string | number,
  limit: 30,
  offset: 0,
})

// --- 核心方法 ---

/**
 * 获取歌手列表
 * @param isLoadMore 是否为加载更多（分页）
 */
const fetchData = async (isLoadMore = false) => {
  if (loading.value) return
  if (isLoadMore && !hasMore.value) return

  loading.value = true

  // 如果不是加载更多，重置 offset
  if (!isLoadMore) {
    queryParams.offset = 0
  }

  try {
    // 调用 API
    const res: any = await GetArtistList({
      type: queryParams.type,
      area: queryParams.area,
      initial: queryParams.initial,
      limit: queryParams.limit,
      offset: queryParams.offset,
    })

    const newItems: ArtistItem[] = res.artists || []

    if (isLoadMore) {
      artists.value.push(...newItems)
    } else {
      artists.value = newItems
    }

    // 更新分页状态
    if (newItems.length < queryParams.limit) {
      hasMore.value = false
    } else {
      hasMore.value = true
      queryParams.offset += queryParams.limit
    }
  } catch (e) {
    console.error('获取歌手列表失败', e)
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

// 切换筛选条件
const handleFilterChange = (key: 'area' | 'type' | 'initial', value: any) => {
  // 如果值没变，不触发
  if (queryParams[key] === value) return

  queryParams[key] = value

  // 重置列表并重新加载
  artists.value = []
  hasMore.value = true
  fetchData(false)
}

// 切换面板显示
const showPanel = () => {
  isPanel.value = !isPanel.value
}

// 跳转详情页
const goToDetail = (id: number) => {
  router.push({ name: 'artist', params: { id: id } })
}

// --- 无限滚动 ---
const setupIntersectionObserver = () => {
  if (observer) observer.disconnect()

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMore.value && !loading.value) {
        fetchData(true)
      }
    },
    { rootMargin: '200px' },
  )

  if (loadTrigger.value) {
    observer.observe(loadTrigger.value)
  }
}

// 生命周期
onMounted(() => {
  fetchData(false)
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped lang="scss">
// 变量 (与 MusicLibrary 保持一致)
$bg-color: #1c1c1e;
$panel-bg: #232325; // 稍微亮一点的背景用于面板
$text-main: #e0e0e0;
$text-sub: #888888;
$accent-color: #3a3a3a;
$highlight-color: #fff; // 选中高亮色，可根据主题调整

.artist-library-page {
  background-color: $bg-color;
  color: $text-main;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  padding: 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

// --- 顶部标签 ---
.top-tags-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;

  .tag-pill {
    background: transparent;
    border: none;
    color: $text-sub;
    padding: 6px 16px;
    border-radius: 18px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      color: $text-main;
      background: rgba(255, 255, 255, 0.05);
    }
    &.active {
      background-color: $accent-color;
      color: #fff;
      font-weight: 600;
    }
    &.icon-btn {
      margin-left: auto; // 将筛选按钮推到最右边
      background: rgba(255, 255, 255, 0.05);
      &.active {
        background-color: $highlight-color;
        color: #000; // 高亮时字体变黑
      }
    }
  }
}

// --- 筛选面板 ---
.filter-panel {
  background-color: $panel-bg;
  border-radius: 12px;
  padding: 20px 30px;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  .filter-row {
    display: flex;
    margin-bottom: 16px;
    line-height: 2;
    &:last-child {
      margin-bottom: 0;
    }

    .filter-label {
      width: 60px;
      color: $text-sub;
      font-weight: bold;
      font-size: 13px;
      padding-top: 2px;
      flex-shrink: 0;
    }
    .filter-options {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
      font-size: 13px;

      .option-item {
        color: $text-sub;
        cursor: pointer;
        padding: 2px 10px;
        border-radius: 4px;
        transition: all 0.2s;
        &:hover {
          color: $text-main;
        }
        &.active {
          color: $highlight-color;
          background: rgba($highlight-color, 0.1);
          font-weight: 600;
        }
      }
    }
  }
}

// --- 动画 ---
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// --- 歌手网格 ---
.artist-grid {
  display: grid;
  // 响应式布局：每列最小 160px，比歌单稍微小一点点
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 30px 24px;

  .artist-card {
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      .cover-box {
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
      }
      .card-name {
        color: #fff;
      }
    }

    .cover-box {
      width: 100%;
      aspect-ratio: 1 / 1;
      position: relative;
      border-radius: 50%; // 歌手通常用圆形头像，如果想要圆角矩形改成 12px
      overflow: hidden;
      background: #252525;
      margin-bottom: 12px;
      transition: all 0.3s ease;
      border: 2px solid transparent; // 预留边框位置

      .cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }

      // 鼠标悬停图片轻微放大
      &:hover .cover-img {
        transform: scale(1.05);
      }
    }

    .card-name {
      font-size: 15px;
      color: $text-main;
      text-align: center; // 歌手名字居中
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 4px;
    }

    // 骨架屏样式
    &.skeleton {
      .cover-box {
        background: linear-gradient(90deg, #222 25%, #2a2a2a 37%, #222 63%);
        background-size: 400% 100%;
        animation: skeleton-load 1.4s ease infinite;
        border-radius: 50%; // 保持骨架屏也是圆形
      }
      .text-placeholder {
        height: 16px;
        width: 60%;
        background: #222;
        border-radius: 4px;
        margin: 0 auto; // 居中
      }
    }
  }
}

// --- 加载触发条 ---
.load-trigger {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-sub;
  font-size: 13px;

  .mini-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top: 2px solid $text-sub;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }
}

.empty-state {
  text-align: center;
  padding: 100px 0;
  color: $text-sub;
  font-size: 14px;
}

@keyframes skeleton-load {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 移动端适配
@media (max-width: 768px) {
  .content {
    padding: 20px;
  }
  .artist-grid {
    grid-template-columns: repeat(3, 1fr); // 移动端一行3个
    gap: 15px;
  }
}
</style>
