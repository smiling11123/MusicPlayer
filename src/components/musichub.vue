<template>
  <div class="Banner">
    <DailyFM></DailyFM>
  </div>
  <div>
    <NewSongs></NewSongs>
  </div>
  <div>
    <RecommendList></RecommendList>
  </div>

  <div>
    <HighQualityMusicList></HighQualityMusicList>
  </div>

  <div>
    <NewMusicList></NewMusicList>
  </div>

  <div>
    <RecommendArtist></RecommendArtist>
  </div>
</template>

<script setup lang="ts">
import DailyFM from './Daily+FM.vue'
import HighQualityMusicList from './HighQualityMusicList.vue'
import NewMusicList from './NewMusicList.vue'
import NewSongs from './NewSongs.vue'
import RecommendList from './RecommendList.vue'
import RecommendArtist from './RecommendArtist.vue'
</script>

<style scoped></style>
