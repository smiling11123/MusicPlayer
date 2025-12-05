import { request, withCookie } from '@/api/request'

//获取搜索结果
export const GetSearchData = async (param) => {
  return request({
    url: '/cloudsearch',
    params: withCookie({
      keywords: param.keyword,
      type: param.type,
      limit: param.limit || 30,
      offset: param.offset,
    }),
  }).then((res) => res.data)
}
//搜索建议
export const SearchSuggest = async (params) => {
  return request({
    url: '/search/suggest',
    params,
  }).then((res) => res.data)
}
// 本地歌曲匹配网易云信息
export const MatchMusicInfo = async (params) => {
  return request({
    url: '/cloudsearch',
    params: withCookie({ keywords: params?.keywords, type: params?.type || 1, limit: params?.limit || 100, offset: params?.offset }),
  }).then((res) => res.data)
}

// export async function SearchITunes(keyword) {
//   try {
//     // 限制返回 6 条，只搜音乐
//     const url = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&media=music&entity=song&limit=6`
//     const res = await fetch(url)
//     const data = await res.json()
    
//     // 将 iTunes 格式标准化为我们通用的格式
//     return data.results.map((item) => ({
//       // iTunes ID 前面加个前缀区分，防止和网易云 ID 冲突
//       id: `itunes_${item.trackId}`, 
//       name: item.trackName,
//       // 模拟网易云的 artist 结构
//       ar: [{ name: item.artistName }], 
//       // 模拟网易云的 album 结构
//       al: { 
//         name: item.collectionName,
//         // iTunes 默认给 100x100，替换 url 获得高清大图 (600x600)
//         picUrl: item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') 
//       },
//       dt: item.trackTimeMillis, // 时长
//       source: 'itunes' // 标记来源
//     }))
//   } catch (e) {
//     console.error('iTunes search failed:', e)
//     return []
//   }
// }