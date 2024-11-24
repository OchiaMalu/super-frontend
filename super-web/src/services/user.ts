import myAxios from '../plugins/my-axios';
import type { UserType, ApiResponse } from '../types/user';

export const getCurrentUser = async (): Promise<UserType> => {
  const res = await myAxios.get<ApiResponse<UserType>>('/user/current');
  return res.data.data;
};
