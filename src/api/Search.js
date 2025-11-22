import { request } from "@/api/request";


//获取搜索结果
export const GetSearchData = async (param) => {
    return request({
        url: '/search',
        params: {keywords: param.keyword, type: param.type, limit: param.limit || 30},
    }).then((res) => res.data)
}