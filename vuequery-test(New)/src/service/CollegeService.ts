import { usePost } from '@/axios'
import type { College } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
export class CollegeService {
  static addCollege() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (college: College) => usePost('admin/colleges', college),
      onSuccess: () =>
        qc.refetchQueries({
          queryKey: ['colleges']
        })
    })
  }
}
