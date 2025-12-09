/**
 * 缓存键常量定义（统一管理 Vue Query 的 queryKey）
 * 格式：模块.功能:唯一标识，确保与服务层请求逻辑严格对应
 */
export const querycachename = {
  // 学院模块缓存键（与 CollegeService 严格绑定）
  college: {
    list: 'college:list', // 学院列表缓存键（必须与请求逻辑中的 queryKey 完全一致）
    detail: 'college:detail', // 新增：学院详情缓存键（预留扩展）
    admins: 'college:admins' // 新增：学院管理员列表缓存键（与管理页面对应）
  },
  // 其他模块缓存键（按需要补充，保持格式一致）
  major: {
    list: 'major:list',
    byCollege: 'major:byCollege' // 按学院筛选的专业列表
  },
  user: {
    current: 'user:current' // 当前登录用户信息
  }
} as const // 添加 as const 确保类型严格，避免误修改

// 辅助类型：提取缓存键的联合类型（用于服务层类型约束）
export type QueryCacheKey = keyof typeof querycachename
export type CollegeCacheKey = keyof typeof querycachename.college
