<template>
  <SearchMusic></SearchMusic>
  <SearchArtist></SearchArtist>
  <SearchMusicList></SearchMusicList>
  <SearchAlbum></SearchAlbum>
  <SearchMV></SearchMV>
  <SearchVideo></SearchVideo>
</template>

<script setup lang="ts">
import SearchMusic from './SearchMusic.vue'
import SearchArtist from './SearchArtist.vue'
import SearchAlbum from './SearchAlbum.vue'
import SearchMV from './SearchMV.vue'
import SearchMusicList from './SearchMusicList.vue'
import SearchVideo from  './SearchVideo.vue'
import { onMounted, watch } from 'vue'
import { search } from '@/stores/search'
import { useRouter } from 'vue-router'

const router = useRouter()
const searcher = search()

onMounted(() =>{
  if(searcher.keyword === '' ){
      router.replace('/')
  }
})
</script>

<style scoped>


</style>
