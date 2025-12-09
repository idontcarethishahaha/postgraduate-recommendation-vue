import type { ResultVO } from '@/types'
import axios from 'axios'

axios.defaults.baseURL = '/api/'

//axios请求拦截器
axios.interceptors.request.use(req => {
  //从sessionStorage读取token
  const auth = sessionStorage.getItem('token')
  if (auth && req.headers) {
    req.headers.token = auth //添加到请求头
    //通过拦截器自动添加到每个请求
  }
  return req
})

//递归实现反序列化为js对象
const parseObject = <T>(data: T): T => {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => parseObject(item)) as T
    }

    //处理普通对象
    const obj = data as Record<string, unknown>
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        obj[key] = value.map(item => parseObject(item))
      } else if (typeof value === 'object' && value !== null) {
        obj[key] = parseObject(value)
      } else if (typeof value === 'string' && (value.includes('{"') || value.includes('['))) {
        try {
          const parsed = JSON.parse(value)
          obj[key] = parseObject(parsed)
        } catch {
          //解析失败则保持原值
        }
      }
    }
    return obj as T
  }

  return data
}

axios.interceptors.response.use(async resp => {
  if (resp.config.responseType === 'blob' && !resp.headers['content-disposition']) {
    const text = await resp.data.text()
    return Promise.reject(new Error(JSON.parse(text).message))
  }

  const data = resp.data as ResultVO

  if (data.code < 300) {
    resp.data = parseObject(resp.data)
    return resp
  }

  if (data.code >= 400) {
    return Promise.reject(new Error(data.message))
  }
  return resp
})

// 1. 修改请求工具的返回值，返回完整的 ResultVO<T>
export const useGet = async <T>(url: string): Promise<ResultVO<T>> => {
  const resp = await axios.get<ResultVO<T>>(url)
  return resp.data // 返回完整的 { code, message, data }
}

export const usePost = async <T>(url: string, data: unknown): Promise<ResultVO<T>> => {
  const resp = await axios.post<ResultVO<T>>(url, data)
  return resp.data // 返回完整的 ResultVO
}
/*
export const usePut = async <T>(url: string): Promise<ResultVO<T>> => {
  const resp = await axios.put<ResultVO<T>>(url)
  return resp.data
}
*/

//添加 data 参数
export const usePut = async <T>(url: string, data?: unknown): Promise<ResultVO<T>> => {
  const resp = await axios.put<ResultVO<T>>(url, data) // 传递 data 给 axios.put
  return resp.data
}

export const usePatch = async <T>(url: string, data: unknown): Promise<ResultVO<T>> => {
  const resp = await axios.patch<ResultVO<T>>(url, data)
  return resp.data
}

export const useDelete = async <T>(url: string): Promise<ResultVO<T>> => {
  const resp = await axios.delete<ResultVO<T>>(url)
  return resp.data
}

export default axios
