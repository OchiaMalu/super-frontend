import { AxiosInstance } from 'axios';
import type { ApiResponse } from '../types/user';

export type MyAxiosResponse<T> = ApiResponse<T>;

declare const myAxios: AxiosInstance;
export default myAxios;
