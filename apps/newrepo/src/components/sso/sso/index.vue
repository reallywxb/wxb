<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAccessStore, useSsoStore } from '@vben/stores';

import { Modal } from 'ant-design-vue';

import { DEFAULT_HOME_PATH } from '#/const';

import { ssoLogin } from '../api';

const ssoStore = useSsoStore();
type ssoLoginParams = {
  businessKey: string;
  processInstanceId: string;
  siteCode: string;
  taskId: string;
  yycode: string;
};

const paramsStr = window.location.href
  ? window.location.href.split('?')[1]
  : '';

if (paramsStr) {
  const paramsArr: string[] = paramsStr.split('&');
  const searchStrObj: { [key: string]: string } = {};
  for (const element of paramsArr) {
    const key: string = element.split('=')[0] as string;
    const value: string = element.split('=')[1] as string;
    searchStrObj[key] = value;
  }
  const siteCode = ref('');
  if ('siteCode' in searchStrObj) {
    siteCode.value = searchStrObj.siteCode;
  }
  const yycode = ref('');
  if ('yycode' in searchStrObj) {
    yycode.value = searchStrObj.yycode;
  }
  const businessKey = ref('');
  if ('businessKey' in searchStrObj) {
    businessKey.value = searchStrObj.businessKey;
  }
  const taskId = ref('');
  if ('taskId' in searchStrObj) {
    taskId.value = searchStrObj.taskId;
  }
  const processInstanceId = ref('');
  if ('processInstanceId' in searchStrObj) {
    processInstanceId.value = searchStrObj.processInstanceId;
  }
  const suffix = ref('');
  if ('suffix' in searchStrObj) {
    suffix.value = searchStrObj.suffix;
  }
  if ('isInYongyou' in searchStrObj) {
    searchStrObj.isInYongyou === 'true'
      ? ssoStore.setIsInPortal(true)
      : ssoStore.setIsInPortal(false);
  }
  const params = {
    siteCode: siteCode.value,
    yycode: yycode.value,
    businessKey: businessKey.value,
    taskId: taskId.value,
    processInstanceId: processInstanceId.value,
  };
  ssoStore.setIsFromPortal(true);
  useSsoLogin(params);
  async function useSsoLogin(params: ssoLoginParams) {
    const router = useRouter();
    const res = await ssoLogin(params);
    // console.log('useSsoLogin', res);
    if (res.data && res.data.accessToken && res.data.accessToken.token) {
      // 返回了token的场景
      const accessStore = useAccessStore();
      accessStore.setAccessToken(res.data.accessToken.token);
      if ('menuRoot' in searchStrObj) {
        ssoStore.setMenuRoot(searchStrObj.menuRoot);
      }
      // 判断是否进审批
      if (suffix.value) {
        const { businessKey, taskId, processInstanceId } = searchStrObj;
        const query = {
          taskId: taskId || '',
          businessKey: businessKey || '',
          processInstanceId: processInstanceId || '',
        };
        router.replace({
          path: decodeURIComponent(suffix.value),
          query,
        });
      } else {
        router.replace(DEFAULT_HOME_PATH);
      }
    } else if (res.data && !!res.data.siteUserId && !res.data.accessToken) {
      if (res.msg && res.msg.includes('绑定密码已失效')) {
        Modal.confirm({
          title: '提示',
          content: '绑定密码已失效，请重新登录！',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            // 跳转到绑定密码页面
            const siteUserId = res.data?.siteUserId;
            const query = {
              siteUserId,
            };
            router.replace({
              path: './ssologin/login',
              query: {
                requestObj: JSON.stringify(query),
                params: JSON.stringify(params),
                suffix: suffix.value,
                searchStrObj: JSON.stringify(searchStrObj),
              },
            });
          },
          onCancel: () => {
            window.close();
          },
        });
      } else {
        const siteUserId = res.data?.siteUserId;
        const query = {
          siteUserId,
        };
        router.replace({
          path: './ssologin/login',
          query: {
            requestObj: JSON.stringify(query),
            params: JSON.stringify(params),
            suffix: suffix.value,
            searchStrObj: JSON.stringify(searchStrObj),
          },
        });
      }
    } else {
      let message = '';
      message = res && res.msg ? res.msg : '出现不明原因错误';
      Modal.confirm({
        title: '提示',
        content: `${message}，请使用账号密码登录？`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          router.replace('/auth/login');
        },
        onCancel: () => {
          window.close();
        },
      });
    }
  }
}
</script>
<template>
  <div></div>
</template>
<style scoped></style>
