export interface CommentType {
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
    replyNum: number;
    parentId: number | null;
    blog?: {
        id: number;
        author: {
            id: number;
            username: string;
        };
        title: string;
        coverImage?: string;
    };
    createTime?: string;
}
