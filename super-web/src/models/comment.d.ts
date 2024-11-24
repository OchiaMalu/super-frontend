export type CommentType = {
    id: number;
    content: string;
    userId: number;
    commentUser: {
        id: number;
        username: string;
        avatarUrl: string;
    };
    blogId: number;
    isLiked: boolean;
    likedNum: number;
    createdTime: string;
    replyNum: number;
    parentId: number | null;
}
