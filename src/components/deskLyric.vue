<template>
  <div
    class="desktop-lyric-container"
    :class="{ 'is-hover': isHover, 'is-locked': isLocked }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="control-bar" v-if="isHover && !isLocked">
      <div class="drag-zone">
        <span>:::</span>
      </div>
      <div class="actions">
        <button @click="toggleLock" title="锁定 (点击穿透)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
              d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zm-3 7V7c0-1.654 1.346-3 3-3s3 1.346 3 3v2H9z"
            />
          </svg>
        </button>
        <button @click="closeWindow" title="关闭">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
              d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="lyric-wrapper">
      <div class="lrc-text">{{ currentLyric.text || '听见好时光' }}</div>
      <div class="lrc-trans" v-if="currentLyric.trans">{{ currentLyric.trans }}</div>
    </div>
  </div>
</template>

<script setup >
import { ref, onMounted, onUnmounted } from 'vue'

const currentLyric = ref({ text: '', trans: '' })
const isHover = ref(false)
const isLocked = ref(false) // 如果为 true，则永远穿透，无法操作

// 接收主进程转发的歌词
const handleUpdate = (event, data) => {
  currentLyric.value = data
}

onMounted(() => {
  if (window.electronAPI) {
    window.electronAPI.onLyricUpdate(handleUpdate)
    // 默认开启穿透，依靠 hover 来解除穿透
    window.electronAPI.setIgnoreMouse(true)
  }
  // 监听鼠标穿透与交互逻辑
  document.addEventListener('mouseenter', handleMouseEnter)
  document.addEventListener('mouseleave', handleMouseLeave)
})

onUnmounted(() => {
  if (window.electronAPI) {
    window.electronAPI.removeLyricListener(handleUpdate)
  }
})

// === 核心：鼠标穿透逻辑 ===
const handleMouseEnter = () => {
  isHover.value = true
  if (isLocked.value) return // 如果锁定了，不做处理
  // 鼠标移入，关闭穿透 -> 可以点击、拖拽
  window.electronAPI?.setIgnoreMouse(false)
}

const handleMouseLeave = () => {
  isHover.value = false
  if (isLocked.value) return
  // 鼠标移出，开启穿透 -> 点击会点到后面的窗口
  window.electronAPI?.setIgnoreMouse(true)
}

const toggleLock = () => {
  isLocked.value = !isLocked.value
  // 如果锁定了，立刻开启穿透
  if (isLocked.value) {
    window.electronAPI?.setIgnoreMouse(true)
  }
}

const closeWindow = () => {
  window.electronAPI?.toggleDesktopLyric()
}
</script>

<style scoped lang="scss">
.desktop-lyric-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: background 0.2s;

  // 鼠标悬停时显示深色背景，方便看清按钮
  &.is-hover:not(.is-locked) {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 8px;
  }
}

.control-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
  z-index: 10;

  .drag-zone {
    flex: 1;
    height: 100%;
    -webkit-app-region: drag; // 【关键】允许拖拽窗口
    cursor: move;
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.6);
  }

  .actions button {
    -webkit-app-region: no-drag; // 按钮不能拖拽
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    margin-left: 8px;
    padding: 4px;
    &:hover {
      color: #0bdc9a;
    }
  }
}

.lyric-wrapper {
  text-align: center;
  pointer-events: none; // 文字本身不响应鼠标，防止遮挡拖拽
  padding: 0 20px;
}

.lrc-text {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  font-family: 'PingFang SC', sans-serif;

  // 渐变色字体
  background: linear-gradient(to bottom, #fff 30%, #ddd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  // 强力描边/阴影，保证在任何壁纸上可见
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
}

.lrc-trans {
  margin-top: 6px;
  font-size: 18px;
  color: #eee;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
</style>
