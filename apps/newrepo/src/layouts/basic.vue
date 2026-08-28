<script lang="ts" setup>
import type { NotificationItem } from '@vben/chc-ui';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  AntdMessageOutlined,
  AntdPrinterOutlined,
  AntdRedoOutlined,
  AntdRetweetOutlined,
  AntdUserOutlined,
  SvgLaRobot,
} from '@vben/chc-icons';
import { Notification, useAsyncModal } from '@vben/chc-ui';
import { useVbenModal } from '@vben/common-ui';
import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { useWatermark } from '@vben/hooks';
import {
  BasicLayout,
  LockScreen,
  // Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import {
  useAccessStore,
  useGlobalPrintStore,
  useUserStore,
} from '@vben/stores';

import { VbenButton } from '@vben-core/shadcn-ui';

import { useFullscreen } from '@vueuse/core';

import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons-vue';

import { getWarehouseInfoByOrgId, readMessage } from '#/api/core/user';
import AiAssistant from '#/components/aiAssistant/index.vue';
import ChangePrinterAndLabel from '#/components/common/changePrinterAndLabel.vue';
import ChooseInstitutionAndWarehouse from '#/components/common/chooseInstitutionAndWarehouse.vue';
import ForcePasswordChangeContent from '#/components/force-password-change-modal/index.vue';
import ViewMessageModal from '#/components/common/viewMessageModal.vue';
import { openGlobalGuide } from '#/components/guideViews/globalGuide';
import { CAN_USE_SILENCE_PRINT, SHOW_MESSAGE_MODULE } from '#/const';
import { useInstitutionAndWarehouse } from '#/hooks/common/useInstitutionAndWarehouse';
import { router as routerInstance } from '#/router';
import { useAuthStore } from '#/store';
import { useMessageStore } from '#/store/message';
import LoginForm from '#/views/_core/authentication/login.vue';

// 隐藏头部全屏按钮
// preferences.widget.fullscreen = false;

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

const institutionAppellation = import.meta.env.VITE_INSTITUTION_APPELLATION;
const messageStore = useMessageStore();
const notificationShow = ref(false);
const notificationRef = ref();
const asyncModal = useAsyncModal();
const router = useRouter();
// 定义打开切换机构仓库modal方法
const chooseInstitutionAndWarehouse = useInstitutionAndWarehouse(
  ChooseInstitutionAndWarehouse,
  { closable: true },
  import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true',
).openModal;
const loginInchooseInstitutionAndWarehouse = useInstitutionAndWarehouse(
  ChooseInstitutionAndWarehouse,
  { closable: false },
  import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true',
).openModal;
const userStore = useUserStore();

// 开启静默打印初始化
const globalPrintStore = useGlobalPrintStore();
const env = import.meta.env.PROD ? 'prod' : 'dev';
const appVersion = import.meta.env.VITE_APP_VERSION;
const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}-${userStore.userInfo?.id}`;
globalPrintStore.initPrintStatus(
  namespace,
  CAN_USE_SILENCE_PRINT,
  routerInstance,
);

const orgAndWarehouseInfo = computed(() => {
  return import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true'
    ? `${userStore.userInfo?.orgName}  仓库：${userStore.userInfo?.warehouseName}`
    : `${userStore.userInfo?.orgName}`;
});

if (SHOW_MESSAGE_MODULE) {
  // 首次加载获取接口未读消息列表
  messageStore.initMessageList().then(() => {
    import.meta.env.VITE_WEBSOCKET_ENABLE === 'true'
      ? messageStore.startWebsocket()
      : messageStore.startQueryMessageInterval();
  });
}

const notifications = computed({
  get() {
    return messageStore.messageList;
  },
  set(val) {
    messageStore.setMessageList(val);
  },
});
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

/** 强制修改密码弹窗 */
const [ForcePasswordModal, forcePasswordModalApi] = useVbenModal({
  connectedComponent: ForcePasswordChangeContent,
  closable: false,
  closeOnClickModal: false,
  closeOnPressEscape: false,
  footer: false,
  fullscreenButton: false,
  title: '密码安全提示',
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      sessionStorage.removeItem('FORCE_PASSWORD_CHANGE');
      // 弹窗关闭，说明密码修改成功，触发退出登录
      authStore.logout(true);
    }
  },
});

/** 监听是否需要强制修改密码 */
watch(
  () => authStore.showForcePasswordChange,
  (show) => {
    if (show) {
      setTimeout(() => {
        forcePasswordModalApi.open();
      }, 200);
    }
  },
  { immediate: true },
);

const menus = computed(() => {
  const arr = [];
  arr.push({
    handler: () => {
      router.push('/Profile');
    },
    icon: AntdUserOutlined,
    text: '个人中心',
  });
  // 全屏切换菜单项
  arr.push({
    handler: toggleFullscreen,
    icon: isFullscreen.value ? FullscreenExitOutlined : FullscreenOutlined,
    text: isFullscreen.value ? '退出全屏' : '全屏显示',
  });
  if (
    import.meta.env.VITE_CHOOSE_INSTITUTION === 'inner' ||
    import.meta.env.VITE_CHOOSE_INSTITUTION === 'false'
  ) {
    arr.push({
      handler: async () => {
        const { form, isOrgChange, isWarehouseChange } =
          await chooseInstitutionAndWarehouse(
            userStore.userInfo as UserInfoExt,
          );
        if (import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true') {
          const env = import.meta.env.PROD ? 'prod' : 'dev';
          const appVersion = import.meta.env.VITE_APP_VERSION;
          const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;
          // 将仓库id和仓库名称存到本地存储localStorage中
          localStorage.setItem(
            `${namespace}-${userStore.userInfo?.id}-warehouseInfo`,
            JSON.stringify({
              warehouseId: form.warehouseId,
              warehouseName: form.warehouseName,
            }),
          );
        }
        if (isOrgChange || isWarehouseChange) {
          window.location.reload();
        }
      },
      icon: AntdRetweetOutlined,
      text:
        import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true'
          ? `切换${institutionAppellation}和仓库`
          : `切换${institutionAppellation}`,
    });
  }
  // arr.push({
  //   handler: async () => {
  //     await asyncModal.openModal(
  //       ChangePassword,
  //       {
  //         onSubmit: async () => {
  //           await authStore.logout(true);
  //         },
  //       },
  //       {
  //         width: '500px',
  //       },
  //     );
  //   },
  //   icon: AntdKeyOutlined,
  //   text: '修改密码',
  // });
  if (SHOW_MESSAGE_MODULE) {
    arr.push({
      handler: () => {
        router.push('/MyMessage');
      },
      icon: AntdMessageOutlined,
      text: '我的消息',
    });
  }
  arr.push(
    {
      handler: () => {
        showAiAssistant.value = !showAiAssistant.value;
      },
      icon: SvgLaRobot,
      text: `${showAiAssistant.value ? '关闭' : '打开'}AI助手`,
    },
    {
      handler: () => {
        aiPosition.value = aiPosition.value === 'fixed' ? 'header' : 'fixed';
      },
      icon: SvgLaRobot,
      text:
        aiPosition.value === 'fixed'
          ? `让AI助手显示到顶部`
          : '让AI助手悬浮展示',
    },
    // {
    //   handler: () => {
    //     aiChatType.value = aiChatType.value === 'td' ? 'antdx' : 'td';
    //     sessionStorage.setItem(`${namespace}-AITYPE`, aiChatType.value);
    //     // window.location.reload();
    //   },
    //   icon: AntdRetweetOutlined,
    //   text:
    //     aiChatType.value === 'td'
    //       ? '切换到antd-x组件(开发中...)'
    //       : '切换到TDesign组件',
    // },
  );

  if (CAN_USE_SILENCE_PRINT) {
    arr.push({
      handler: () => {
        if (globalPrintStore.onPrinting) {
          return message.warn('打印机正在打印，暂时无法操作');
        } else {
          if (globalPrintStore.isOpenSilencePrint) {
            globalPrintStore.setIsOpenSilencePrint(false);
            globalPrintStore.closePrintSocket();
          } else {
            globalPrintStore.setIsOpenSilencePrint(true);
            globalPrintStore.openPrintSocket(true);
          }
        }
      },
      disabled: true,
      icon: AntdPrinterOutlined,
      text: `${globalPrintStore.isOpenSilencePrint ? '关闭' : '开启'}静默打印功能`,
    });
  }
  if (CAN_USE_SILENCE_PRINT && globalPrintStore.isOpenSilencePrint) {
    arr.push({
      handler: async () => {
        globalPrintStore.isOpenSilencePrint
          ? await asyncModal.openModal(
              ChangePrinterAndLabel,
              {},
              {
                width: '500px',
              },
            )
          : message.warn('请先开启静默打印功能');
      },
      icon: AntdRedoOutlined,
      text: '切换打印机和标签',
    });
  }
  return arr;
});
const handleOrgChange = async () => {
  const { form, isOrgChange, isWarehouseChange } =
    await chooseInstitutionAndWarehouse(userStore.userInfo as UserInfoExt);
  if (import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true') {
    const env = import.meta.env.PROD ? 'prod' : 'dev';
    const appVersion = import.meta.env.VITE_APP_VERSION;
    const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;
    // 将仓库id和仓库名称存到本地存储localStorage中
    localStorage.setItem(
      `${namespace}-${userStore.userInfo?.id}-warehouseInfo`,
      JSON.stringify({
        warehouseId: form.warehouseId,
        warehouseName: form.warehouseName,
      }),
    );
  }
  if (isOrgChange || isWarehouseChange) {
    window.location.reload();
  }
};
const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}
/**
 * 清空已读
 */
function handleNoticeClear() {
  notifications.value = notifications.value.filter((item) => !item.isRead);
}
/**
 * 全部标记已读
 */
function handleMakeAll() {
  // notifications.value.forEach((item) => (item.isRead = true));
  Promise.all(
    notifications.value.map((item) =>
      readMessage([item.id as number]).then(() => item),
    ),
  )
    .then(() => {
      notifications.value.forEach((item) => (item.isRead = true));
    })
    .catch(() => {
      messageStore.initMessageList();
    });
}
/**
 * 当前项标记已读
 */
async function handleRead(item: NotificationItem) {
  notificationShow.value = true;
  await asyncModal
    .openModal(
      ViewMessageModal,
      {
        showBtns: !item.isRead,
        messageInfo: item,
        onSubmit: (resolve: any, modalApi: any, val: string) => {
          resolve(val);
          modalApi.destroy();
        },
        onCancel: (resolve: any, modalApi: any, val: string) => {
          resolve(val);
          modalApi.destroy();
        },
      },
      {
        onCancel: (reject: PromiseRejectionEvent['reason']) => {
          reject();
        },
      },
    )
    .then((val) => {
      if (item.isRead || val === 'cancel') {
        notificationRef.value.open = true;
        notificationShow.value = false;
      } else {
        readMessage([item.id as number]).then(() => {
          item.isRead = true;
          notificationRef.value.open = true;
          notificationShow.value = false;
        });
      }
    })
    .catch(() => {
      notificationRef.value.open = true;
      notificationShow.value = false;
    });
}
/**
 * 查看所有消息
 */
function handleViewAll() {
  router.push('/MyMessage');
}

// 有仓库信息时，需要根据仓库信息是否只有一项判断打开选择仓库页面
if (import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true') {
  // 当前机构只有一个仓库，不需要打开选择仓库页面
  getWarehouseInfoByOrgId({
    userId: userStore.userInfo?.id,
    dcId: userStore.userInfo?.orgId,
  }).then((res) => {
    if (Array.isArray(res) && res.length === 1) {
      const env = import.meta.env.PROD ? 'prod' : 'dev';
      const appVersion = import.meta.env.VITE_APP_VERSION;
      const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;
      // 直接将第一项保存，并
      // 将仓库id和仓库名称存到本地存储localStorage中
      if (import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true') {
        localStorage.setItem(
          `${namespace}-${userStore.userInfo?.id}-warehouseInfo`,
          JSON.stringify({
            warehouseId: res[0]?.warehouseId,
            warehouseName: res[0]?.warehouseName,
          }),
        );
      }
      userStore.setUserInfo({
        ...(userStore.userInfo as UserInfoExt),
        warehouseId: res[0]?.warehouseId,
        warehouseName: res[0]?.warehouseName,
      });
    } else {
      openModal();
    }
  });
} else {
  // 没有仓库信息时，根据机构是否唯一，判断打开选择机构弹窗
  if (userStore.userInfo?.orgs?.length > 1) {
    openModal();
  }
}

function openModal() {
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;
  const hasChoose = localStorage.getItem(
    `${namespace}-${userStore.userInfo?.id}-hasChooseInstitutionAndWarehouse`,
  );
  if (
    import.meta.env.VITE_CHOOSE_INSTITUTION === 'inner' &&
    hasChoose === 'false'
  ) {
    loginInchooseInstitutionAndWarehouse(
      userStore.userInfo as UserInfoExt,
    ).then(({ form }) => {
      if (import.meta.env.VITE_HAS_WAREHOUSE_INFO === 'true') {
        // 将仓库id和仓库名称存到本地存储localStorage中
        localStorage.setItem(
          `${namespace}-${userStore.userInfo?.id}-warehouseInfo`,
          JSON.stringify({
            warehouseId: form.warehouseId,
            warehouseName: form.warehouseName,
          }),
        );
      }
      userStore.setUserInfo({
        ...(userStore.userInfo as UserInfoExt),
        ...form,
      });
      localStorage.setItem(
        `${namespace}-${userStore.userInfo?.id}-hasChooseInstitutionAndWarehouse`,
        'true',
      );
    });
  }
}
watch(
  () => preferences.app.watermark,
  async (enable) => {
    if (enable) {
      await updateWatermark({
        content: `${userStore.userInfo?.name}/${
          userStore.userInfo?.orgName
        }\n${dayjs().format('YYYY-MM-DD')}\n内部系统，严禁外传`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
onMounted(() => {
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;
  // 直接读 sessionStorage 避免响应式时序问题
  if (sessionStorage.getItem('FORCE_PASSWORD_CHANGE') === 'true') return;
  const hasGuided = localStorage.getItem(
    `${namespace}-${userStore.userInfo?.id}-hasGuided`,
  );
  if (location.pathname.includes('/spd/workspace/') && !hasGuided) {
    openGlobalGuide(`${namespace}-${userStore.userInfo?.id}-hasGuided`);
  }
});
onUnmounted(() => {
  import.meta.env.VITE_WEBSOCKET_ENABLE === 'true'
    ? messageStore.stopWebsocket()
    : messageStore.stopQueryMessageInterval();
});
// AI相关功能
const showAiAssistant = ref(true);
const aiPosition = ref<'fixed' | 'header'>('fixed');
const aiChatType = ref<'antdx' | 'td'>(
  (sessionStorage.getItem(`${namespace}-AITYPE`) as 'antdx' | 'td') || 'antdx',
); // td: 腾讯TDesign，antdx: ant-design-x-vue
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.userRealName || userStore.userInfo?.name"
        :description="userStore.userInfo?.mobile"
        :tag-text="userStore.userInfo?.userType"
        trigger="both"
        @logout="handleLogout"
      />
    </template>
    <template #notification v-if="SHOW_MESSAGE_MODULE">
      <Notification
        ref="notificationRef"
        :dot="showDot"
        :notifications="notifications"
        :show="notificationShow"
        @clear="handleNoticeClear"
        @view-all="handleViewAll"
        @make-all="handleMakeAll"
        @read="handleRead"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
      <!-- 强制修改密码弹窗 -->
      <ForcePasswordModal />
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
    <template #header-right-2>
      <VbenButton
        style="box-shadow: none"
        class="dark:bg-accent dark:hover:bg-accent/90 dark:text-muted-foreground dark:hover:text-foreground relative mr-[25px] h-8 border-none bg-[hsl(var(--header-accent-hover))] py-0.5 text-[hsl(var(--header-foreground))] hover:bg-[hsl(var(--header-accent-active))] hover:text-[hsl(var(--header-accent-foreground))]"
        @click="handleOrgChange"
      >
        {{ orgAndWarehouseInfo }}
        <span class="absolute right-0.5 top-0.5 h-2 w-2 rounded"></span>
        <!-- <AntdRetweetOutlined class="ml-[0.75rem] text-[1rem]" /> -->
      </VbenButton>
    </template>
    <template #header-right-110>
      <AiAssistant
        :position-type="aiPosition"
        :chat-area-type="aiChatType"
        v-model:show="showAiAssistant"
      />
    </template>
  </BasicLayout>
</template>
