import { request } from "./request";
import { MusicIdList } from "./GetMusicFromList";
export const GetMusicUrl = async (params) => {
  return request({
    url: "/song/url",
    params,
  }).then((res) => res.data);
}

export const MusicUrl = async (params) => {
  return await GetMusicUrl(params).then((data)=>data.data);
}

export const GetMusicDetail = async (params) => {
  return request({
    url: "/song/detail",
    params,
  }).then((res) => res.data);
}
// 新增批量版本
export const GetMusicUrls = async (params) => {
  return request({
    url: "/song/url",
    params: { id: params.ids.join(',') },
  }).then((res) => res.data);
}

async function mapWithLimit(items, limit, fn) {
  const results = []
  const executing = []
  
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item))
    results.push(p)
    
    const e = p.then(() => executing.splice(executing.indexOf(e), 1))
    executing.push(e)
    
    if (executing.length >= limit) {
      await Promise.race(executing)
    }
  }
  
  return Promise.all(results)
}

export const GetMusicDetails = async (params) => {
  const ids = Array.isArray(params) ? params : params?.ids
  
  if (!ids || ids.length === 0) return { songs: [] }

  // 限制同时最多 10 个请求
  const results = await mapWithLimit(ids, 10, id => 
    request({
      url: "/song/detail",
      params: { id: String(id) },
    }).then(res => res.data)
  )

  return { songs: results }
}