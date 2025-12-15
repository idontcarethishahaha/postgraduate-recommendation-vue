//格式化日期
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('zh-CN')
  } catch {
    return '-'
  }
}
