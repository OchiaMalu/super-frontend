export type BlogType = {
    userId: number,
    title: string,
    content: string,
    images?: string,
    likedNum: number,
    commentsNum: number,
    createTime: Date,
    updateTime: Date
}