<template>
  <div class="discover-container">
    <div class="header-section">
      <nav class="nav-tabs">
        <router-link to="/WholeMusicHub/WholeMusicHubArtist" class="tab-pill" active-class="active">
          歌手
        </router-link>
        <router-link to="/WholeMusicHub/WholeMusicHubList" class="tab-pill" active-class="active">
          歌单
        </router-link>
        <router-link to="/WholeMusicHub/WholeMusicHubRank" class="tab-pill" active-class="active">
          排行榜
        </router-link>
      </nav>
    </div>

    <div class="content-view">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
// 逻辑非常简单，主要依赖 router-link 的自动状态管理
</script>

<style scoped lang="scss">
// 颜色变量
$bg-color: #1c1c1e;
$text-main: #ffffff;
$text-sub: #7d7d7d;
$tab-bg: #222222; // 未选中背景
$active-bg: #3a3a3a; // 选中背景 
$hover-bg: #333333;

.discover-container {
  padding: 30px 40px;
  background-color: $bg-color;
  min-height: 100vh;
  color: $text-main;
}

.header-section {
  margin-bottom: 30px;
  justify-self: center;

  .big-title {
    font-size: 40px;
    font-weight: 800;
    margin-bottom: 20px;
    letter-spacing: 2px;
  }

  .nav-tabs {
    display: flex;
    gap: 15px;
  }

  .tab-pill {
    text-decoration: none;
    padding: 8px 24px;
    font-size: 16px;
    border-radius: 20px; // 胶囊圆角
    background-color: transparent; // 默认透明或根据需求设为灰色
    color: $text-sub;
    transition: all 0.3s ease;
    font-weight: 500;

    // 未选中时的 hover 效果
    &:hover {
      color: $text-main;
      background-color: $hover-bg;
    }

    // 选中状态 (由 vue-router 自动添加 .active 类)
    &.active {
      background-color: $active-bg;
      color: #fff;
      font-weight: bold;
      // 选中时稍微放大一点点
      transform: scale(1.05);
    }
  }
}

// 简单的淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
