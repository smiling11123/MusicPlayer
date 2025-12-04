<template>
  <div
    class="desktop-lyric-container"
    :class="{
      'is-locked': isLocked,
      'hide-ui': isLocked && !isHover,
    }"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <div class="control-bar">
      <div class="drag-zone" :class="{ 'can-drag': !isLocked }">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" class="drag-icon">
          <path
            d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zm-3 7V7c0-1.654 1.346-3 3-3s3 1.346 3 3v2H9z"
            opacity="0.5"
          />
          <path d="M8 14h8v2H8zM8 18h8v2H8z" />
        </svg>
        <span class="drag-text" v-if="!isLocked">按住拖动</span>
        <span class="drag-text" v-else>已锁定</span>
      </div>

      <div class="actions">
        <button
          @click="toggleLock"
          @mousedown.stop
          class="action-btn"
          :class="{ active: isLocked }"
          :title="isLocked ? '点击解锁' : '点击锁定'"
          ref="lockBtnRef"
        >
          <svg v-if="isLocked" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path
              d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path
              d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
            />
          </svg>
        </button>

        <button
          @click="closeWindow"
          @mousedown.stop
          class="action-btn"
          title="关闭"
          ref="closeBtnRef"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path
              d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="lyric-wrapper">
      <Transition name="lyric-fade" mode="out-in">
        <div class="lrc-text" :key="currentLyric.text">
          {{ currentLyric.text || '等待播放...' }}
        </div>
      </Transition>

      <Transition name="lyric-fade" mode="out-in">
        <div class="lrc-trans" v-if="currentLyric.trans" :key="currentLyric.trans">
          {{ currentLyric.trans }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { pagecontrol } from '@/stores/page'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const currentLyric = ref({ text: '', trans: '' })
const isHover = ref(false)
const isLocked = ref(false)
const lockBtnRef = ref(null)
const closeBtnRef = ref(null)
const isMainMoving = ref(false)
const pagecontroler = pagecontrol()
let lockBtnRect = null
let closeBtnRect = null
let lastIgnoreState = null
let hoverTimer = null

const handleUpdate = (event, data) => {
  currentLyric.value = typeof data === 'string' ? { text: data, trans: '' } : data
}

const toggleLock = () => {
  isLocked.value = !isLocked.value
  updateBtnRect()
  if (isLocked.value) {
    setIgnoreMouse(true)
  } else {
    setIgnoreMouse(false)
  }
}

const onMouseEnter = (e) => {
  if (e.buttons !== 0 || isMainMoving.value) return

  // 恢复防抖延迟：防止鼠标快速划过时 UI 闪烁，也有助于解决边缘误判问题
  hoverTimer = setTimeout(() => {
    isHover.value = true
    if (isLocked.value) updateBtnRect()
  }, 100)
}

const onMouseLeave = () => {
  if (isMainMoving.value) return

  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }

  isHover.value = false

  // 离开时，务必确保恢复穿透，否则下次可能无法触发 mouseenter
  if (isLocked.value) {
    setIgnoreMouse(true)
  }
}

const onMouseMove = (e) => {
  if (isMainMoving.value) return

  // === 核心修复代码开始 ===
  // 只有当鼠标真正在窗口内部（避开边缘 2px）时，才强制 isHover = true
  // 这样可以防止鼠标离开瞬间产生的边缘事件把 UI 又“点亮”了
  const { clientX, clientY } = e
  const { innerWidth, innerHeight } = window
  const edgeThreshold = 2 // 边缘容错距离

  const isInside =
    clientX > edgeThreshold &&
    clientX < innerWidth - edgeThreshold &&
    clientY > edgeThreshold &&
    clientY < innerHeight - edgeThreshold

  if (isInside && !isHover.value) {
    isHover.value = true
  }
  // === 核心修复代码结束 ===

  if (!isLocked.value) return

  // 只有当 Hover 状态确认为真时，才进行按钮碰撞检测
  // 避免在 isHover 为 false 的情况下执行逻辑
  if (isHover.value && (lockBtnRef.value || closeBtnRef.value)) {
    if (!lockBtnRect || !closeBtnRect) updateBtnRect()

    const padding = 10
    // 碰撞检测逻辑保持不变
    const isOverLockBtn =
      lockBtnRect &&
      clientX >= lockBtnRect.left - padding &&
      clientX <= lockBtnRect.right + padding &&
      clientY >= lockBtnRect.top - padding &&
      clientY <= lockBtnRect.bottom + padding

    const isOverCloseBtn =
      closeBtnRect &&
      clientX >= closeBtnRect.left - padding &&
      clientX <= closeBtnRect.right + padding &&
      clientY >= closeBtnRect.top - padding &&
      clientY <= closeBtnRect.bottom + padding

    const isOverBtn = isOverLockBtn || isOverCloseBtn
    setIgnoreMouse(!isOverBtn)
  } else if (!isHover.value && isLocked.value) {
    // 如果不是 Hover 状态且已锁定，确保是穿透的
    setIgnoreMouse(true)
  }
}

const updateBtnRect = () => {
  nextTick(() => {
    if (lockBtnRef.value) lockBtnRect = lockBtnRef.value.getBoundingClientRect()
    if (closeBtnRef.value) closeBtnRect = closeBtnRef.value.getBoundingClientRect()
  })
}

const setIgnoreMouse = (ignore) => {
  if (lastIgnoreState !== ignore) {
    lastIgnoreState = ignore
    window.electronAPI?.setIgnoreMouse(ignore)
  }
}

const closeWindow = () => {
  window.electronAPI?.toggleDesktopLyric()
}

onMounted(() => {
  if (window.electronAPI) {
    window.electronAPI.onLyricUpdate(handleUpdate)
    window.electronAPI.setIgnoreMouse(false)

    window.electronAPI.onMainWindowMoving((event, moving) => {
      isMainMoving.value = moving
      if (moving) {
        isHover.value = false
        if (hoverTimer) clearTimeout(hoverTimer)
        lastIgnoreState = null
      } else {
        lastIgnoreState = null
        if (isLocked.value) {
          setIgnoreMouse(true)
        } else {
          setIgnoreMouse(false)
        }
      }
    })
  }
  window.addEventListener('resize', updateBtnRect)
})

onUnmounted(() => {
  if (window.electronAPI) {
    window.electronAPI.removeLyricListener(handleUpdate)
  }
  window.removeEventListener('resize', updateBtnRect)
})
</script>

<style scoped lang="scss">
.desktop-lyric-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  overflow: hidden;
  user-select: none;
  transition: all 0.2s ease;

  &.is-locked {
    background: transparent;
    pointer-events: auto;
    border: 1px solid transparent;
  }

  /* 未锁定状态 */
  &:not(.is-locked) {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    pointer-events: auto;
  }
}

/* 控制条样式 */
.control-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  z-index: 100;
  box-sizing: border-box;

  opacity: 1;
  transition: opacity 0.2s ease;

  pointer-events: auto;

  .drag-zone {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.6);
    cursor: default;

    &.can-drag {
      -webkit-app-region: drag;
      cursor: move;
    }
  }

  .actions {
    display: flex;
    gap: 4px;
    -webkit-app-region: no-drag;
    pointer-events: auto;

    .action-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      padding: 6px;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        color: #fff;
      }

      &.active {
        color: #ffcd32;
        background: rgba(255, 205, 50, 0.15);
      }
    }
  }
}

.hide-ui .control-bar {
  opacity: 0;
  pointer-events: none;
}

.lyric-wrapper {
  pointer-events: none;
  text-align: center;
  width: 100%;
  padding: 0 20px;
}

.lrc-text {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.3;
  background: linear-gradient(to bottom, #fff 30%, #ddd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
}

.lrc-trans {
  margin-top: 6px;
  font-size: 18px;
  color: #eee;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* === 新增：歌词淡入淡出动效 === */
/* name="lyric-fade" 
   enter-active/leave-active: 定义过渡的时间和曲线
   enter-from/leave-to: 定义开始和结束时的透明度/位置 
*/
.lyric-fade-enter-active,
.lyric-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.lyric-fade-enter-from,
.lyric-fade-leave-to {
  opacity: 0;
  /* 稍微加一点位移，会有向上浮现的高级感；如果不想要位移，删除 transform 即可 */
  transform: translateY(5px);
}
</style>
