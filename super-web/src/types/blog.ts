export interface BlogType {
    id: number;
    author: {
        id: number;
        username: string;
        avatarUrl: string;
        isFollow: boolean;
    };
    userId: number;
    title: string;
    content: string;
    images?: string;
    likedNum: number;
    isLike: boolean;
    coverImage?: string;
    commentsNum: number;
    createTime: Date;
    updateTime: Date;
} 