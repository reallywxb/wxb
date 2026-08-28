type UserInfoExt = {
  [key: string]: any;
  avatar: string;
  id: number | string;
  mobile: string;
  name: string;
  orgId: number | string;
  orgName: string;
  orgs: { id: number | string; name: string }[];
  permissions: string[];
  realName: string;
  roles?: string[];
  token: string;
  userId: string;
  username: string;
  userType: string;
  warehouseId?: number | string;
  warehouseName?: string;
};

type UpdatePasswordParam = {
  newpassword1: string;
  newpassword2: string;
  password: string;
};
type updateUserInfoParams = {
  avatar: string;
  mobile: string;
  name: string;
  username: string;
};
