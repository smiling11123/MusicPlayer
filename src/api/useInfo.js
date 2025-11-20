import { request } from "./request"
import { withCookie } from "./request"

export const GetUserSubcount = async (params) => {
    return request({
        url: "/user/subcount",
        params: withCookie(),
    }).then((res) => res.data);
}

export const GetUserDetail = async (params) => {
    return request({
        url: "/user/detail",
        params: {uid: params},
    }).then((res) => res.data)
}