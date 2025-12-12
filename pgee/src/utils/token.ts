// src/utils/token.ts
/**
 * 自定义JWT载荷类型（匹配后端返回结构）
 * 后端Token包含字段：uid(用户ID)、role(角色)、cid(学院ID)、mcid(辅导员专业类别ID)、mid(学生专业ID)
 */
export interface CustomJwtPayload {
  uid: number // 用户ID（后端Long类型，前端转为number）
  role: string // 角色：ADMIN/COLLEGE_ADMIN/COUNSELOR/STUDENT
  cid?: number // 学院ID（COLLEGE_ADMIN/COUNSELOR/STUDENT有值，ADMIN无）
  mcid?: number // 辅导员专属：专业类别ID
  mid?: number // 学生专属：专业ID
}

/**
 * 解析Token（无需验签，后端已通过拦截器校验，前端仅解析载荷）
 * @returns 解析后的Token载荷 | null
 */
export const parseToken = (): CustomJwtPayload | null => {
  try {
    // 从sessionStorage获取Token（项目原有存储方式）
    const token = sessionStorage.getItem('token')
    if (!token) return null

    // JWT结构：header.payload.signature，仅解析payload部分
    const payloadBase64 = token.split('.')[1]
    if (!payloadBase64) return null

    // Base64解码（处理URL安全的Base64）
    const decodedPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(decodedPayload) as CustomJwtPayload

    // 验证核心字段是否存在
    if (!payload.uid || !payload.role) {
      console.error('Token载荷缺少核心字段：uid/role')
      return null
    }

    return payload
  } catch (error) {
    console.error('Token解析失败：', error)
    return null
  }
}

export const getUserRole = (): string | null => {
  const payload = parseToken()
  return payload?.role || sessionStorage.getItem('role') || null
}

export const getCollegeIdFromToken = (): number | null => {
  const payload = parseToken()
  if (getUserRole() === 'ADMIN') return null
  return payload?.cid || null
}

export const getCollegeIdStrFromToken = (): string => {
  const cid = getCollegeIdFromToken()
  return cid ? cid.toString() : ''
}

export const isCollegeAdmin = (): boolean => {
  return getUserRole() === 'COLLEGE_ADMIN'
}
