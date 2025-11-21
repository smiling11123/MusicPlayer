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
    <ArtistList></ArtistList>
  </div>
</template>

<script setup lang="ts">
import ArtistList from './ArtistList.vue';
import Banner from './Banner.vue'
import DailyFM from './Daily+FM.vue';
import HighQualityMusicList from './HighQualityMusicList.vue'
import NewMusicList from './NewMusicList.vue';
import NewSongs from './NewSongs.vue';
import RecommendList from './RecommendList.vue';
</script>

<style scoped>

</style>
