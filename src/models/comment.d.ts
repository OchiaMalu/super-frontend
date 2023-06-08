import {UserType} from "./user";

export type CommentType = {
    id: number,
    userId: number,
    commentUser: UserType,
    blog_id: number,
    parentId?: number,
    answerId?: number,
    content: string,
    likedNum: number,
    status: number,
    createTime: Date,
    updateTime: Date
}
