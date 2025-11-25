import Artist from '@/components/Artist.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import MusicList from '@/components/MusicList.vue'
import Musichub from '@/components/MusicHub.vue'
import SearchResult from '@/components/SearchResult.vue'
import Album from '@/components/Album.vue'
import DailyRecommendMusic from '@/components/DailyRecommendMusic.vue'
import WholeNewSongs from '@/components/WholeNewSongs.vue'
import WholeSearchSongs from '@/components/WholeSearchSongs.vue'
import MV from '@/components/MV.vue'
import Video from '@/components/Video.vue'
const routes = [
  {
    path: '/',
    name: 'Hub',
    component: Musichub,
  },
  {
    path: '/SearchResult/artist/:id',
    name: 'searchartist',
    component: Artist,
  },
  {
    path: '/mv/:id',
    name: 'mv',
    component: MV,
  },
  {
    path: '/artist/:id',
    name: 'artist',
    component: Artist,
  },
  {
    path: '/musiclist/:id',
    name: 'musiclist',
    component: MusicList,
  },
  {
    path: '/SearchResult/musiclist/:id',
    name: 'searchmusiclist',
    component: MusicList,
  },
  {
    path: '/SearchResult',
    name: 'searchresult',
    component: SearchResult,
  },
  {
    path: '/SearchResult/Album/:id',
    name: 'searchalbum',
    component: Album,
  },
  {
    path: '/Album/:id',
    name: 'album',
    component: Album,
  },
  {
    path: '/DailyRecommendMusic',
    name: 'DailyRecommendMusic',
    component: DailyRecommendMusic,
  },
  {
    path: '/WholeNewSongs',
    name: 'WholeNewSongs',
    component: WholeNewSongs,
  },
  {
    path: '/WholeSearchSongs',
    name: 'WholeSearchSongs',
    component: WholeSearchSongs,
  },
  {
    path: '/SearchResult/mv/:id',
    name: 'searchmv',
    component: MV,
  },
    {
    path: '/SearchResult/video/:id',
    name: 'searchvideo',
    component: Video,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
