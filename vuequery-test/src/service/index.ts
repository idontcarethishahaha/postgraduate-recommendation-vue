import axios from '@/axios'
import type { College } from '@/types'

export const getAllCollege = async (): Promise<College[]> => {
  const { data } = await axios.get('/open/colleges')
  return data.data
}
