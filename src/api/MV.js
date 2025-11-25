import { request } from "./request";
//获取mv详情
export const GetMV = async (param) => {
    return request({
        url: '/mv/detail',
        params: { mvid: param }
    }).then((res) => res.data)
}

//获取mv播放链接
export const GetMVUrl = async (param) => {
    return request({
        url: '/mv/url',
        params: {id: param, r: 1080}
    }).then((res) => res.data)
}