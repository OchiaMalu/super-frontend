// 用户相关类型
export interface User {
    id: number;
    userAccount: string;
    username: string;
    gender: number | string;
    phone: string;
    email: string;
    role: number | string;
    status: number | string;
    avatarUrl: string;
    profile?: string;
}

export interface UserResponse {
    code: number;
    data: {
        records: User[];
        current: number;
        size: number;
        total: number;
    };
    description?: string;
}

export interface AddUserForm {
    userAccount: string;
    phone: string;
    userPassword: string;
}

export interface UpdateUserForm {
    id: number;
    username: string;
    gender: string;
    phone: string;
    email: string;
    profile: string;
    role: string;
}

// 登录相关类型
export interface LoginForm {
    userAccount: string;
    userPassword: string;
}

export interface LoginResponse {
    code: number;
    data: string;
    description?: string;
}

// 导航菜单相关类型
export interface MenuItem {
    path: string;
    icon?: any; // 由于 element-plus 的图标类型较复杂，这里暂时使用 any
    title: string;
}

// 图表相关类型
export interface ChartData {
    weeklyUser: number[];
    sourceAnalysis: Array<{
        value: number;
        name: string;
    }>;
    monthlyUser: {
        estimated: number[];
        actual: number[];
    };
}

export interface ChartResponse {
    code: number;
    data: ChartData;
    description?: string;
}

// 配置相关类型
export interface FileItem {
    name: number;
    url: string;
    status?: string;
}

// API 通用响应类型
export interface ApiResponse<T = any> {
    code: number;
    data: T;
    description?: string;
}
