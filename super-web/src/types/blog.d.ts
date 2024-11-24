import type { UserType } from './user';

export interface BlogType {
  id: number;
  title: string;
  content: string;
  author: UserType;
  userId: number;
  likedNum: number;
  commentsNum: number;
  isLike: boolean;
  createTime: string;
  updateTime: string;
  isDelete: boolean;
} 