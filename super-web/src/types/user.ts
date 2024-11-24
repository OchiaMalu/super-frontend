export interface UserType {
    id: number;
    username: string;
    userAccount: string;
    avatarUrl?: string;
    profile?: string;
    gender: number;
    phone: string;
    email: string;
    status: number;
    role: number;
    tags: string[];
    isFollow: boolean;
    userStatus: number;
    userRole: number;
}

export class ApiResponse<T> {
    code: number
    data: T
    description?: string
}
