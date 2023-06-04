export type UserType={
    id:number,
    username: string,
    userAccount: string,
    avatarUrl?: string,
    profile?: string,
    gender: number,
    phone: string,
    email: string,
    status: number,
    role: number,
    tags: string[],
    createTime: Date,
    updateTime: Date
}