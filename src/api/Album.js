import { request } from '@/api/request';

export const GetAlbum = async (param) => {
    return request({
        url: '/album',
        params: {id: param}
    }).then((res) => res.data)
}


export const GetArtistAlbum = async (params) => {
    return request({
        url: '/artist/album',
        params: {id: params?.id, limit: params?.limit || 20, offset: params?.offset },
    }).then((res) => res.data)
}