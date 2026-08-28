<script setup lang="ts">
/**
 * 强制修改密码弹窗内容组件
 * 用于登录密码不符合安全要求时强制用户修改密码
 * 配合父组件的 useVbenModal({ connectedComponent }) 使用
 * @date 2026-08-14
 * @prompt 登录密码不符合安全要求时强制弹窗修改密码
 * @description 展示安全提示，内嵌 secure-setting 组件，父级已禁用所有关闭途径
 */
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import SecureSetting from '#/views/system/profile/components/secure-setting.vue';

defineOptions({ name: 'ForcePasswordChangeModal' });

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    // 不使用默认确认按钮行为
  },
  onCancel() {
    // 父级已禁用关闭，这里不需要处理
  },
});

/**
 * 密码修改成功回调
 */
function handlePasswordChanged() {
  message.success('密码修改成功，正在跳转到登录页...');
  // 关闭弹窗（父级 onOpenChange 会处理退出登录）
  modalApi.close();
}
</script>

<template>
  <Modal title="密码安全提示" width="600px">
    <div class="mb-4">
      <p class="text-[16px] font-medium text-[#e6a23c]">
        您的密码不符合安全要求
      </p>
      <p class="mt-2 text-sm text-gray-500">
        密码必须同时包含大写字母、小写字母、数字和特殊符号，且长度不少于8位。请立即修改密码。
      </p>
    </div>
    <SecureSetting in-modal @password-changed="handlePasswordChanged" />
  </Modal>
</template>
