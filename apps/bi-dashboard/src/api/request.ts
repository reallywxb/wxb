import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const request: AxiosInstance = axios.create({
  baseURL: '/spd-bi-api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    // if (res.code !== 0) {
    //   console.error('[API Error]', res.message)
    //   return Promise.reject(new Error(res.message || '请求失败'))
    // }
    // console.log(res);
    return res;
  },
  (error) => {
    console.error('[Request Error]', error.message)
    return Promise.reject(error)
  },
)

export default request

// 便捷请求函数
export function get<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  return request
    .get<{ code: number; data: T; msg: string }>(url, { params, ...config })
    .then((res) => res.data as T);
}

export function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return request
    .post<{ code: number; data: T; msg: string }>(url, data, config)
    .then((res) => res.data as T);
}
