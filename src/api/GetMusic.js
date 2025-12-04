import { request, requestwordlyric, withCookie } from './request'
//传入歌曲Id，获取歌曲的播放地址url
export const GetMusicUrl = async (params) => {
  return request({
    url: '/song/url',
    params: withCookie(params),
  }).then((res) => res.data)
}
//传入歌曲Id，获取解析出来的url
export const MusicUrl = async (params) => {
  return await GetMusicUrl(params).then((data) => data.data)
}

//获取解灰url
export const UnblockMusicUrl = async (params) => {
  return request({
    url: '/song/url/unblock',
    params: {id: params }
  }).then((res)=> res.data)
}
//传入歌曲Id，获取歌曲的详细信息
export const GetMusicDetail = async (params) => {
  return request({
    url: '/song/detail',
    params,
  }).then((res) => res.data)
}
// 新增批量版本
export const GetMusicUrls = async (params) => {
  return request({
    url: '/song/url',
    params: { id: params.ids.join(',') },
  }).then((res) => res.data)
}

//获取歌词
export const GetMusicLyric = async (params) => {
  return request({
    url: '/lyric',
    params: {id: params},
  }).then((res) => res.data)
}
//获取逐字歌词
export const GetWordMusicLyric = async (params) => {
  return request({
    url: '/lyric/new',
    params: {id: params},
  }).then((res) => res.data)
}
export const GetMusicPicUrl = async (params) => {
  return request({
    url: '/song/detail',
    params,
  }).then((res) => res.data.songs[0].al.picUrl)
}
//获取评论
export const GetMusicComment = async (params) => {
  return request({
    url: '/comment/music',
    params: withCookie({id: params?.id, limit: params?.limit, offset: params?.offset }),
  }).then((res) => res.data)
}
// 添加至我喜欢
export const AddToLike = async (params) => {
  return request({
    url: '/like',
    params: withCookie({id: params?.id, like: params?.like})
  }).then((res) => res.data)
}

//添加至我的歌单
export const AddToMyList = async (params) => {
  return request({
    url: '/playlist/tracks',
    params: withCookie({op: params?.op, pid: params?.listid, tracks: params?.songid })
  }).then((res) => res.data)
} 

//评论
export const SendComment = async (params) => {
  return request({
    url: '/comment',
    params: withCookie({t: params?.t, type: params?.type, id: params?.id, content: params?.content, commentId: params?.commentId }),
    method: 'post',
  }).then((res) => res.data)
}