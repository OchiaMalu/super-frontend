export interface UserType {
  id: number
  username: string
  userAccount: string
  avatarUrl?: string
  gender: number
  phone: string
  email: string
  tags?: string[]
  profile?: string
  createTime: string
  updateTime: string
  status: number
  role: number
  isFollow: boolean
}

export interface ApiResponse<T> {
  code: number
  data: T
  description?: string
} 