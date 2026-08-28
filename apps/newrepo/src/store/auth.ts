import type { Recordable } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

// logoutApi
import { getUserInfoApi, loginApi } from '#/api';
import ChooseInstitutionAndWarehouse from '#/components/common/chooseInstitutionAndWarehouse.vue';
import { DEFAULT_HOME_PATH } from '#/const';
import { useInstitutionAndWarehouse } from '#/hooks/common/useInstitutionAndWarehouse';
import { $t } from '#/locales';

type ChooseInstitutionAndWarehouseForm = {
  form: {
    orgId?: number | string;
    orgName?: string;
    warehouseId?: number | string;
    warehouseName?: string;
  };
  isOrgChange: boolean;
  isWarehouseChange: boolean;
};
const chooseInstitutionAndWarehouse = useInstitutionAndWarehouse(
  ChooseInstitutionAndWarehouse,
  import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true',
).openModal;

/**
 * 检查密码是否符合安全要求：
 * 同时包含大写字母、小写字母、数字、特殊符号，且长度不少于8位
 */
function isPasswordComplex(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,}$/;
  return regex.test(password);
}
export { isPasswordComplex };

export const useAuthStore = defineStore('auth', () => {
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);
  /** 是否需要强制修改密码（登录密码不符合安全要求） */
  const showForcePasswordChange = ref(
    sessionStorage.getItem('FORCE_PASSWORD_CHANGE') === 'true',
  );
  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   * @param onSuccess 成功之后的回调函数
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
    onFailed?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfoExt = null;
    try {
      loginLoading.value = true;
      const res: any = await loginApi(params);

      const accessToken = res.access_token || {};

      // 如果成功获取到 accessToken
      if (accessToken) {
        // 获取用户信息并存储到 accessStore 中
        // const [fetchUserInfoResult, accessCodes] = await Promise.all([
        //   fetchUserInfo(),
        //   getAccessCodesApi(),
        // ]);

        const fetchUserInfoResult = await fetchUserInfo(accessToken);

        let form: ChooseInstitutionAndWarehouseForm['form'] = {};
        // 每次登录，都要重新选择机构仓库
        localStorage.setItem(
          `${namespace}-${fetchUserInfoResult.id}-hasChooseInstitutionAndWarehouse`,
          'false',
        );
        // 如果打开了登录时选择机构仓库功能，此时就需要选择机构仓库
        if (import.meta.env.VITE_CHOOSE_INSTITUTION === 'login') {
          const formIn = await chooseInstitutionAndWarehouse(
            fetchUserInfoResult,
            accessToken,
          );
          form = formIn.form;
          if (import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true') {
            // 将仓库id和仓库名称存到本地存储localStorage中
            localStorage.setItem(
              `${namespace}-${fetchUserInfoResult.id}-warehouseInfo`,
              JSON.stringify({
                warehouseId: form.warehouseId,
                warehouseName: form.warehouseName,
              }),
            );
          }
        }
        accessStore.setAccessToken(accessToken);
        // 为了集成ureport，在store设置token时，需同时在localStorage中设置chcit-token
        localStorage.setItem('chcit-token', accessToken);
        userInfo = fetchUserInfoResult;

        userStore.setUserInfo({
          ...userInfo,
          ...form,
        });
        accessStore.setAccessCodes(userInfo.permissions);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          // 检测密码是否符合安全要求，不符合则标记需要强制修改
        if (params.password && !isPasswordComplex(params.password)) {
          showForcePasswordChange.value = true;
          sessionStorage.setItem('FORCE_PASSWORD_CHANGE', 'true');
        }
          onSuccess
            ? await onSuccess?.()
            : await router.push(userInfo.defaultPage || userInfo.homePath || DEFAULT_HOME_PATH);
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }

        
      } else {
        notification.error({
          description: res.msg || res.detailmeg,
          duration: 2,
          message: $t('authentication.loginFailed'),
        });
      }
    } catch {
      onFailed && onFailed();
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }
  async function logout(redirect: boolean = true) {
    try {
      // await logoutApi();
    } catch {
      // 不做任何处理
    }

    resetAllStores();
    accessStore.setLoginExpired(false);
    // 为了集成ureport，在退出登录时，需同时在localStorage中清除chcit-token
    localStorage.removeItem('chcit-token');
    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo(token?: string) {
    let userInfo: null | UserInfoExt = null;
    userInfo = await getUserInfoApi(token);
    // 将仓库信息放到userInfo上
    if (import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true') {
      const midWarehouseInfo = localStorage.getItem(
        `${namespace}-${userInfo.id}-warehouseInfo`,
      );
      const warehouseInfo = midWarehouseInfo
        ? JSON.generalParse(midWarehouseInfo)
        : {};
      if (warehouseInfo.warehouseId) {
        userInfo = {
          ...userInfo,
          warehouseId: warehouseInfo.warehouseId,
          warehouseName: warehouseInfo.warehouseName,
        };
      } else {
        // const warehouseList = await getWarehouseInfoByOrgId(
        //   { userId: userInfo.id, dcId: userInfo.orgId },
        //   token,
        // );
        // // 当前本地存储里没有机构仓库信息，则根据用户机构查一遍，然后取第一项并存到本地存储中
        // if (Array.isArray(warehouseList) && warehouseList.length > 0) {
        //   const firstWarehouse = warehouseList[0];
        //   userInfo = {
        //     ...userInfo,
        //     warehouseId: firstWarehouse?.warehouseId,
        //     warehouseName: firstWarehouse?.warehouseName,
        //   };
        //   // 将仓库id和仓库名称存到本地存储localStorage中
        //   localStorage.setItem(
        //     `${namespace}-${userInfo.id}-warehouseInfo`,
        //     JSON.stringify({
        //       warehouseId: firstWarehouse?.warehouseId,
        //       warehouseName: firstWarehouse?.warehouseName,
        //     }),
        //   );
        // } else {
        //   userInfo = {
        //     ...userInfo,
        //     warehouseId: undefined,
        //     warehouseName: undefined,
        //   };
        // }
      } 
    }
    userStore.setUserInfo(userInfo);
    // 更新用户信息，同时更新权限码
    accessStore.setAccessCodes(userInfo.permissions);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
    showForcePasswordChange.value = false;
    sessionStorage.removeItem('FORCE_PASSWORD_CHANGE');
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
    showForcePasswordChange,
  };
});
