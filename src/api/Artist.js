import { request } from "./request"

//获取热门歌手
export const HotArtist = async (params) => {
    return request({
        url: '/top/artists',
        params: {limit: params?.limit || 10, offset: params?.offset},
    }).then((res) => res.data)
}

export const GetArtist = async (param) => {
    return request({ 
        url: '/artists',
        params: {id: param},
    }).then((res) => res.data)
}

export const GetArtistSongs = async (param) => {
    return request({
        url: '/artist/songs',
        params: {id: param.id, offset: param.offset, limit: param.limit},
    }).then((res) => res.data)
}

export const GetArtistList = async (params) => {
    return request({
        url: '/artist/list',
        params: {type: params?.type, area: params?.area, limit: params?.limit, offset: params?.offset, initial: params?.initial}
    }).then((res) => res.data)
}