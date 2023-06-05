export type BlogType = {
    userId: number,
    title: string,
    content: string,
    images?: string,
    likedNum: number,
    isLike: boolean,
    coverImage: string,
    commentsNum: number,
    createTime: Date,
    updateTime: Date
}