import {UserType} from "./user";

export type TeamType = {
    id: number;
    name: string;
    description: string
    expireTime?: Date;
    maxNum: number;
    password?: string;
    //todo 枚举
    status: number;
    createTime: Date;
    updateTime:Date;
    createUser?:UserType;
}