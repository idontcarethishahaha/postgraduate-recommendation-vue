import type { Ref } from 'vue'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export function StoreCache(dataR: Ref<any>, replace = false): any {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const val = dataR.value
      if (!replace && val) {
        return dataR
      }
      const result = await originalMethod.apply(this, args)
      dataR.value = result
      return dataR
    }

    return descriptor
  }
}

export function StoreMapCache(dataR: Ref<Map<any, any>>, indexs?: number[]): any {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const val = dataR.value
      let mapKey = args.join('-')
      if (indexs) {
        const temp = indexs.map(i => args[i]).filter(Boolean)
        mapKey = temp.join('-')
      }

      const cached = val.get(mapKey)
      if (cached) {
        return cached
      }

      const result = await originalMethod.apply(this, args)
      val.set(mapKey, result)
      return result
    }

    return descriptor
  }
}

export function StoreClear(...clears: Function[]): any {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      clears.forEach(clear => clear())
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}
