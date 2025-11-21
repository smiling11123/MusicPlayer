<template>
  <header class="topbar">
    <div class="left">
      <button class="fold">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><circle cx="9" cy="6" r="1" fill="currentColor"></circle><path d="M26 10H6a2.002 2.002 0 0 1-2-2V4a2.002 2.002 0 0 1 2-2h20a2.002 2.002 0 0 1 2 2v4a2.002 2.002 0 0 1-2 2zM6 4v4h20V4z" fill="currentColor"></path><circle cx="9" cy="16" r="1" fill="currentColor"></circle><path d="M26 20H6a2.002 2.002 0 0 1-2-2v-4a2.002 2.002 0 0 1 2-2h20a2.002 2.002 0 0 1 2 2v4a2.002 2.002 0 0 1-2 2zM6 14v4h20v-4z" fill="currentColor"></path><circle cx="9" cy="26" r="1" fill="currentColor"></circle><path d="M26 30H6a2.002 2.002 0 0 1-2-2v-4a2.002 2.002 0 0 1 2-2h20a2.002 2.002 0 0 1 2 2v4a2.002 2.002 0 0 1-2 2zM6 24v4h20v-4z" fill="currentColor"></path></svg>
      </button>
      <!-- 左侧可放返回/前进等，设置 no-drag 的按钮 -->
      <button class="btn-control" @click="$router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 512"><path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z" fill="currentColor"></path></svg>
      </button>
      <button class="btn-control" @click="$router.forward()">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 256 512"><path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4l-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z" fill="currentColor"></path></svg>
      </button>
    </div>

    <div class="center">
      <!-- 中央区域仍然可拖动 -->
    <button class="tohome" @click="$router.push('/')">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 8.71l-5.333-4.148a2.666 2.666 0 0 0-3.274 0L5.059 8.71a2.665 2.665 0 0 0-1.029 2.105v7.2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.2c0-.823-.38-1.6-1.03-2.105">
          </path><path d="M16 15c-2.21 1.333-5.792 1.333-8 0"></path></g>
      </svg>
    </button>
    </div>

    <div class="right">
      <!-- 窗口控制按钮，必须设置 no-drag -->
       <button class="user" @click="ToUser">
        <img class="userPic" :src="userInfos.avatarUrl" @click="ToUser"></img>
       </button>
      <button class="settings" >

      </button>
      <button class="win-btn" @click="minimize" title="最小化">━</button>
      <button class="win-btn" @click="toggleMax" title="最大化/还原">▢</button>
      <button class="win-btn close" @click="close" title="关闭">✕</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userInfo } from '@/stores/userInfo'
const isMax = ref(false)
const userInfos = userInfo()
const minimize = () => {
  // electronAPI 由 preload 暴露
  window.electronAPI?.minimize?.()
}

const toggleMax = async () => {
  const res = await window.electronAPI?.toggleMaximize?.()
  isMax.value = !!res
}

const close = () => {
  window.electronAPI?.close?.()
}
const ToUser = () => {

}
</script>

<style>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1000;

  /* 毛玻璃效果 */
    background: rgba(25, 25, 25, 0.95); /* 深色底 */
  backdrop-filter: blur(20px) saturate(180%); /* 毛玻璃 */
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255,255,255,0.04);

  /* 关键：允许整个 topbar 区域做拖拽 */
  -webkit-app-region: drag;
}
.btn-control{
    background: none;
  width: 25px;
  height: 25px;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  
  border-radius: 8px;
  transition: color 0.2s;
  -webkit-app-region: no-drag;
  &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  
}
/* 内部交互元素不能被拖动（否则点击无效） */
.topbar .left,
.topbar .center,
.topbar .right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tohome, .fold {
  background: none;
  width: 40px;
  height: 40px;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: color 0.2s;
  -webkit-app-region: no-drag;
  &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  
}
/* 所有按钮区域必须声明 no-drag */
.btn,
.win-btn,
.control {
  -webkit-app-region: no-drag;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
}
.win-btn.close {
  color: #fff;
  background: rgba(145, 145, 145, 0.12);
}
.win-btn:hover { background: rgba(255,255,255,0.04); }
.btn:hover { background: rgba(255,255,255,0.02); }

.user{
  background: none;
  width: 45px;
  height: 45px;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 6px;
  transition: color 0.2s;
  -webkit-app-region: no-drag;
}
.userPic {
  width: 100%;
  height: 100%;
  border-radius: 50%; /* 核心：圆形 */
  object-fit: cover; /* 保持比例填充 */
  display: block;
}
</style>