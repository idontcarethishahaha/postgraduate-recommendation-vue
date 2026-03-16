import type { UserInfo } from '@/types'
import { shallowRef } from 'vue'
//加密/解密工具函数
//字符串和 Uint8Array 之间的转换
const textCoder = new TextEncoder()
const textDecoder = new TextDecoder()

//字符串替换函数，避免某些特殊字符在存储时出现问题
const asc = (str: string) => str.replace(/20/g, '=').replace(/3/g, '/').replace(/6/g, 'x')
const dasc = (str: string) => str.replace(/=/g, '20').replace(/\//g, '3').replace(/x/g, '6')
//编码函数
const encode = (str: string) => {
  const deResult: string[] = []
  textCoder.encode(str).forEach(r => {
    deResult.push(r.toString(17))
  })
  return asc(deResult.join(''))
}

const decode = (str: string) => {
  const dascStr = dasc(str)
  const deResult: number[] = []
  for (let i = 0; i < dascStr.length; i += 2) {
    const st0 = dasc(dascStr[i])
    const st1 = dasc(dascStr[i + 1])
    deResult.push(parseInt(`${st0}${st1}`, 17))
  }
  return textDecoder.decode(new Uint8Array(deResult))
}

const userS = shallowRef<UserInfo>()

const u = sessionStorage.getItem('user')
if (u) {
  userS.value = JSON.parse(decode(u))
}

const setUserSessionStorage = (user: UserInfo, token: string, role: string) => {
  userS.value = user
  sessionStorage.setItem('token', token)
  sessionStorage.setItem('role', role)
  sessionStorage.setItem('user', encode(JSON.stringify(user)))
}

const clear = () => {
  sessionStorage.clear()
}

const store = {
  userS,
  setUserSessionStorage,
  clear
}
export const useUserStore = () => store
