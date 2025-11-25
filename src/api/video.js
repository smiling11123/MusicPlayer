import { request } from "./request";

export const GetVideo = async (param) => {
    return request({
        url: '/video/detail',
        params: { id: param }
    }).then((res) => res.data)
}


//获取视频播放链接
export const GetVideoUrl = async (param) => {
    return request({
        url: '/video/url',
        params: { id: param }
    }).then((res) => res.data)
}