<template>
  <!-- 顶部栏 -->
  <div class="Topbar">
    <Topbar />
  </div>

  <!-- 主内容区 -->
  <main class="mainpage">
    <n-split
      direction="horizontal"
      :default-size="0.2"
      :max="0.33"
      :min="0.15"
      :resize-trigger-size="1"
      @update:size="onPaneResize"
    >
      <!-- Pane 1: 左侧 -->
      <template #1>
        <div class="scroll-pane" v-show="pagecontroler.IsLogin" key="homepage">
          <Homepage />
        </div>
        <div class="scroll-pane To-login" v-show="!pagecontroler.IsLogin" key="tologin">
          <ToLogin />
        </div>
      </template>

      <!-- 右侧区域 -->
      <template #2>
        <n-split 
          v-show="pagecontroler.ShowPlayList"
          direction="horizontal" 
          :default-size="0.6" 
          :min="0.5" 
          :max="0.85"
          @update:size="onPaneResize"
        >
          <!-- Pane 2: 中间 -->
          <template #1>
            <div class="scroll-pane">
              <router-view v-slot="{ Component }">
                <keep-alive :include="cachedComponents">
                  <component :is="Component" :key="route.fullPath" />
                </keep-alive>
              </router-view>
            </div>
          </template>

          <!-- Pane 3: 右侧播放列表 -->
          <template #2>
            <div class="PlayList scroll-pane">
              <PlayList />
            </div>
          </template>
        </n-split>
        
        <!-- 无播放列表时的主视图 -->
        <div v-show="!pagecontroler.ShowPlayList" class="scroll-pane">
          <router-view v-slot="{ Component }">
            <keep-alive :include="cachedComponents">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </router-view>
        </div>
      </template>
    </n-split>
  </main>

  <!-- 底部栏 -->
  <div class="TouchBar">
    <Touchbar />
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onUnmounted, nextTick, defineAsyncComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NSplit } from 'naive-ui'
import { pagecontrol } from '@/stores/page'

// 懒加载组件（非关键路径组件）
const Topbar = defineAsyncComponent(() => import('@/components/topbar.vue'))
const Touchbar = defineAsyncComponent(() => import('./components/touchbar.vue'))
const Homepage = defineAsyncComponent(() => import('@/components/homepage.vue'))
const ToLogin = defineAsyncComponent(() => import('./components/ToLogin.vue'))
const PlayList = defineAsyncComponent(() => import('@/components/playlist.vue'))

// 状态管理
const pagecontroler = pagecontrol()
const route = useRoute()

// 需要缓存的组件名称
const cachedComponents = ref(['Musichub', 'Lricypage'])

// 路由key，用于精确控制组件复用
const routeKey = computed(() => route.fullPath)

// 防抖函数
const debounce = (fn, delay = 100) => {
  let timer = null
  return (...args) => {
    timer && clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 面板大小变化回调（防抖优化）
const onPaneResize = debounce((size) => {
  // 触发窗口resize事件，让子组件响应式调整
  window.dispatchEvent(new Event('resize'))
}, 150)

// 滚动性能优化：passive事件监听
let scrollElements = []
onMounted(() => {
  nextTick(() => {
    scrollElements = document.querySelectorAll('.scroll-pane')
    scrollElements.forEach(el => {
      el.addEventListener('scroll', handleScroll, { passive: true })
    })
  })
})

onUnmounted(() => {
  scrollElements.forEach(el => {
    el.removeEventListener('scroll', handleScroll)
  })
})

// 滚动节流处理
const handleScroll = debounce((e) => {
  // 可以在这里添加滚动时的逻辑，如懒加载等
}, 100)

// 性能监控
onMounted(() => {
  // 使用 PerformanceObserver 监控性能
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`[Performance] ${entry.name}: ${entry.duration}ms`)
      }
    })
    observer.observe({ entryTypes: ['measure', 'navigation'] })
  }
})
</script>

<style scoped>
/* ===== 性能优化后的样式 ===== */

/* 使用 CSS contain 隔离渲染 */
.Topbar, .TouchBar, .mainpage {
  contain: layout style paint;
}

.Topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: #000000;
  /* 使用 transform 替代 top/left 动画 */
  transform: translateZ(0);
  will-change: transform;
}

.TouchBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  z-index: 1000;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  background: #000000;
  transform: translateZ(0);
  will-change: transform;
}

.mainpage {
  position: fixed;
  top: 50px;
  bottom: 50px;
  left: 0;
  right: 0;
  padding: 0 1%;
  box-sizing: border-box;
  /* 创建复合层提升渲染性能 */
  transform: translateZ(0);
}

/* 独立滚动面板 - 性能优化版 */
.scroll-pane {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  /* 使用 overscroll-behavior 减少滚动嵌套问题 */
  overscroll-behavior: contain;
  /* 平滑滚动 */
  scroll-behavior: smooth;
  /* 内容可见性优化（浏览器支持时） */
  content-visibility: auto;
  /* 隔离滚动层 */
  contain: layout style paint;
}

/* 针对 WebKit 内核的滚动条优化 */
.scroll-pane::-webkit-scrollbar {
  width: 6px;
}

.scroll-pane::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-pane::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
  /* 减少重绘 */
  background-clip: padding-box;
}

.scroll-pane::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* 播放列表容器 */
.PlayList {
  height: 100%;
  transition: opacity 0.3s ease;
  overflow-y: auto;
  contain: layout style paint;
}

/* 登录页面居中布局优化 */
.To-login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

/* 响应式优化 - 减少小屏幕上的动画 */
@media (max-width: 768px) {
  .scroll-pane {
    scroll-behavior: auto;
  }
  
  .PlayList {
    transition: none;
  }
}

/* 减少选择器层级深度，提升样式计算性能 */
:deep(.n-split-pane) {
  contain: layout style paint;
}
</style>