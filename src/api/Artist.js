import { request } from "./request"

//获取热门歌手
export const HotArtist = async (params) => {
    return request({
        url: '/top/artists',
        params: {limit: params?.limit, offset: params?.offset},
    }).then((res) => res.data)
}