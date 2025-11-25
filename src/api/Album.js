import { request } from '@/api/request';

export const GetAlbum = async (param) => {
    return request({
        url: '/album',
        params: {id: param}
    }).then((res) => res.data)
}