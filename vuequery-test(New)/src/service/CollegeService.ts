import { useDelete, useGet, usePost } from '@/axios'
import type { College } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
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
  /*static listCollegesService() {
    const query = useGet<{ colleges: College[]}[]>('open/colleges')
    return useQuery({ queryKey: ['colleges'], queryFn: () => query })
  }*/

  static listCollegeService() {
    return useQuery<College[], Error>({
      queryKey: ['colleges'],
      queryFn: () => useGet<College[]>('open/colleges')
    })
  }

  static removeCollege() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => useDelete(`admin/colleges/${id}`),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['colleges'] })
      }
    })
  }
}
