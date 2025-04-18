export interface TeamType {
    id: number;
    name: string;
    description: string;
    coverImage: string;
    expireTime?: Date;
    maxNum: number;
    password?: string;
    status: number;
    userId: number;
    leaderName: string;
    hasJoin: boolean;
    hasJoinNum: number;
    createTime: Date;
    updateTime: Date;
    joinedUserAvatars?: string[];
} 