// components/loading/index.ts
import { ElLoading } from 'element-plus' // 新增：导入 Element Plus 的 ElLoading

// 函数重载 - 声明两种调用方式
export function createElLoading<T>(pro: Promise<T>): Promise<T>
export function createElLoading(pro?: undefined): ReturnType<typeof ElLoading.service>

// 函数实现
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
      // 替换 loading && loading.close() 为 if 判断
      if (loading) {
        loading.close()
      }
      return result
    },
    error => {
      // 替换 loading && loading.close() 为 if 判断
      if (loading) {
        loading.close()
      }
      throw error
    }
  )
}
