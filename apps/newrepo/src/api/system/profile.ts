import { useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { requestClient } from '#/api/request';
/**
 * 更新用户个人主页信息
 * @param data
 * @returns void
 */
export function userProfileUpdate(data: updateUserInfoParams) {
  return requestClient.put('/sys/user/edit', data);
}
/**
 * 保存用户默认页面
 * @param data
 * @returns void
 */
export function saveDefaultPage(data: { userId: string; defaultPage: string }) {
  return requestClient.post('/userBaseHandleAction/saveDefaultPage', data);
}

/**
 * 用户修改密码 (需要加密)
 */
export function userUpdatePassword(data: UpdatePasswordParam) {
  return requestClient.put('/sys/user/password', data);
}
/**
 * 用户更新个人头像
 * @param fileCallback data
 * @returns void
 */
export function userUpdateAvatar(fileCallback: any, profile: UserInfoExt) {
  /** 直接点击头像上传 filename为空 由于后台通过拓展名判断(默认文件名blob) 会上传失败 */
  let { file } = fileCallback;
  const { filename } = fileCallback;
  file = filename ? new File([file], filename) : new File([file], `avatar.png`);
  return new Promise((resolve, reject) => {
    requestClient
      .post(
        '/sys/file/uploadAvatar',
        {
          file,
        },
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      .then((res) => {
        userProfileUpdate({
          avatar: res.fileName,
          mobile: profile.mobile,
          name: profile.name,
          username: profile.username,
        })
          .then((data) => {
            // 调完接口，直接更新store数据
            const userStore = useUserStore();
            userStore.setUserInfo({
              ...userStore.userInfo,
              avatar: res.fileName,
            } as UserInfoExt);
            message.success('更新用户头像成功！');
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}
