import { ElLoading } from 'element-plus'

// 函数重载
export function createElLoading<T>(pro: Promise<T>): Promise<T>
export function createElLoading(pro?: undefined): ReturnType<typeof ElLoading.service>

// 函数实现
export function createElLoading<T>(
  pro?: Promise<T>
): Promise<T> | ReturnType<typeof ElLoading.service> {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  if (!pro) {
    return loading
  }
  return pro.then(
    result => {
      if (loading) {
        loading.close()
      }
      return result
    },
    error => {
      if (loading) {
        loading.close()
      }
      throw error
    }
  )
}
